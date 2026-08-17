/**
 * Supabase-backed order CRUD + realtime subscriptions.
 * Drop-in replacement for firebase/orders.ts.
 */

import { supabase } from "./supabase";
import type {
    MenuItemDoc,
    OrderDoc,
    OrderItemSnapshot,
    OrderStatus,
    ShopDoc,
} from "./firebase/types";
import { DEFAULT_COMMISSION, type CommissionConfig } from "./firebase/types";

/* ════════════════════════════════════════════════════════════════
 * Commission config
 * ════════════════════════════════════════════════════════════════ */

export async function loadCommissionConfig(): Promise<CommissionConfig> {
    try {
        const { data } = await supabase.from("config").select("value").eq("key", "platform").single();
        return (data?.value as { commission?: CommissionConfig })?.commission ?? DEFAULT_COMMISSION;
    } catch {
        return DEFAULT_COMMISSION;
    }
}

export const computeCommission = (amount: number, config: CommissionConfig) =>
    config.mode === "FIXED"
        ? Math.min(amount, Math.round(config.value * 100) / 100)
        : Math.round(((amount * config.value) / 100) * 100) / 100;

/* ════════════════════════════════════════════════════════════════
 * Cart validation
 * ════════════════════════════════════════════════════════════════ */

export interface CartValidationIssue {
    itemId: string;
    name: string;
    type: "REMOVED" | "UNAVAILABLE" | "PRICE_CHANGED" | "SHOP_CLOSED";
    oldPrice?: number;
    newPrice?: number;
}

export async function validateCart(
    shopId: string,
    lines: { itemId: string; qty: number; price: number; name: string }[],
): Promise<{ issues: CartValidationIssue[]; items: MenuItemDoc[]; shop: ShopDoc | null }> {
    const issues: CartValidationIssue[] = [];

    // Fetch shop
    const { data: shopRow } = await supabase.from("shops").select("*").eq("shop_id", shopId).single();

    // Use inline conversion rather than importing from supabase-shops to avoid circular deps
    const shop: ShopDoc | null = shopRow
        ? {
            shopId: shopRow.shop_id,
            ownerId: shopRow.owner_uid,
            name: shopRow.name,
            description: shopRow.description ?? "",
            category: shopRow.category ?? "",
            logoUrl: shopRow.logo_url ?? null,
            coverImageUrl: shopRow.cover_image_url ?? null,
            location: shopRow.location ?? shopRow.campus ?? "",
            contactNumber: shopRow.contact_number ?? shopRow.phone ?? "",
            preparationTime: shopRow.prep_time ?? "",
            rating: shopRow.rating ?? 4.5,
            status: shopRow.status ?? "CLOSED",
            openingHours: (shopRow.opening_hours ?? shopRow.hours ?? []) as ShopDoc["openingHours"],
        }
        : null;

    if (!shop || shop.status !== "OPEN") {
        issues.push({
            itemId: shopId,
            name: shop?.name ?? "This shop",
            type: "SHOP_CLOSED",
        });
    }

    // Fetch menu items for this shop
    const { data: menuRows } = await supabase
        .from("menu_items")
        .select("*")
        .eq("shop_id", shopId);

    const itemMap = new Map<string, any>();
    for (const r of menuRows ?? []) itemMap.set(r.item_id, r);

    const items: MenuItemDoc[] = [];
    for (const line of lines) {
        const r = itemMap.get(line.itemId);
        if (!r) {
            issues.push({ itemId: line.itemId, name: line.name, type: "REMOVED" });
            continue;
        }
        const item: MenuItemDoc = {
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
        items.push(item);
        if (item.available === false) {
            issues.push({ itemId: line.itemId, name: item.name, type: "UNAVAILABLE" });
        } else if (item.price !== line.price) {
            issues.push({
                itemId: line.itemId,
                name: item.name,
                type: "PRICE_CHANGED",
                oldPrice: line.price,
                newPrice: item.price,
            });
        }
    }
    return { issues, items, shop };
}

/* ════════════════════════════════════════════════════════════════
 * Create order
 * ════════════════════════════════════════════════════════════════ */

export interface CreateOrderInput {
    studentId: string;
    studentName: string;
    shop: ShopDoc;
    lines: { item: MenuItemDoc; qty: number }[];
    discountRate: number;
    idempotencyKey: string;
}

function rowToOrderDoc(r: any): OrderDoc {
    return {
        orderId: r.order_id,
        orderNumber: r.order_number,
        studentId: r.student_id,
        studentName: r.student_name ?? "Student",
        shopId: r.shop_id,
        shopName: r.shop_name ?? "",
        items: (r.items as OrderItemSnapshot[]) ?? [],
        subtotal: Number(r.subtotal),
        discount: Number(r.discount),
        platformCommission: Number(r.platform_commission),
        paymentGatewayCharges: Number(r.payment_gateway_charges),
        shopAmount: Number(r.shop_amount),
        totalAmount: Number(r.total_amount),
        currency: r.currency ?? "INR",
        paymentStatus: r.payment_status,
        orderStatus: r.order_status,
        receiptId: r.receipt_id ?? null,
        idempotencyKey: r.idempotency_key ?? "",
        createdAt: r.created_at,
        updatedAt: r.updated_at,
    };
}

export async function createOrder(input: CreateOrderInput): Promise<OrderDoc> {
    const { studentId, studentName, shop, lines, discountRate, idempotencyKey } = input;

    // Idempotency check
    const { data: existing } = await supabase
        .from("orders")
        .select("*")
        .eq("student_id", studentId)
        .eq("idempotency_key", idempotencyKey)
        .limit(1);

    if (existing && existing.length > 0) {
        return rowToOrderDoc(existing[0]);
    }

    const items: OrderItemSnapshot[] = lines.map(({ item, qty }) => ({
        itemId: item.itemId,
        name: item.name,
        price: item.price,
        quantity: qty,
        itemTotal: item.price * qty,
    }));
    const subtotal = items.reduce((n, i) => n + i.itemTotal, 0);
    const discount = Math.round(subtotal * discountRate);
    const totalAmount = subtotal - discount;

    const config = await loadCommissionConfig();
    const platformCommission = computeCommission(totalAmount, config);
    const paymentGatewayCharges = 0;
    const shopAmount = Math.round((totalAmount - platformCommission) * 100) / 100;

    const orderId = `ord_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const orderNumber = `FS-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();

    const { error } = await supabase.from("orders").insert({
        order_id: orderId,
        order_number: orderNumber,
        student_id: studentId,
        student_name: studentName,
        shop_id: shop.shopId,
        shop_name: shop.name,
        items,
        subtotal,
        discount,
        platform_commission: platformCommission,
        payment_gateway_charges: paymentGatewayCharges,
        shop_amount: shopAmount,
        total_amount: totalAmount,
        currency: "INR",
        payment_status: "PENDING_PAYMENT",
        order_status: "PENDING_PAYMENT",
        receipt_id: null,
        idempotency_key: idempotencyKey,
        created_at: now,
        updated_at: now,
    });

    if (error) throw new Error(error.message || "We couldn't place your order.");

    return {
        orderId,
        orderNumber,
        studentId,
        studentName,
        shopId: shop.shopId,
        shopName: shop.name,
        items,
        subtotal,
        discount,
        platformCommission,
        paymentGatewayCharges,
        shopAmount,
        totalAmount,
        currency: "INR",
        paymentStatus: "PENDING_PAYMENT",
        orderStatus: "PENDING_PAYMENT",
        receiptId: null,
        idempotencyKey,
    };
}

/* ════════════════════════════════════════════════════════════════
 * Payment confirmation (stub — would call Edge Function)
 * ════════════════════════════════════════════════════════════════ */

export async function confirmPayment(_orderId: string): Promise<{ receiptId: string }> {
    throw new Error("Payment confirmation is not yet implemented for Supabase.");
}

/* ════════════════════════════════════════════════════════════════
 * Realtime subscriptions
 * ════════════════════════════════════════════════════════════════ */

export function subscribeStudentOrders(
    studentId: string,
    onData: (orders: OrderDoc[]) => void,
    onError: (message: string) => void,
): () => void {
    supabase
        .from("orders")
        .select("*")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false })
        .limit(50)
        .then(({ data, error }) => {
            if (error) { onError(error.message); return; }
            onData((data ?? []).map(rowToOrderDoc));
        });

    const uid = Math.random().toString(36).substring(7);
    const channel = supabase
        .channel(`student-orders-${studentId}-${uid}`)
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "orders", filter: `student_id=eq.${studentId}` },
            () => {
                supabase
                    .from("orders")
                    .select("*")
                    .eq("student_id", studentId)
                    .order("created_at", { ascending: false })
                    .limit(50)
                    .then(({ data, error }) => {
                        if (error) return;
                        onData((data ?? []).map(rowToOrderDoc));
                    });
            },
        )
        .subscribe();

    return () => { supabase.removeChannel(channel); };
}

export function subscribeShopOrders(
    shopId: string,
    onData: (orders: OrderDoc[]) => void,
    onError: (message: string) => void,
): () => void {
    supabase
        .from("orders")
        .select("*")
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false })
        .limit(100)
        .then(({ data, error }) => {
            if (error) { onError(error.message); return; }
            onData((data ?? []).map(rowToOrderDoc));
        });

    const uid = Math.random().toString(36).substring(7);
    const channel = supabase
        .channel(`shop-orders-${shopId}-${uid}`)
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "orders", filter: `shop_id=eq.${shopId}` },
            () => {
                supabase
                    .from("orders")
                    .select("*")
                    .eq("shop_id", shopId)
                    .order("created_at", { ascending: false })
                    .limit(100)
                    .then(({ data, error }) => {
                        if (error) return;
                        onData((data ?? []).map(rowToOrderDoc));
                    });
            },
        )
        .subscribe();

    return () => { supabase.removeChannel(channel); };
}

export async function setOrderStatus(orderId: string, orderStatus: OrderStatus): Promise<void> {
    const { error } = await supabase
        .from("orders")
        .update({ order_status: orderStatus, updated_at: new Date().toISOString() })
        .eq("order_id", orderId);
    if (error) throw new Error(error.message || "Unable to update this order.");
}
