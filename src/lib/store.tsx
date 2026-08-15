import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import { getFood, getShop, type FoodItem, type User } from "./data";
import { useCatalog } from "./catalog-store";
import { useAuth } from "./auth-store";
import { getDb, isBrowser } from "./firebase/client";
import { friendlyError } from "./firebase/errors";
import {
  confirmPayment,
  createOrder,
  subscribeStudentOrders,
  validateCart,
  type CartValidationIssue,
} from "./firebase/orders";
import { subscribeStudentReceipts, redeemReceipt } from "./firebase/receipts";
import type { MenuItemDoc, OrderDoc, ReceiptDoc } from "./firebase/types";

export interface CartLine {
  itemId: string;
  qty: number;
}

export interface ReceiptLine {
  name: string;
  qty: number;
  price: number;
}

export type ReceiptStatus = "preparing" | "ready" | "picked_up";

export interface Receipt {
  id: string;
  code: string;
  shopId: string;
  shopName: string;
  counter: string;
  lines: ReceiptLine[];
  total: number;
  paid: boolean;
  status: ReceiptStatus;
  createdAt: string;
  pickedUpAt: string | null;
}

interface StoreValue {
  user: User;
  signedIn: boolean;
  cart: CartLine[];
  favourites: string[];
  receipts: Receipt[];
  orders: OrderDoc[];
  hydrated: boolean;
  cartCount: number;
  cartItems: { item: FoodItem; qty: number }[];
  cartShopName: string | null;
  subtotal: number;
  discount: number;
  total: number;
  addToCart: (item: FoodItem, qty?: number) => void;
  increment: (itemId: string) => void;
  decrement: (itemId: string) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  isFavourite: (itemId: string) => boolean;
  toggleFavourite: (item: FoodItem) => void;
  favouriteItems: FoodItem[];
  /** Validates against the live menu, then places + pays for the order. */
  placeOrder: () => Promise<{ receiptId: string } | null>;
  cartIssues: CartValidationIssue[];
  clearCartIssues: () => void;
  confirmPickup: (receiptId: string) => Promise<void>;
  logout: () => Promise<void>;
}

const CART_KEY = "dfs.cart.v2";
const FAV_KEY = "dfs.favourites.v2";
const DISCOUNT_RATE = 0.05;

const GUEST: User = { id: "", name: "there", email: "", initials: "G" };

const StoreContext = createContext<StoreValue | null>(null);

const tsToIso = (value: unknown): string => {
  const t = value as { toDate?: () => Date } | null;
  if (t && typeof t.toDate === "function") return t.toDate().toISOString();
  return new Date().toISOString();
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const { firebaseUser, profile, ready, logout: authLogout } = useAuth();
  const { foods } = useCatalog();

  const [cart, setCart] = useState<CartLine[]>([]);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [receiptDocs, setReceiptDocs] = useState<ReceiptDoc[]>([]);
  const [cartIssues, setCartIssues] = useState<CartValidationIssue[]>([]);
  const [placing, setPlacing] = useState(false);

  const uid = firebaseUser?.uid ?? null;

  // Cart stays on the device: it is a draft, not backend state.
  useEffect(() => {
    try {
      const rawCart = localStorage.getItem(CART_KEY);
      if (rawCart) setCart(JSON.parse(rawCart) as CartLine[]);
      const rawFav = localStorage.getItem(FAV_KEY);
      if (rawFav) setFavourites(JSON.parse(rawFav) as string[]);
    } catch {
      /* ignore corrupted local state */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      localStorage.setItem(FAV_KEY, JSON.stringify(favourites));
    } catch {
      /* storage unavailable */
    }
  }, [cart, favourites, hydrated]);

  // Favourites follow the account once signed in.
  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    void getDoc(doc(getDb(), "users", uid))
      .then((snap) => {
        const remote = (snap.data() as { favourites?: string[] } | undefined)?.favourites;
        if (!cancelled && Array.isArray(remote) && remote.length) setFavourites(remote);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [uid]);

  // Realtime orders + receipts for this student only.
  useEffect(() => {
    if (!isBrowser || !uid) {
      setOrders([]);
      setReceiptDocs([]);
      return;
    }
    const stopOrders = subscribeStudentOrders(uid, setOrders, (m) => toast.error(m));
    const stopReceipts = subscribeStudentReceipts(uid, setReceiptDocs, (m) => toast.error(m));
    return () => {
      stopOrders();
      stopReceipts();
    };
  }, [uid]);

  const cartItems = useMemo(
    () =>
      cart
        .map((line) => {
          const item = foods.find((f) => f.id === line.itemId);
          return item ? { item, qty: line.qty } : null;
        })
        .filter(Boolean) as { item: FoodItem; qty: number }[],
    [cart, foods],
  );

  const cartCount = cartItems.reduce((n, l) => n + l.qty, 0);
  const subtotal = cartItems.reduce((n, l) => n + l.qty * l.item.price, 0);
  const discount = subtotal > 0 ? Math.round(subtotal * DISCOUNT_RATE) : 0;
  const total = subtotal - discount;

  const firstCartItem = cartItems[0];
  const cartShop = firstCartItem ? getShop(firstCartItem.item.shopId) ?? null : null;

  const addToCart = useCallback(
    (item: FoodItem, qty = 1) => {
      if (!item.available) {
        toast.error(`${item.name} is unavailable right now.`);
        return;
      }
      setCart((prev) => {
        const firstLine = prev[0];
        const existingShopId = firstLine ? getFood(firstLine.itemId)?.shopId : undefined;
        const differentShop = existingShopId && existingShopId !== item.shopId;
        const base = differentShop ? [] : prev;
        if (differentShop) {
          toast("Cart updated", { description: "Items from another shop were removed." });
        }
        const found = base.find((l) => l.itemId === item.id);
        return found
          ? base.map((l) => (l.itemId === item.id ? { ...l, qty: l.qty + qty } : l))
          : [...base, { itemId: item.id, qty }];
      });
      toast.success(`${item.name} added to cart`);
    },
    [],
  );

  const increment = useCallback((itemId: string) => {
    setCart((prev) => prev.map((l) => (l.itemId === itemId ? { ...l, qty: l.qty + 1 } : l)));
  }, []);

  const decrement = useCallback((itemId: string) => {
    setCart((prev) =>
      prev.map((l) => (l.itemId === itemId ? { ...l, qty: l.qty - 1 } : l)).filter((l) => l.qty > 0),
    );
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    const item = getFood(itemId);
    setCart((prev) => prev.filter((l) => l.itemId !== itemId));
    toast(`${item?.name ?? "Item"} removed from cart`);
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const isFavourite = useCallback((itemId: string) => favourites.includes(itemId), [favourites]);

  const toggleFavourite = useCallback(
    (item: FoodItem) => {
      setFavourites((prev) => {
        const has = prev.includes(item.id);
        const next = has ? prev.filter((id) => id !== item.id) : [...prev, item.id];
        toast(has ? "Removed from favourites" : "Added to favourites");
        if (uid) {
          void updateDoc(doc(getDb(), "users", uid), { favourites: next }).catch(() => undefined);
        }
        return next;
      });
    },
    [uid],
  );

  const favouriteItems = useMemo(
    () => favourites.map((id) => foods.find((f) => f.id === id)).filter(Boolean) as FoodItem[],
    [favourites, foods],
  );

  /**
   * Real checkout: the Cloud Function prices the cart and opens a Cashfree
   * payment session, the student pays, and the server — never the browser —
   * decides the order is PAID and issues the single receipt.
   */
  const placeOrder = useCallback(async (): Promise<{ receiptId: string } | null> => {
    if (placing) return null;
    if (!uid || !profile) {
      toast.error("Please sign in to place your order.");
      return null;
    }
    if (cartItems.length === 0 || !cartShop) {
      toast.error("Your cart is empty");
      return null;
    }
    setPlacing(true);
    try {
      setCheckoutStep("validating");
      const check = await validateCart(
        cartShop.id,
        cartItems.map(({ item, qty }) => ({
          itemId: item.id,
          qty,
          price: item.price,
          name: item.name,
        })),
      );
      if (check.issues.length > 0 || !check.shop) {
        setCartIssues(check.issues);
        return null;
      }

      const items = cartItems.map(({ item, qty }) => ({ itemId: item.id, quantity: qty }));
      const idempotencyKey = `${uid}:${cartShop.id}:${items
        .map((l) => `${l.itemId}x${l.quantity}`)
        .sort()
        .join("|")}:${Math.floor(Date.now() / 60000)}`;

      setCheckoutStep("creating");
      const session = await createCheckoutOrder({
        shopId: cartShop.id,
        items,
        idempotencyKey,
        returnUrl: `${window.location.origin}/checkout`,
      });

      if (session.alreadyPaid && session.receiptId) {
        setCart([]);
        return { receiptId: session.receiptId };
      }
      if (!session.paymentSessionId) throw new Error("Payment could not be started.");

      setCheckoutStep("paying");
      await openCashfreeCheckout(session.paymentSessionId, session.environment ?? "sandbox");

      // Authoritative result. The webhook may confirm slightly later, so a
      // pending answer is retried a few times before we call it unresolved.
      setCheckoutStep("verifying");
      for (let attempt = 0; attempt < 6; attempt += 1) {
        const result = await verifyCashfreePayment(session.orderId);
        if (result.status === "SUCCESS" && result.receiptId) {
          setCart([]);
          return { receiptId: result.receiptId };
        }
        if (result.status === "FAILED") {
          toast.error("Payment failed. You have not been charged for this order.");
          return null;
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
      toast("Payment is still processing", {
        description: "Your receipt will appear under Receipts as soon as it clears.",
      });
      return null;
    } catch (err) {
      toast.error(friendlyError(err, "We couldn't complete your order."));
      return null;
    } finally {
      setCheckoutStep("idle");
      setPlacing(false);
    }
  }, [cartItems, cartShop, placing, profile, uid]);


  const confirmPickup = useCallback(async (receiptId: string) => {
    await redeemReceipt(receiptId);
  }, []);

  const logout = useCallback(async () => {
    await authLogout();
    setCart([]);
    toast("Logged out");
  }, [authLogout]);

  /** Receipts are joined with their order so status is always live. */
  const receipts = useMemo<Receipt[]>(() => {
    return receiptDocs.map((r) => {
      const order = orders.find((o) => o.orderId === r.orderId);
      const status: ReceiptStatus =
        r.status === "REDEEMED"
          ? "picked_up"
          : order?.orderStatus === "READY"
            ? "ready"
            : "preparing";
      return {
        id: r.receiptId,
        code: r.receiptNumber,
        shopId: r.shopId,
        shopName: r.shopName,
        counter: r.counter,
        lines: (order?.items ?? []).map((i) => ({
          name: i.name,
          qty: i.quantity,
          price: i.price,
        })),
        total: order?.totalAmount ?? 0,
        paid: order?.paymentStatus === "PAID",
        status,
        createdAt: tsToIso(r.createdAt),
        pickedUpAt: r.redeemedAt ? tsToIso(r.redeemedAt) : null,
      };
    });
  }, [receiptDocs, orders]);

  const user: User = profile
    ? {
        id: profile.uid,
        name: profile.name?.split(" ")[0] ?? "there",
        email: profile.email,
        initials: (profile.name?.trim()?.charAt(0) ?? "S").toUpperCase(),
      }
    : GUEST;

  const value: StoreValue = {
    user,
    signedIn: Boolean(uid),
    cart,
    favourites,
    receipts,
    orders,
    hydrated: hydrated && ready,
    cartCount,
    cartItems,
    cartShopName: cartShop?.name ?? null,
    subtotal,
    discount,
    total,
    addToCart,
    increment,
    decrement,
    removeFromCart,
    clearCart,
    isFavourite,
    toggleFavourite,
    favouriteItems,
    placeOrder,
    cartIssues,
    clearCartIssues: () => setCartIssues([]),
    confirmPickup,
    logout,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
