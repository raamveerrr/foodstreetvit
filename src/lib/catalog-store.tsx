import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { collection, collectionGroup, onSnapshot } from "firebase/firestore";
import { getDb, isBrowser } from "./firebase/client";
import { cldUrl } from "./cloudinary";
import { setCatalogSnapshot, type FoodItem, type Shop } from "./data";
import type { MenuItemDoc, ShopDoc } from "./firebase/types";

/**
 * The single live catalog subscription for the whole student app.
 *
 * Two filtered listeners (shops, menu items) are created once at the app root
 * and torn down on unmount — no component ever opens its own listener, so
 * duplicate subscriptions are impossible.
 */

interface CatalogValue {
  shops: Shop[];
  foods: FoodItem[];
  loading: boolean;
  error: string | null;
}

const CatalogContext = createContext<CatalogValue | null>(null);

const toShop = (d: ShopDoc): Shop => ({
  id: d.shopId,
  name: d.name,
  image: cldUrl(d.coverImageUrl, "hero"),
  logo: d.logoUrl ? cldUrl(d.logoUrl, "avatar") : null,
  description: d.description ?? "",
  isOpen: d.status === "OPEN",
  status: d.status ?? "CLOSED",
  prepTime: d.preparationTime ?? "10–15 min",
  rating: d.rating ?? 4.5,
  counter: `${d.name} Counter`,
  ownerId: d.ownerId,
});

const toFood = (d: MenuItemDoc): FoodItem => ({
  id: d.itemId,
  shopId: d.shopId,
  name: d.name,
  description: d.description ?? "",
  ingredients: d.ingredients ?? "",
  price: d.price,
  image: cldUrl(d.imageUrl, "card"),
  imagePublicId: d.cloudinaryPublicId ?? null,
  category: d.categoryName || "Other",
  categoryId: d.categoryId ?? "",
  available: d.available !== false,
  popular: Boolean(d.popular),
  veg: d.veg !== false,
  prepTime: d.preparationTime ?? "",
});

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [shopsLoaded, setShopsLoaded] = useState(false);
  const [foodsLoaded, setFoodsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isBrowser) return;
    const db = getDb();
    const stopShops = onSnapshot(
      collection(db, "shops"),
      (snap) => {
        setShops(snap.docs.map((d) => toShop(d.data() as ShopDoc)));
        setShopsLoaded(true);
        setError(null);
      },
      () => {
        setShopsLoaded(true);
        setError("Unable to load campus shops.");
      },
    );
    // One collection-group listener covers every shop's menu.
    const stopItems = onSnapshot(
      collectionGroup(db, "menuItems"),
      (snap) => {
        setFoods(snap.docs.map((d) => toFood(d.data() as MenuItemDoc)));
        setFoodsLoaded(true);
      },
      () => {
        setFoodsLoaded(true);
        setError("Unable to load the menu.");
      },
    );
    return () => {
      stopShops();
      stopItems();
    };
  }, []);

  // Keep the synchronous accessors in `data.ts` pointed at the latest snapshot.
  useEffect(() => {
    setCatalogSnapshot(shops, foods);
  }, [shops, foods]);
  if (isBrowser) setCatalogSnapshot(shops, foods);

  const value = useMemo<CatalogValue>(
    () => ({ shops, foods, loading: !(shopsLoaded && foodsLoaded), error }),
    [shops, foods, shopsLoaded, foodsLoaded, error],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used inside CatalogProvider");
  return ctx;
}
