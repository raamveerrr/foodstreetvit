/**
 * Shared catalog types + a small runtime registry.
 *
 * The registry is filled by the realtime Firestore catalog listener
 * (`src/lib/catalog-store.tsx`). Components keep using the same accessors they
 * used with mock data, but the values are now live backend data.
 */

export const CATEGORIES: string[] = [
  "All",
  "Burgers",
  "Meals",
  "Snacks",
  "Drinks",
  "Desserts",
  "Coffee",
];

export type ShopAvailabilityStatus = "OPEN" | "CLOSED" | "TEMPORARILY_UNAVAILABLE";

export interface Shop {
  id: string;
  name: string;
  image: string;
  logo: string | null;
  description: string;
  isOpen: boolean;
  status: ShopAvailabilityStatus;
  prepTime: string;
  rating: number;
  counter: string;
  ownerId: string;
}

export interface FoodItem {
  id: string;
  shopId: string;
  name: string;
  description: string;
  ingredients?: string;
  price: number;
  image: string;
  imagePublicId?: string | null;
  category: string;
  categoryId: string;
  available: boolean;
  popular?: boolean;
  veg?: boolean;
  prepTime?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  initials: string;
}

/** Mutable snapshot of the live catalog. Replaced wholesale on every update. */
let SHOP_REGISTRY: Shop[] = [];
let FOOD_REGISTRY: FoodItem[] = [];

export const setCatalogSnapshot = (shops: Shop[], foods: FoodItem[]) => {
  SHOP_REGISTRY = shops;
  FOOD_REGISTRY = foods;
};

export const getShops = () => SHOP_REGISTRY;
export const getShop = (id: string) => SHOP_REGISTRY.find((s) => s.id === id);
export const getFoods = () => FOOD_REGISTRY;
export const getFood = (id: string) => FOOD_REGISTRY.find((f) => f.id === id);
export const getShopFoods = (shopId: string) => FOOD_REGISTRY.filter((f) => f.shopId === shopId);
export const getPopularFoods = () => FOOD_REGISTRY.filter((f) => f.popular);

export const formatPrice = (value: number) => `₹${value}`;
