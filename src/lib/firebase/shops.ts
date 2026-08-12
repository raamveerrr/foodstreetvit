import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDb } from "./client";
import { friendlyError } from "./errors";
import type { CategoryDoc, MenuItemDoc, ShopDoc, ShopStatus } from "./types";

/** All shop/menu writes go through here so ownership stays explicit. */

const db = () => getDb();

export const shopRef = (shopId: string) => doc(db(), "shops", shopId);
export const menuCol = (shopId: string) => collection(db(), "shops", shopId, "menuItems");
export const categoryCol = (shopId: string) => collection(db(), "shops", shopId, "categories");

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "shop";

/** Reserves a unique shop id derived from the shop name. */
export async function reserveShopId(name: string): Promise<string> {
  const base = slugify(name);
  for (let i = 0; i < 20; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    const existing = await getDocs(
      query(collection(db(), "shops"), where("shopId", "==", candidate), limit(1)),
    );
    if (existing.empty) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export type NewShopInput = Omit<ShopDoc, "createdAt" | "updatedAt">;

export async function createShopDoc(input: NewShopInput): Promise<void> {
  try {
    await setDoc(shopRef(input.shopId), {
      ...input,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    throw new Error(friendlyError(err, "Couldn't create your shop."));
  }
}

export async function updateShopDoc(shopId: string, patch: Partial<ShopDoc>): Promise<void> {
  try {
    await updateDoc(shopRef(shopId), { ...patch, updatedAt: serverTimestamp() });
  } catch (err) {
    throw new Error(friendlyError(err, "Unable to save your changes."));
  }
}

export const setShopStatus = (shopId: string, status: ShopStatus) =>
  updateShopDoc(shopId, { status });

/** Realtime list of the shops this owner owns — nothing else is readable. */
export function subscribeOwnerShops(
  ownerId: string,
  onData: (shops: ShopDoc[]) => void,
  onError: (message: string) => void,
) {
  return onSnapshot(
    query(collection(db(), "shops"), where("ownerId", "==", ownerId)),
    (snap) => onData(snap.docs.map((d) => d.data() as ShopDoc)),
    (err) => onError(friendlyError(err, "Unable to load your shops.")),
  );
}

export function subscribeMenu(
  shopId: string,
  onData: (items: MenuItemDoc[]) => void,
  onError: (message: string) => void,
) {
  return onSnapshot(
    menuCol(shopId),
    (snap) => onData(snap.docs.map((d) => d.data() as MenuItemDoc)),
    (err) => onError(friendlyError(err, "Unable to load your menu.")),
  );
}

export function subscribeCategories(
  shopId: string,
  onData: (categories: CategoryDoc[]) => void,
  onError: (message: string) => void,
) {
  return onSnapshot(
    categoryCol(shopId),
    (snap) => onData(snap.docs.map((d) => d.data() as CategoryDoc)),
    (err) => onError(friendlyError(err, "Unable to load your categories.")),
  );
}

export async function createMenuItem(
  shopId: string,
  input: Omit<MenuItemDoc, "createdAt" | "updatedAt" | "itemId"> & { itemId?: string },
): Promise<string> {
  try {
    const ref = input.itemId ? doc(menuCol(shopId), input.itemId) : doc(menuCol(shopId));
    await setDoc(ref, {
      ...input,
      itemId: ref.id,
      shopId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  } catch (err) {
    throw new Error(friendlyError(err, "Unable to save this item."));
  }
}

export async function updateMenuItem(
  shopId: string,
  itemId: string,
  patch: Partial<MenuItemDoc>,
): Promise<void> {
  try {
    await updateDoc(doc(menuCol(shopId), itemId), { ...patch, updatedAt: serverTimestamp() });
  } catch (err) {
    throw new Error(friendlyError(err, "Unable to save this item."));
  }
}

export async function deleteMenuItem(shopId: string, itemId: string): Promise<void> {
  try {
    await deleteDoc(doc(menuCol(shopId), itemId));
  } catch (err) {
    throw new Error(friendlyError(err, "Unable to delete this item."));
  }
}

export async function createCategory(shopId: string, name: string): Promise<string> {
  try {
    const ref = await addDoc(categoryCol(shopId), {
      shopId,
      name,
      sortOrder: Date.now(),
    });
    await updateDoc(ref, { categoryId: ref.id });
    return ref.id;
  } catch (err) {
    throw new Error(friendlyError(err, "Unable to add this category."));
  }
}

export async function renameCategory(
  shopId: string,
  categoryId: string,
  name: string,
  items: MenuItemDoc[],
): Promise<void> {
  try {
    await updateDoc(doc(categoryCol(shopId), categoryId), { name });
    await Promise.all(
      items
        .filter((i) => i.categoryId === categoryId)
        .map((i) => updateMenuItem(shopId, i.itemId, { categoryName: name })),
    );
  } catch (err) {
    throw new Error(friendlyError(err, "Unable to rename this category."));
  }
}

/** Items are never dropped with their category — they move to "Uncategorised". */
export async function deleteCategory(
  shopId: string,
  categoryId: string,
  items: MenuItemDoc[],
): Promise<void> {
  try {
    await Promise.all(
      items
        .filter((i) => i.categoryId === categoryId)
        .map((i) =>
          updateMenuItem(shopId, i.itemId, { categoryId: "", categoryName: "Uncategorised" }),
        ),
    );
    await deleteDoc(doc(categoryCol(shopId), categoryId));
  } catch (err) {
    throw new Error(friendlyError(err, "Unable to delete this category."));
  }
}
