/**
 * Supabase-backed shop, menu-item and category CRUD + realtime subscriptions.
 * Drop-in replacement for firebase/shops.ts.
 */

import { supabase } from "./supabase";
import type { ShopStatus } from "./firebase/types";
import type { RealtimeChannel } from "@supabase/supabase-js";

/* ════════════════════════════════════════════════════════════════
 * Types — Supabase row shapes (snake_case)
 * ════════════════════════════════════════════════════════════════ */

export interface SupabaseShopRow {
    shop_id: string;
    owner_uid: string;
    name: string;
    description: string;
    category: string;
    phone: string;
    email: string;
    campus: string;
    prep_time: string;
    hours: unknown;
    status: string;
    logo_url?: string | null;
    logo_public_id?: string | null;
    cover_image_url?: string | null;
    cover_public_id?: string | null;
    location?: string | null;
    contact_number?: string | null;
    contact_email?: string | null;
    opening_hours?: unknown;
    rating?: number | null;
    vendor_id?: string | null;
    payout_configured?: boolean | null;
    created_at: string;
    updated_at: string;
}

export interface SupabaseMenuItemRow {
    id: string;
    item_id: string;
    shop_id: string;
    name: string;
    description: string;
    price: number;
    image_url: string | null;
    cloudinary_public_id: string | null;
    category_id: string;
    category_name: string;
    available: boolean;
    popular: boolean;
    veg: boolean;
    ingredients: string;
    preparation_time: string;
    created_at: string;
    updated_at: string;
}

export interface SupabaseCategoryRow {
    id: string;
    category_id: string;
    shop_id: string;
    name: string;
    image_url?: string | null;
    sort_order?: number;
}

/* ════════════════════════════════════════════════════════════════
 * Row ↔ Doc converters
 * ════════════════════════════════════════════════════════════════ */

import type { CategoryDoc, MenuItemDoc, ShopDoc } from "./firebase/types";

export function rowToShopDoc(r: SupabaseShopRow): ShopDoc {
    return {
        shopId: r.shop_id,
        ownerId: r.owner_uid,
        name: r.name,
        description: r.description ?? "",
        category: r.category ?? "",
        logoUrl: r.logo_url ?? null,
        logoPublicId: r.logo_public_id ?? null,
        coverImageUrl: r.cover_image_url ?? null,
        coverPublicId: r.cover_public_id ?? null,
        location: r.location ?? r.campus ?? "",
        contactNumber: r.contact_number ?? r.phone ?? "",
        contactEmail: r.contact_email ?? r.email ?? "",
        preparationTime: r.prep_time ?? "",
        rating: r.rating ?? 4.5,
        status: (r.status as ShopStatus) ?? "CLOSED",
        openingHours: (r.opening_hours ?? r.hours ?? []) as ShopDoc["openingHours"],
        vendorId: r.vendor_id ?? null,
        payoutConfigured: r.payout_configured ?? false,
    };
}

export function rowToMenuItemDoc(r: SupabaseMenuItemRow): MenuItemDoc {
    return {
        itemId: r.item_id,
        shopId: r.shop_id,
        name: r.name,
        description: r.description ?? "",
        price: Number(r.price),
        imageUrl: r.image_url ?? null,
        cloudinaryPublicId: r.cloudinary_public_id ?? null,
        categoryId: r.category_id ?? "",
        categoryName: r.category_name ?? "Uncategorised",
        available: r.available !== false,
        popular: Boolean(r.popular),
        veg: r.veg !== false,
        ingredients: r.ingredients ?? "",
        preparationTime: r.preparation_time ?? "",
    };
}

export function rowToCategoryDoc(r: SupabaseCategoryRow): CategoryDoc {
    return {
        categoryId: r.category_id,
        shopId: r.shop_id,
        name: r.name,
        imageUrl: r.image_url ?? null,
        sortOrder: r.sort_order ?? 0,
    };
}

/* ════════════════════════════════════════════════════════════════
 * Slug helper
 * ════════════════════════════════════════════════════════════════ */

export const slugify = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 40) || "shop";

/* ════════════════════════════════════════════════════════════════
 * Shop CRUD
 * ════════════════════════════════════════════════════════════════ */

export async function reserveShopId(name: string): Promise<string> {
    const base = slugify(name);
    for (let i = 0; i < 20; i++) {
        const candidate = i === 0 ? base : `${base}-${i + 1}`;
        const { data } = await supabase
            .from("shops")
            .select("shop_id")
            .eq("shop_id", candidate)
            .limit(1);
        if (!data || data.length === 0) return candidate;
    }
    return `${base}-${Date.now().toString(36)}`;
}

export type NewShopInput = Omit<ShopDoc, "createdAt" | "updatedAt">;

export async function createShopDoc(input: NewShopInput): Promise<void> {
    const now = new Date().toISOString();
    const { error } = await supabase.from("shops").insert({
        shop_id: input.shopId,
        owner_uid: input.ownerId,
        name: input.name,
        description: input.description,
        category: input.category,
        phone: input.contactNumber ?? "",
        email: input.contactEmail ?? "",
        campus: input.location ?? "",
        prep_time: input.preparationTime ?? "",
        hours: input.openingHours ?? [],
        status: input.status ?? "CLOSED",
        logo_url: input.logoUrl,
        logo_public_id: input.logoPublicId,
        cover_image_url: input.coverImageUrl,
        cover_public_id: input.coverPublicId,
        location: input.location,
        contact_number: input.contactNumber,
        contact_email: input.contactEmail,
        opening_hours: input.openingHours,
        rating: input.rating ?? 4.5,
        vendor_id: input.vendorId,
        payout_configured: input.payoutConfigured ?? false,
        created_at: now,
        updated_at: now,
    });
    if (error) throw new Error(error.message || "Couldn't create your shop.");
}

export async function updateShopDoc(shopId: string, patch: Partial<ShopDoc>): Promise<void> {
    const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (patch.name !== undefined) row["name"] = patch.name;
    if (patch.description !== undefined) row["description"] = patch.description;
    if (patch.category !== undefined) row["category"] = patch.category;
    if (patch.contactNumber !== undefined) { row["contact_number"] = patch.contactNumber; row["phone"] = patch.contactNumber; }
    if (patch.contactEmail !== undefined) { row["contact_email"] = patch.contactEmail; row["email"] = patch.contactEmail; }
    if (patch.location !== undefined) { row["location"] = patch.location; row["campus"] = patch.location; }
    if (patch.preparationTime !== undefined) row["prep_time"] = patch.preparationTime;
    if (patch.openingHours !== undefined) { row["opening_hours"] = patch.openingHours; row["hours"] = patch.openingHours; }
    if (patch.logoUrl !== undefined) row["logo_url"] = patch.logoUrl;
    if (patch.logoPublicId !== undefined) row["logo_public_id"] = patch.logoPublicId;
    if (patch.coverImageUrl !== undefined) row["cover_image_url"] = patch.coverImageUrl;
    if (patch.coverPublicId !== undefined) row["cover_public_id"] = patch.coverPublicId;
    if (patch.status !== undefined) row["status"] = patch.status;
    if (patch.vendorId !== undefined) row["vendor_id"] = patch.vendorId;
    if (patch.payoutConfigured !== undefined) row["payout_configured"] = patch.payoutConfigured;
    if (patch.rating !== undefined) row["rating"] = patch.rating;

    const { error } = await supabase.from("shops").update(row).eq("shop_id", shopId);
    if (error) throw new Error(error.message || "Unable to save your changes.");
}

export const setShopStatus = (shopId: string, status: ShopStatus) =>
    updateShopDoc(shopId, { status });

/* ════════════════════════════════════════════════════════════════
 * Realtime subscriptions
 * ════════════════════════════════════════════════════════════════ */

export function subscribeOwnerShops(
    ownerId: string,
    onData: (shops: ShopDoc[]) => void,
    onError: (message: string) => void,
): () => void {
    // Initial fetch
    supabase
        .from("shops")
        .select("*")
        .eq("owner_uid", ownerId)
        .then(({ data, error }) => {
            if (error) { onError(error.message); return; }
            onData((data ?? []).map((r: any) => rowToShopDoc(r)));
        });

    // Realtime channel
    const uid = Math.random().toString(36).substring(7);
    const channel: RealtimeChannel = supabase
        .channel(`shops-owner-${ownerId}-${uid}`)
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "shops", filter: `owner_uid=eq.${ownerId}` },
            () => {
                // Re-fetch on any change (simplest approach)
                supabase
                    .from("shops")
                    .select("*")
                    .eq("owner_uid", ownerId)
                    .then(({ data, error }) => {
                        if (error) return;
                        onData((data ?? []).map((r: any) => rowToShopDoc(r)));
                    });
            },
        )
        .subscribe();

    return () => { supabase.removeChannel(channel); };
}

export function subscribeMenu(
    shopId: string,
    onData: (items: MenuItemDoc[]) => void,
    onError: (message: string) => void,
): () => void {
    supabase
        .from("menu_items")
        .select("*")
        .eq("shop_id", shopId)
        .then(({ data, error }) => {
            if (error) { onError(error.message); return; }
            onData((data ?? []).map((r: any) => rowToMenuItemDoc(r)));
        });

    const uid = Math.random().toString(36).substring(7);
    const channel = supabase
        .channel(`menu-${shopId}-${uid}`)
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "menu_items", filter: `shop_id=eq.${shopId}` },
            (payload) => {
                console.log("Realtime event for menu items!", payload);
                supabase
                    .from("menu_items")
                    .select("*")
                    .eq("shop_id", shopId)
                    .then(({ data, error }) => {
                        if (error) {
                            console.error("Realtime re-fetch error:", error);
                            return;
                        }
                        onData((data ?? []).map((r: any) => rowToMenuItemDoc(r)));
                    });
            },
        )
        .subscribe((status) => {
            console.log(`Menu channel status: ${status}`);
        });

    return () => { supabase.removeChannel(channel); };
}

export function subscribeCategories(
    shopId: string,
    onData: (categories: CategoryDoc[]) => void,
    onError: (message: string) => void,
): () => void {
    supabase
        .from("categories")
        .select("*")
        .eq("shop_id", shopId)
        .then(({ data, error }) => {
            if (error) { onError(error.message); return; }
            onData((data ?? []).map((r: any) => rowToCategoryDoc(r)));
        });

    const uid = Math.random().toString(36).substring(7);
    const channel = supabase
        .channel(`categories-${shopId}-${uid}`)
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "categories", filter: `shop_id=eq.${shopId}` },
            () => {
                supabase
                    .from("categories")
                    .select("*")
                    .eq("shop_id", shopId)
                    .then(({ data, error }) => {
                        if (error) return;
                        onData((data ?? []).map((r: any) => rowToCategoryDoc(r)));
                    });
            },
        )
        .subscribe();

    return () => { supabase.removeChannel(channel); };
}

/* ════════════════════════════════════════════════════════════════
 * Menu item CRUD
 * ════════════════════════════════════════════════════════════════ */

export async function createMenuItem(
    shopId: string,
    input: Omit<MenuItemDoc, "createdAt" | "updatedAt" | "itemId"> & { itemId?: string },
): Promise<string> {
    const itemId = input.itemId || `m_${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    const { error } = await supabase.from("menu_items").insert({
        item_id: itemId,
        shop_id: shopId,
        name: input.name,
        description: input.description ?? "",
        price: input.price,
        image_url: input.imageUrl ?? null,
        cloudinary_public_id: input.cloudinaryPublicId ?? null,
        category_id: input.categoryId ?? "",
        category_name: input.categoryName ?? "Uncategorised",
        available: input.available !== false,
        popular: Boolean(input.popular),
        veg: input.veg !== false,
        ingredients: input.ingredients ?? "",
        preparation_time: input.preparationTime ?? "",
        created_at: now,
        updated_at: now,
    });
    if (error) throw new Error(error.message || "Unable to save this item.");
    return itemId;
}

export async function updateMenuItem(
    shopId: string,
    itemId: string,
    patch: Partial<MenuItemDoc>,
): Promise<void> {
    const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (patch.name !== undefined) row["name"] = patch.name;
    if (patch.description !== undefined) row["description"] = patch.description;
    if (patch.price !== undefined) row["price"] = patch.price;
    if (patch.imageUrl !== undefined) row["image_url"] = patch.imageUrl;
    if (patch.cloudinaryPublicId !== undefined) row["cloudinary_public_id"] = patch.cloudinaryPublicId;
    if (patch.available !== undefined) row["available"] = patch.available;
    if (patch.popular !== undefined) row["popular"] = patch.popular;
    if (patch.veg !== undefined) row["veg"] = patch.veg;
    if (patch.ingredients !== undefined) row["ingredients"] = patch.ingredients;
    if (patch.preparationTime !== undefined) row["preparation_time"] = patch.preparationTime;
    if (patch.categoryId !== undefined) row["category_id"] = patch.categoryId;
    if (patch.categoryName !== undefined) row["category_name"] = patch.categoryName;

    const { error } = await supabase
        .from("menu_items")
        .update(row)
        .eq("shop_id", shopId)
        .eq("item_id", itemId);
    if (error) throw new Error(error.message || "Unable to save this item.");
}

export async function deleteMenuItem(shopId: string, itemId: string): Promise<void> {
    const { error } = await supabase
        .from("menu_items")
        .delete()
        .eq("shop_id", shopId)
        .eq("item_id", itemId);
    if (error) throw new Error(error.message || "Unable to delete this item.");
}

/* ════════════════════════════════════════════════════════════════
 * Category CRUD
 * ════════════════════════════════════════════════════════════════ */

export async function createCategory(shopId: string, name: string): Promise<string> {
    const categoryId = `cat_${Date.now().toString(36)}`;
    const { error } = await supabase.from("categories").insert({
        category_id: categoryId,
        shop_id: shopId,
        name,
        sort_order: Date.now(),
    });
    if (error) throw new Error(error.message || "Unable to add this category.");
    return categoryId;
}

export async function renameCategory(
    shopId: string,
    categoryId: string,
    name: string,
    items: MenuItemDoc[],
): Promise<void> {
    const { error } = await supabase
        .from("categories")
        .update({ name })
        .eq("shop_id", shopId)
        .eq("category_id", categoryId);
    if (error) throw new Error(error.message || "Unable to rename this category.");

    // Update category name on all items in this category
    await Promise.all(
        items
            .filter((i) => i.categoryId === categoryId)
            .map((i) => updateMenuItem(shopId, i.itemId, { categoryName: name })),
    );
}

export async function deleteCategory(
    shopId: string,
    categoryId: string,
    items: MenuItemDoc[],
): Promise<void> {
    // Move items to "Uncategorised" first
    await Promise.all(
        items
            .filter((i) => i.categoryId === categoryId)
            .map((i) =>
                updateMenuItem(shopId, i.itemId, { categoryId: "", categoryName: "Uncategorised" }),
            ),
    );

    const { error } = await supabase
        .from("categories")
        .delete()
        .eq("shop_id", shopId)
        .eq("category_id", categoryId);
    if (error) throw new Error(error.message || "Unable to delete this category.");
}

/* ════════════════════════════════════════════════════════════════
 * Payout onboarding (stub — Cloud Function integration)
 * ════════════════════════════════════════════════════════════════ */

export async function connectShopPayouts(_shopId: string): Promise<{ vendorId: string }> {
    // This would call a Supabase Edge Function in production
    throw new Error("Payout onboarding is not yet implemented for Supabase.");
}

/* ════════════════════════════════════════════════════════════════
 * Public catalog subscriptions (for student app)
 * ════════════════════════════════════════════════════════════════ */

export function subscribeAllShops(
    onData: (shops: ShopDoc[]) => void,
    onError: (message: string) => void,
): () => void {
    supabase
        .from("shops")
        .select("*")
        .then(({ data, error }) => {
            if (error) { onError(error.message); return; }
            onData((data ?? []).map((r: any) => rowToShopDoc(r)));
        });

    const uid = Math.random().toString(36).substring(7);
    const channel = supabase
        .channel(`all-shops-${uid}`)
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "shops" },
            () => {
                supabase
                    .from("shops")
                    .select("*")
                    .then(({ data, error }) => {
                        if (error) return;
                        onData((data ?? []).map((r: any) => rowToShopDoc(r)));
                    });
            },
        )
        .subscribe();

    return () => { supabase.removeChannel(channel); };
}

export function subscribeAllMenuItems(
    onData: (items: MenuItemDoc[]) => void,
    onError: (message: string) => void,
): () => void {
    supabase
        .from("menu_items")
        .select("*")
        .then(({ data, error }) => {
            if (error) { onError(error.message); return; }
            onData((data ?? []).map((r: any) => rowToMenuItemDoc(r)));
        });

    const uid = Math.random().toString(36).substring(7);
    const channel = supabase
        .channel(`all-menu-items-${uid}`)
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "menu_items" },
            () => {
                supabase
                    .from("menu_items")
                    .select("*")
                    .then(({ data, error }) => {
                        if (error) return;
                        onData((data ?? []).map((r: any) => rowToMenuItemDoc(r)));
                    });
            },
        )
        .subscribe();

    return () => { supabase.removeChannel(channel); };
}
