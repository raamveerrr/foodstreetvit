import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { getDb, getFns } from "./client";
import { friendlyError } from "./errors";
import {
  DEFAULT_COMMISSION,
  type CommissionConfig,
  type MenuItemDoc,
  type OrderDoc,
  type OrderItemSnapshot,
  type OrderStatus,
  type ShopDoc,
} from "./types";

const db = () => getDb();

export const ordersCol = () => collection(db(), "orders");

/** Platform commission is configuration, never a constant in the UI. */
export async function loadCommissionConfig(): Promise<CommissionConfig> {
  try {
    const snap = await getDoc(doc(db(), "config", "platform"));
    const data = snap.data() as { commission?: CommissionConfig } | undefined;
    return data?.commission ?? DEFAULT_COMMISSION;
  } catch {
    return DEFAULT_COMMISSION;
  }
}

export const computeCommission = (amount: number, config: CommissionConfig) =>
  config.mode === "FIXED"
    ? Math.min(amount, Math.round(config.value * 100) / 100)
    : Math.round(((amount * config.value) / 100) * 100) / 100;

export interface CartValidationIssue {
  itemId: string;
  name: string;
  type: "REMOVED" | "UNAVAILABLE" | "PRICE_CHANGED" | "SHOP_CLOSED";
  oldPrice?: number;
  newPrice?: number;
}

/**
 * Re-reads the live menu right before checkout. The student's cart is never
 * silently rewritten — issues are reported so they can review and confirm.
 */
export async function validateCart(
  shopId: string,
  lines: { itemId: string; qty: number; price: number; name: string }[],
): Promise<{ issues: CartValidationIssue[]; items: MenuItemDoc[]; shop: ShopDoc | null }> {
  const issues: CartValidationIssue[] = [];
  const shopSnap = await getDoc(doc(db(), "shops", shopId));
  const shop = shopSnap.exists() ? (shopSnap.data() as ShopDoc) : null;

  if (!shop || shop.status !== "OPEN") {
    issues.push({
      itemId: shopId,
      name: shop?.name ?? "This shop",
      type: "SHOP_CLOSED",
    });
  }

  const items: MenuItemDoc[] = [];
  for (const line of lines) {
    const snap = await getDoc(doc(db(), "shops", shopId, "menuItems", line.itemId));
    if (!snap.exists()) {
      issues.push({ itemId: line.itemId, name: line.name, type: "REMOVED" });
      continue;
    }
    const item = snap.data() as MenuItemDoc;
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

export interface CreateOrderInput {
  studentId: string;
  studentName: string;
  shop: ShopDoc;
  lines: { item: MenuItemDoc; qty: number }[];
  discountRate: number;
  idempotencyKey: string;
}

/**
 * Creates a PENDING_PAYMENT order with a frozen price snapshot.
 * The order can only become PAID through a Cloud Function that verifies the
 * payment with Cashfree — never from the browser.
 */
export async function createOrder(input: CreateOrderInput): Promise<OrderDoc> {
  const { studentId, studentName, shop, lines, discountRate, idempotencyKey } = input;

  // Idempotency: an identical key from a retry/refresh returns the same order.
  const existing = await getDocs(
    query(
      ordersCol(),
      where("studentId", "==", studentId),
      where("idempotencyKey", "==", idempotencyKey),
      limit(1),
    ),
  );
  const first = existing.docs[0];
  if (first) return first.data() as OrderDoc;

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
  // Gateway charges are settled by Cashfree and confirmed on the webhook;
  // they are tracked separately and never folded into the commission.
  const paymentGatewayCharges = 0;
  const shopAmount = Math.round((totalAmount - platformCommission) * 100) / 100;

  try {
    const ref = doc(ordersCol());
    const orderNumber = `FS-${Date.now().toString().slice(-6)}`;
    const order: OrderDoc = {
      orderId: ref.id,
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
    await runTransaction(db(), async (tx) => {
      tx.set(ref, { ...order, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    });
    return order;
  } catch (err) {
    throw new Error(friendlyError(err, "We couldn't place your order."));
  }
}

/**
 * Payment confirmation. In production the Cashfree webhook calls this path
 * server-side; the callable below is the single integration point the client
 * knows about, and it is the Cloud Function that decides PAID and issues the
 * one and only receipt.
 */
export async function confirmPayment(orderId: string): Promise<{ receiptId: string }> {
  try {
    const call = httpsCallable<{ orderId: string }, { receiptId: string }>(
      getFns(),
      "confirmPayment",
    );
    const res = await call({ orderId });
    return res.data;
  } catch (err) {
    throw new Error(friendlyError(err, "Payment could not be completed."));
  }
}

export function subscribeStudentOrders(
  studentId: string,
  onData: (orders: OrderDoc[]) => void,
  onError: (message: string) => void,
) {
  return onSnapshot(
    query(ordersCol(), where("studentId", "==", studentId), orderBy("createdAt", "desc"), limit(50)),
    (snap) => onData(snap.docs.map((d) => d.data() as OrderDoc)),
    (err) => onError(friendlyError(err, "Unable to load your orders.")),
  );
}

export function subscribeShopOrders(
  shopId: string,
  onData: (orders: OrderDoc[]) => void,
  onError: (message: string) => void,
) {
  return onSnapshot(
    query(ordersCol(), where("shopId", "==", shopId), orderBy("createdAt", "desc"), limit(100)),
    (snap) => onData(snap.docs.map((d) => d.data() as OrderDoc)),
    (err) => onError(friendlyError(err, "Unable to load orders.")),
  );
}

export async function setOrderStatus(orderId: string, orderStatus: OrderStatus): Promise<void> {
  try {
    await updateDoc(doc(ordersCol(), orderId), { orderStatus, updatedAt: serverTimestamp() });
  } catch (err) {
    throw new Error(friendlyError(err, "Unable to update this order."));
  }
}
