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
import { useAuth } from "./auth-store";
import {
  createCategory,
  createMenuItem,
  createShopDoc,
  deleteCategory as deleteCategoryDoc,
  deleteMenuItem as deleteMenuItemDoc,
  renameCategory as renameCategoryDoc,
  reserveShopId,
  setShopStatus,
  subscribeCategories,
  subscribeMenu,
  subscribeOwnerShops,
  updateMenuItem as updateMenuItemDoc,
  updateShopDoc,
} from "./supabase-shops";
import { setOrderStatus as setOrderStatusDoc, subscribeShopOrders } from "./supabase-orders";
import type {
  CategoryDoc,
  MenuItemDoc,
  OrderDoc,
  OrderStatus as BackendOrderStatus,
  ShopDoc,
  ShopStatus,
} from "./firebase/types";
import {
  defaultHours,
  type MenuItem,
  type OrderStatus,
  type OwnerShop,
  type ShopAvailability,
  type ShopCustomer,
  type ShopOrder,
} from "./merchant-data";

/**
 * Merchant state, backed by Firestore.
 *
 * Every listener is filtered by `ownerId` / `shopId`, and Security Rules apply
 * the same restriction server-side — an owner can never read or write another
 * shop's menu, orders or customers.
 */

export interface MerchantOwner {
  name: string;
  email: string;
}

export interface CreateShopInput {
  name: string;
  description: string;
  category: string;
  phone: string;
  email: string;
  campus: string;
  prepTime: string;
  hours: OwnerShop["hours"];
  logo: { url: string; publicId: string } | null;
  cover: { url: string; publicId: string } | null;
}

interface MerchantValue {
  hydrated: boolean;
  authed: boolean;
  loading: boolean;
  owner: MerchantOwner | null;
  shops: OwnerShop[];
  activeShopId: string | null;
  activeShop: OwnerShop | null;
  setActiveShop: (id: string) => void;
  signOut: () => Promise<void>;
  createShop: (input: CreateShopInput) => Promise<string>;
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

const MerchantContext = createContext<MerchantValue | null>(null);

const AVAILABILITY_TO_STATUS: Record<ShopAvailability, ShopStatus> = {
  open: "OPEN",
  closed: "CLOSED",
  unavailable: "TEMPORARILY_UNAVAILABLE",
};

const STATUS_TO_AVAILABILITY: Record<ShopStatus, ShopAvailability> = {
  OPEN: "open",
  CLOSED: "closed",
  TEMPORARILY_UNAVAILABLE: "unavailable",
};

/** A paid order is "NEW" work for the counter; unpaid orders never appear. */
const toUiStatus = (s: BackendOrderStatus): OrderStatus | null => {
  switch (s) {
    case "PAID":
      return "NEW";
    case "ACCEPTED":
    case "PREPARING":
    case "READY":
    case "COMPLETED":
    case "CANCELLED":
      return s;
    default:
      return null;
  }
};

const toBackendStatus = (s: OrderStatus): BackendOrderStatus => (s === "NEW" ? "PAID" : s);

const tsToIso = (value: unknown): string => {
  const t = value as { toDate?: () => Date } | null;
  if (t && typeof t.toDate === "function") return t.toDate().toISOString();
  return new Date().toISOString();
};

const relativeDay = (iso: string) => {
  const days = Math.floor((Date.now() - Date.parse(iso)) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
};

const buildCustomers = (orders: OrderDoc[]): ShopCustomer[] => {
  const map = new Map<string, ShopCustomer & { last: number }>();
  for (const o of orders) {
    if (o.paymentStatus !== "PAID") continue;
    const created = Date.parse(tsToIso(o.createdAt));
    const found = map.get(o.studentId);
    if (found) {
      found.orders += 1;
      found.spent += o.totalAmount;
      if (created > found.last) {
        found.last = created;
        found.lastOrder = relativeDay(new Date(created).toISOString());
      }
    } else {
      map.set(o.studentId, {
        id: o.studentId,
        name: o.studentName || "Student",
        initials: (o.studentName || "S").charAt(0).toUpperCase(),
        orders: 1,
        spent: o.totalAmount,
        lastOrder: relativeDay(new Date(created).toISOString()),
        last: created,
      });
    }
  }
  return [...map.values()].sort((a, b) => b.spent - a.spent).map(({ last: _last, ...c }) => c);
};

export function MerchantProvider({ children }: { children: ReactNode }) {
  const { firebaseUser, profile, ready, logout } = useAuth();
  const uid = firebaseUser?.uid ?? null;

  const [shopDocs, setShopDocs] = useState<ShopDoc[]>([]);
  const [shopsLoaded, setShopsLoaded] = useState(false);
  const [activeShopId, setActiveShopId] = useState<string | null>(null);
  const [menu, setMenu] = useState<MenuItemDoc[]>([]);
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [orders, setOrders] = useState<OrderDoc[]>([]);

  // Shops owned by this account.
  useEffect(() => {
    if (!uid) {
      setShopDocs([]);
      setShopsLoaded(ready);
      return;
    }
    setShopsLoaded(false);
    const stop = subscribeOwnerShops(
      uid,
      (docs) => {
        setShopDocs(docs);
        setShopsLoaded(true);
      },
      (message) => {
        setShopsLoaded(true);
        toast.error(message);
      },
    );
    return stop;
  }, [uid, ready]);

  useEffect(() => {
    if (shopDocs.length === 0) {
      setActiveShopId(null);
      return;
    }
    setActiveShopId((prev) =>
      prev && shopDocs.some((s) => s.shopId === prev) ? prev : shopDocs[0]!.shopId,
    );
  }, [shopDocs]);

  // Menu, categories and orders for the active shop only.
  useEffect(() => {
    if (!activeShopId) {
      setMenu([]);
      setCategories([]);
      setOrders([]);
      return;
    }
    const stopMenu = subscribeMenu(activeShopId, setMenu, (m) => toast.error(m));
    const stopCats = subscribeCategories(activeShopId, setCategories, (m) => toast.error(m));
    const stopOrders = subscribeShopOrders(activeShopId, setOrders, (m) => toast.error(m));
    return () => {
      stopMenu();
      stopCats();
      stopOrders();
    };
  }, [activeShopId]);

  const categoryIds = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of categories) map[c.name] = c.categoryId || c.name;
    return map;
  }, [categories]);

  const uiMenu = useMemo<MenuItem[]>(
    () =>
      menu.map((m) => ({
        id: m.itemId,
        name: m.name,
        description: m.description ?? "",
        price: m.price,
        category: m.categoryName || "Uncategorised",
        categoryId: m.categoryId,
        image: m.imageUrl ?? "",
        imagePublicId: m.cloudinaryPublicId ?? null,
        available: m.available !== false,
        veg: m.veg !== false,
        popular: Boolean(m.popular),
        ingredients: m.ingredients ?? "",
        prepTime: m.preparationTime ?? "",
      })),
    [menu],
  );

  const uiOrders = useMemo<ShopOrder[]>(
    () =>
      orders
        .map((o) => {
          const status = toUiStatus(o.orderStatus);
          if (!status) return null;
          return {
            id: o.orderId,
            code: o.orderNumber,
            customerName: o.studentName || "Student",
            lines: o.items.map((i) => ({ name: i.name, qty: i.quantity, price: i.price })),
            total: o.totalAmount,
            shopAmount: o.shopAmount,
            platformCommission: o.platformCommission,
            paid: o.paymentStatus === "PAID",
            status,
            placedAt: tsToIso(o.createdAt),
          } satisfies ShopOrder;
        })
        .filter(Boolean) as ShopOrder[],
    [orders],
  );

  const shops = useMemo<OwnerShop[]>(
    () =>
      shopDocs.map((s) => {
        const isActive = s.shopId === activeShopId;
        const catNames = isActive
          ? [...new Set([...categories.map((c) => c.name), ...uiMenu.map((m) => m.category)])]
          : [];
        return {
          id: s.shopId,
          name: s.name,
          description: s.description ?? "",
          category: s.category ?? "",
          phone: s.contactNumber ?? "",
          email: s.contactEmail ?? "",
          campus: s.location ?? "",
          logo: s.logoUrl ?? null,
          logoPublicId: s.logoPublicId ?? null,
          cover: s.coverImageUrl ?? null,
          coverPublicId: s.coverPublicId ?? null,
          prepTime: s.preparationTime ?? "",
          availability: STATUS_TO_AVAILABILITY[s.status] ?? "closed",
          hours: (s.openingHours?.length ? s.openingHours : defaultHours()) as OwnerShop["hours"],
          paymentConnected: Boolean(s.payoutConfigured),
          vendorId: s.vendorId ?? null,
          vendorStatus: (s as { vendorStatus?: string }).vendorStatus ?? null,
          categories: catNames,
          categoryIds: isActive ? categoryIds : {},
          menu: isActive ? uiMenu : [],
          orders: isActive ? uiOrders : [],
          customers: isActive ? buildCustomers(orders) : [],
        };
      }),
    [shopDocs, activeShopId, categories, uiMenu, uiOrders, orders, categoryIds],
  );

  const activeShop = useMemo(
    () => shops.find((s) => s.id === activeShopId) ?? null,
    [shops, activeShopId],
  );

  const fail = (err: unknown, fallback: string) => {
    const msg = err instanceof Error ? err.message : fallback;
    toast.error(msg);
  };

  const createShop = useCallback<MerchantValue["createShop"]>(
    async (input) => {
      if (!uid) throw new Error("Please sign in to create your shop.");
      const shopId = await reserveShopId(input.name);
      await createShopDoc({
        shopId,
        ownerId: uid,
        name: input.name.trim(),
        description: input.description.trim(),
        category: input.category,
        logoUrl: input.logo?.url ?? null,
        logoPublicId: input.logo?.publicId ?? null,
        coverImageUrl: input.cover?.url ?? null,
        coverPublicId: input.cover?.publicId ?? null,
        location: input.campus.trim(),
        contactNumber: input.phone.trim(),
        contactEmail: input.email.trim(),
        preparationTime: input.prepTime,
        rating: 5,
        status: "CLOSED",
        openingHours: input.hours,
        vendorId: null,
        payoutConfigured: false,
      });
      setActiveShopId(shopId);
      return shopId;
    },
    [uid],
  );

  const updateShop = useCallback<MerchantValue["updateShop"]>(
    (patch) => {
      if (!activeShopId) return;
      const doc: Record<string, unknown> = {};
      if (patch.name !== undefined) doc["name"] = patch.name;
      if (patch.description !== undefined) doc["description"] = patch.description;
      if (patch.category !== undefined) doc["category"] = patch.category;
      if (patch.phone !== undefined) doc["contactNumber"] = patch.phone;
      if (patch.email !== undefined) doc["contactEmail"] = patch.email;
      if (patch.campus !== undefined) doc["location"] = patch.campus;
      if (patch.prepTime !== undefined) doc["preparationTime"] = patch.prepTime;
      if (patch.hours !== undefined) doc["openingHours"] = patch.hours;
      if (patch.logo !== undefined) doc["logoUrl"] = patch.logo;
      if (patch.logoPublicId !== undefined) doc["logoPublicId"] = patch.logoPublicId;
      if (patch.cover !== undefined) doc["coverImageUrl"] = patch.cover;
      if (patch.coverPublicId !== undefined) doc["coverPublicId"] = patch.coverPublicId;
      if (patch.paymentConnected !== undefined) doc["payoutConfigured"] = patch.paymentConnected;
      if (patch.availability !== undefined) {
        doc["status"] = AVAILABILITY_TO_STATUS[patch.availability];
      }
      if (Object.keys(doc).length === 0) return;
      void updateShopDoc(activeShopId, doc).catch((e) => fail(e, "Unable to save your changes."));
    },
    [activeShopId],
  );

  const setAvailability = useCallback(
    (a: ShopAvailability) => {
      if (!activeShopId) return;

      const newStatus = AVAILABILITY_TO_STATUS[a];
      setShopDocs((prev) => prev.map((s) => (s.shopId === activeShopId ? { ...s, status: newStatus } : s)));

      void setShopStatus(activeShopId, newStatus).catch((e) => {
        fail(e, "Unable to update your shop status.");
        // We do not eagerly revert because next realtime fetch would override, but if it fails, maybe fetch again.
      });
    },
    [activeShopId],
  );

  const addMenuItem = useCallback<MerchantValue["addMenuItem"]>(
    (item) => {
      if (!activeShopId) return;
      void createMenuItem(activeShopId, {
        shopId: activeShopId,
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.image || null,
        cloudinaryPublicId: item.imagePublicId ?? null,
        categoryId: item.categoryId ?? categoryIds[item.category] ?? "",
        categoryName: item.category,
        available: item.available,
        popular: item.popular,
        veg: item.veg,
        ingredients: item.ingredients ?? "",
        preparationTime: item.prepTime ?? "",
      }).catch((e) => fail(e, "Unable to save this item."));
    },
    [activeShopId, categoryIds],
  );

  const updateMenuItem = useCallback<MerchantValue["updateMenuItem"]>(
    (id, patch) => {
      if (!activeShopId) return;
      const doc: Record<string, unknown> = {};
      if (patch.name !== undefined) doc["name"] = patch.name;
      if (patch.description !== undefined) doc["description"] = patch.description;
      if (patch.price !== undefined) doc["price"] = patch.price;
      if (patch.image !== undefined) doc["imageUrl"] = patch.image || null;
      if (patch.imagePublicId !== undefined) doc["cloudinaryPublicId"] = patch.imagePublicId;
      if (patch.available !== undefined) doc["available"] = patch.available;
      if (patch.popular !== undefined) doc["popular"] = patch.popular;
      if (patch.veg !== undefined) doc["veg"] = patch.veg;
      if (patch.ingredients !== undefined) doc["ingredients"] = patch.ingredients;
      if (patch.prepTime !== undefined) doc["preparationTime"] = patch.prepTime;
      if (patch.category !== undefined) {
        doc["categoryName"] = patch.category;
        doc["categoryId"] = patch.categoryId ?? categoryIds[patch.category] ?? "";
      }
      if (Object.keys(doc).length === 0) return;

      setMenu((prev) => prev.map((m) => (m.itemId === id ? { ...m, ...doc } : m) as MenuItemDoc));

      void updateMenuItemDoc(activeShopId, id, doc).catch((e) =>
        fail(e, "Unable to save this item."),
      );
    },
    [activeShopId, categoryIds],
  );

  const deleteMenuItem = useCallback(
    (id: string) => {
      if (!activeShopId) return;
      void deleteMenuItemDoc(activeShopId, id).catch((e) => fail(e, "Unable to delete this item."));
    },
    [activeShopId],
  );

  const addCategory = useCallback(
    (name: string) => {
      if (!activeShopId || categoryIds[name]) return;
      void createCategory(activeShopId, name).catch((e) => fail(e, "Unable to add this category."));
    },
    [activeShopId, categoryIds],
  );

  const renameCategory = useCallback(
    (from: string, to: string) => {
      const id = categoryIds[from];
      if (!activeShopId || !id) return;
      void renameCategoryDoc(activeShopId, id, to, menu).catch((e) =>
        fail(e, "Unable to rename this category."),
      );
    },
    [activeShopId, categoryIds, menu],
  );

  const deleteCategory = useCallback(
    (name: string) => {
      const id = categoryIds[name];
      if (!activeShopId || !id) return;
      void deleteCategoryDoc(activeShopId, id, menu).catch((e) =>
        fail(e, "Unable to delete this category."),
      );
    },
    [activeShopId, categoryIds, menu],
  );

  const setOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    void setOrderStatusDoc(orderId, toBackendStatus(status))
      .then(() => toast.success(`Order marked ${status.toLowerCase()}`))
      .catch((e) => fail(e, "Unable to update this order."));
  }, []);

  const value: MerchantValue = {
    hydrated: ready,
    authed: Boolean(uid) && (profile?.role === "SHOP_OWNER" || profile?.role === "SUPER_ADMIN"),
    loading: !shopsLoaded,
    owner: profile ? { name: profile.name, email: profile.email } : null,
    shops,
    activeShopId,
    activeShop,
    setActiveShop: setActiveShopId,
    signOut: logout,
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
