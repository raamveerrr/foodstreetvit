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
import {
  seedOwnerShops,
  type MenuItem,
  type OrderStatus,
  type OwnerShop,
  type ShopAvailability,
} from "./merchant-data";

/**
 * Mock merchant session + shop management state.
 * All mutations are scoped by shop id, mirroring the future
 * "owner may only touch shops they own" authorization model.
 */

export interface MerchantOwner {
  name: string;
  email: string;
}

interface MerchantState {
  authed: boolean;
  owner: MerchantOwner | null;
  shops: OwnerShop[];
  activeShopId: string | null;
}

interface MerchantValue extends MerchantState {
  hydrated: boolean;
  activeShop: OwnerShop | null;
  signIn: (email: string, password: string) => { hasShop: boolean };
  signOut: () => void;
  setActiveShop: (id: string) => void;
  createShop: (shop: OwnerShop) => void;
  updateShop: (patch: Partial<OwnerShop>) => void;
  setAvailability: (a: ShopAvailability) => void;
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (id: string, patch: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  addCategory: (name: string) => void;
  renameCategory: (from: string, to: string) => void;
  deleteCategory: (name: string) => void;
  setOrderStatus: (orderId: string, status: OrderStatus) => void;
}

const STORAGE_KEY = "dfs.merchant.v1";

const MerchantContext = createContext<MerchantValue | null>(null);

const initialState = (): MerchantState => ({
  authed: false,
  owner: null,
  shops: seedOwnerShops(),
  activeShopId: "zuzu",
});

export function MerchantProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MerchantState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState((prev) => ({ ...prev, ...(JSON.parse(raw) as MerchantState) }));
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

  const activeShop = useMemo(
    () => state.shops.find((s) => s.id === state.activeShopId) ?? state.shops[0] ?? null,
    [state.shops, state.activeShopId],
  );

  const patchActive = useCallback(
    (fn: (shop: OwnerShop) => OwnerShop) => {
      setState((prev) => {
        const id = prev.activeShopId ?? prev.shops[0]?.id;
        return { ...prev, shops: prev.shops.map((s) => (s.id === id ? fn(s) : s)) };
      });
    },
    [],
  );

  const signIn = useCallback((email: string, _password: string) => {
    let hasShop = false;
    setState((prev) => {
      hasShop = prev.shops.length > 0;
      return {
        ...prev,
        authed: true,
        owner: { name: email.split("@")[0] ?? "Owner", email },
        activeShopId: prev.activeShopId ?? prev.shops[0]?.id ?? null,
      };
    });
    return { hasShop };
  }, []);

  const signOut = useCallback(() => {
    setState((prev) => ({ ...prev, authed: false, owner: null }));
  }, []);

  const setActiveShop = useCallback((id: string) => {
    setState((prev) => ({ ...prev, activeShopId: id }));
  }, []);

  const createShop = useCallback((shop: OwnerShop) => {
    setState((prev) => ({
      ...prev,
      authed: true,
      owner: prev.owner ?? { name: shop.name, email: shop.email },
      shops: [...prev.shops.filter((s) => s.id !== shop.id), shop],
      activeShopId: shop.id,
    }));
  }, []);

  const updateShop = useCallback(
    (patch: Partial<OwnerShop>) => patchActive((s) => ({ ...s, ...patch })),
    [patchActive],
  );

  const setAvailability = useCallback(
    (availability: ShopAvailability) => patchActive((s) => ({ ...s, availability })),
    [patchActive],
  );

  const addMenuItem = useCallback(
    (item: MenuItem) =>
      patchActive((s) => ({
        ...s,
        categories: s.categories.includes(item.category)
          ? s.categories
          : [...s.categories, item.category],
        menu: [item, ...s.menu],
      })),
    [patchActive],
  );

  const updateMenuItem = useCallback(
    (id: string, patch: Partial<MenuItem>) =>
      patchActive((s) => ({
        ...s,
        menu: s.menu.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      })),
    [patchActive],
  );

  const deleteMenuItem = useCallback(
    (id: string) => patchActive((s) => ({ ...s, menu: s.menu.filter((m) => m.id !== id) })),
    [patchActive],
  );

  const addCategory = useCallback(
    (name: string) =>
      patchActive((s) =>
        s.categories.includes(name) ? s : { ...s, categories: [...s.categories, name] },
      ),
    [patchActive],
  );

  const renameCategory = useCallback(
    (from: string, to: string) =>
      patchActive((s) => ({
        ...s,
        categories: s.categories.map((c) => (c === from ? to : c)),
        menu: s.menu.map((m) => (m.category === from ? { ...m, category: to } : m)),
      })),
    [patchActive],
  );

  /** Items are never silently dropped — they move to "Uncategorised". */
  const deleteCategory = useCallback(
    (name: string) =>
      patchActive((s) => {
        const moved = s.menu.some((m) => m.category === name);
        const categories = s.categories.filter((c) => c !== name);
        return {
          ...s,
          categories: moved && !categories.includes("Uncategorised")
            ? [...categories, "Uncategorised"]
            : categories,
          menu: s.menu.map((m) =>
            m.category === name ? { ...m, category: "Uncategorised" } : m,
          ),
        };
      }),
    [patchActive],
  );

  const setOrderStatus = useCallback(
    (orderId: string, status: OrderStatus) => {
      patchActive((s) => ({
        ...s,
        orders: s.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
      }));
      toast.success(`Order marked ${status.toLowerCase()}`);
    },
    [patchActive],
  );

  const value: MerchantValue = {
    ...state,
    hydrated,
    activeShop,
    signIn,
    signOut,
    setActiveShop,
    createShop,
    updateShop,
    setAvailability,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    addCategory,
    renameCategory,
    deleteCategory,
    setOrderStatus,
  };

  return <MerchantContext.Provider value={value}>{children}</MerchantContext.Provider>;
}

export function useMerchant() {
  const ctx = useContext(MerchantContext);
  if (!ctx) throw new Error("useMerchant must be used inside MerchantProvider");
  return ctx;
}
