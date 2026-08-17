import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { getFood, getShop, type FoodItem, type User } from "./data";
import { useCatalog } from "./catalog-store";
import { useAuth } from "./auth-store";
import { supabase } from "./supabase";
import {
  subscribeStudentOrders,
  validateCart,
  createOrder,
  confirmPayment,
  type CartValidationIssue,
} from "./supabase-orders";
import type { OrderDoc } from "./firebase/types";

export interface CartLine {
  itemId: string;
  qty: number;
}

export interface ReceiptLine {
  name: string;
  qty: number;
  price: number;
}

export type CheckoutStep = "idle" | "validating" | "creating" | "paying" | "verifying";

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
  checkoutStep: CheckoutStep;
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
  const [cartIssues, setCartIssues] = useState<CartValidationIssue[]>([]);
  const [placing, setPlacing] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("idle");

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
    void supabase
      .from("users")
      .select("favourites")
      .eq("uid", uid)
      .single()
      .then(({ data }) => {
        if (!cancelled && data?.favourites && Array.isArray(data.favourites)) {
          setFavourites(data.favourites);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [uid]);

  // Realtime orders for this student only.
  useEffect(() => {
    if (typeof window === "undefined" || !uid) {
      setOrders([]);
      return;
    }
    const stopOrders = subscribeStudentOrders(uid, setOrders, (m) => toast.error(m));
    return () => {
      stopOrders();
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
          void supabase.from("users").update({ favourites: next }).eq("uid", uid);
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
      setCheckoutStep("creating");

      // 1. Call Secure Supabase Edge Function to securely calculate prices & validate availability
      const payload = {
        shopId: cartShop.id,
        items: cartItems.map(l => ({ itemId: l.item.id, quantity: l.qty })),
        customerName: profile.name,
        customerEmail: profile.email
      };

      const { data: createResponse, error: createError } = await supabase.functions.invoke("create-cashfree-order", {
        body: payload
      });

      if (createError || !createResponse) {
        throw new Error("Unable to reach payment gateway. Please try again.");
      }

      if (!createResponse.success) {
        throw new Error(createResponse.message || "Order creation failed.");
      }

      setCheckoutStep("paying");
      const { payment_session_id, order_id } = createResponse;

      // 2. Load Cashfree SDK dynamically to reduce initial bundle size
      // @ts-ignore
      const { load } = await import('@cashfreepayments/cashfree-js');
      const cashfree = await load({ mode: "sandbox" });

      // 3. Trigger Secure Overlay Checkout
      return new Promise((resolve, reject) => {
        cashfree.checkout({
          paymentSessionId: payment_session_id,
          returnUrl: `${window.location.origin}/checkout?cf_order_id=${order_id}&cf_verify=true`,
        }).then(() => {
          // It might not resolve here since returnUrl redirects
        }).catch((err: any) => {
          console.error(err);
          reject(new Error("Checkout failed to initialize"));
        });
      });

    } catch (err) {
      const msg = err instanceof Error ? err.message : "We couldn't complete your order.";
      toast.error(msg);
      return null;
    } finally {
      setCheckoutStep("idle");
      setPlacing(false);
    }
  }, [cartItems, cartShop, placing, profile, uid]);

  const confirmPickup = useCallback(async (receiptId: string) => {
    // Stub receipt redemption
    await supabase.from("orders").update({ order_status: "COMPLETED" }).eq("receipt_id", receiptId);
  }, []);

  const logout = useCallback(async () => {
    await authLogout();
    setCart([]);
    toast("Logged out");
  }, [authLogout]);

  /** Receipts are mapped directly from paid orders */
  const receipts = useMemo<Receipt[]>(() => {
    return orders
      .filter((o) => o.receiptId)
      .map((order) => {
        const status: ReceiptStatus =
          (order.paymentStatus as any) === "REDEEMED" || order.orderStatus === "COMPLETED"
            ? "picked_up"
            : order.orderStatus === "READY"
              ? "ready"
              : "preparing";
        return {
          id: order.receiptId!,
          code: order.orderNumber,
          shopId: order.shopId,
          shopName: order.shopName,
          counter: `${order.shopName} Counter`,
          lines: (order.items ?? []).map((i) => ({
            name: i.name,
            qty: i.quantity,
            price: i.price,
          })),
          total: order.totalAmount ?? 0,
          paid: order.paymentStatus === "PAID" || (order.paymentStatus as any) === "REDEEMED",
          status,
          createdAt: String(order.createdAt),
          pickedUpAt: status === "picked_up" ? String(order.updatedAt) : null,
        };
      });
  }, [orders]);

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
    checkoutStep,
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
