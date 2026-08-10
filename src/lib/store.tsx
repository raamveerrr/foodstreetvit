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
import { FOODS, MOCK_USER, SHOPS, type FoodItem, type User } from "./data";

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

interface AppState {
  user: User;
  cart: CartLine[];
  favourites: string[];
  receipts: Receipt[];
}

interface StoreValue extends AppState {
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
  placeOrder: () => Receipt | null;
  confirmPickup: (receiptId: string) => void;
  logout: () => void;
}

const STORAGE_KEY = "dfs.state.v1";
const DISCOUNT_RATE = 0.05;

const StoreContext = createContext<StoreValue | null>(null);

const seedReceipts = (): Receipt[] => [
  {
    id: "r_seed_1",
    code: "FS-4712",
    shopId: "bites-and-bites",
    shopName: "Bites & Bites",
    counter: "Bites & Bites Counter",
    lines: [
      { name: "Masala Maggi", qty: 1, price: 59 },
      { name: "Grilled Sandwich", qty: 1, price: 89 },
    ],
    total: 141,
    paid: true,
    status: "picked_up",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    pickedUpAt: new Date(Date.now() - 86000000).toISOString(),
  },
];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    user: MOCK_USER,
    cart: [],
    favourites: ["f_chicken_burger", "f_cold_coffee"],
    receipts: seedReceipts(),
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AppState>;
        setState((prev) => ({ ...prev, ...parsed, user: MOCK_USER }));
      }
    } catch {
      /* ignore corrupted local state */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable */
    }
  }, [state, hydrated]);

  const cartItems = useMemo(
    () =>
      state.cart
        .map((line) => {
          const item = FOODS.find((f) => f.id === line.itemId);
          return item ? { item, qty: line.qty } : null;
        })
        .filter(Boolean) as { item: FoodItem; qty: number }[],
    [state.cart],
  );

  const cartCount = cartItems.reduce((n, l) => n + l.qty, 0);
  const subtotal = cartItems.reduce((n, l) => n + l.qty * l.item.price, 0);
  const discount = subtotal > 0 ? Math.round(subtotal * DISCOUNT_RATE) : 0;
  const total = subtotal - discount;

  const cartShop = cartItems[0]
    ? SHOPS.find((s) => s.id === cartItems[0].item.shopId) ?? null
    : null;

  const addToCart = useCallback(
    (item: FoodItem, qty = 1) => {
      setState((prev) => {
        const existingShopId = prev.cart[0]
          ? FOODS.find((f) => f.id === prev.cart[0].itemId)?.shopId
          : undefined;
        const differentShop = existingShopId && existingShopId !== item.shopId;
        const base = differentShop ? [] : prev.cart;
        if (differentShop) {
          toast("Cart updated", {
            description: "Items from another shop were removed.",
          });
        }
        const found = base.find((l) => l.itemId === item.id);
        const cart = found
          ? base.map((l) => (l.itemId === item.id ? { ...l, qty: l.qty + qty } : l))
          : [...base, { itemId: item.id, qty }];
        return { ...prev, cart };
      });
      toast.success(`${item.name} added to cart`);
    },
    [],
  );

  const increment = useCallback((itemId: string) => {
    setState((prev) => ({
      ...prev,
      cart: prev.cart.map((l) => (l.itemId === itemId ? { ...l, qty: l.qty + 1 } : l)),
    }));
  }, []);

  const decrement = useCallback((itemId: string) => {
    setState((prev) => ({
      ...prev,
      cart: prev.cart
        .map((l) => (l.itemId === itemId ? { ...l, qty: l.qty - 1 } : l))
        .filter((l) => l.qty > 0),
    }));
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    const item = FOODS.find((f) => f.id === itemId);
    setState((prev) => ({ ...prev, cart: prev.cart.filter((l) => l.itemId !== itemId) }));
    toast(`${item?.name ?? "Item"} removed from cart`);
  }, []);

  const clearCart = useCallback(() => {
    setState((prev) => ({ ...prev, cart: [] }));
  }, []);

  const isFavourite = useCallback(
    (itemId: string) => state.favourites.includes(itemId),
    [state.favourites],
  );

  const toggleFavourite = useCallback((item: FoodItem) => {
    setState((prev) => {
      const has = prev.favourites.includes(item.id);
      toast(has ? "Removed from favourites" : "Added to favourites");
      return {
        ...prev,
        favourites: has
          ? prev.favourites.filter((id) => id !== item.id)
          : [...prev.favourites, item.id],
      };
    });
  }, []);

  const favouriteItems = useMemo(
    () => state.favourites.map((id) => FOODS.find((f) => f.id === id)).filter(Boolean) as FoodItem[],
    [state.favourites],
  );

  /**
   * One order -> exactly one receipt. The receipt is created only here, on a
   * successful order, and is never regenerated afterwards.
   */
  const placeOrder = useCallback((): Receipt | null => {
    if (cartItems.length === 0 || !cartShop) return null;
    const receipt: Receipt = {
      id: `r_${Date.now()}`,
      code: `FS-${Math.floor(1000 + Math.random() * 8999)}`,
      shopId: cartShop.id,
      shopName: cartShop.name,
      counter: cartShop.counter,
      lines: cartItems.map(({ item, qty }) => ({
        name: item.name,
        qty,
        price: item.price,
      })),
      total,
      paid: true,
      status: "preparing",
      createdAt: new Date().toISOString(),
      pickedUpAt: null,
    };
    setState((prev) => ({ ...prev, cart: [], receipts: [receipt, ...prev.receipts] }));
    return receipt;
  }, [cartItems, cartShop, total]);

  const confirmPickup = useCallback((receiptId: string) => {
    setState((prev) => ({
      ...prev,
      receipts: prev.receipts.map((r) =>
        r.id === receiptId && r.status !== "picked_up"
          ? { ...r, status: "picked_up", pickedUpAt: new Date().toISOString() }
          : r,
      ),
    }));
  }, []);

  const logout = useCallback(() => {
    toast("Logged out");
  }, []);

  const value: StoreValue = {
    ...state,
    hydrated,
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
