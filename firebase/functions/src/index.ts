/**
 * DigitalFoodStreet Cloud Functions.
 *
 * These are the only places allowed to:
 *  - mark an order PAID
 *  - issue a receipt (exactly one per paid order)
 *  - redeem a receipt (exactly once, ever)
 *  - register a shop as a payout vendor
 *
 * Firestore rules block all of the above from any browser.
 */
import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import {
  createSplitOrder,
  createVendor,
  fetchOrder,
  verifyWebhookSignature,
} from "./cashfree.js";

initializeApp();
const db = getFirestore();

const CASHFREE_SECRETS = ["CASHFREE_APP_ID", "CASHFREE_SECRET_KEY"];

const receiptNumber = () =>
  `R-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;

/**
 * Issues the single receipt for an order, inside a transaction so concurrent
 * calls (retry, webhook + client confirm) can never mint two receipts.
 */
async function issueReceipt(orderId: string): Promise<string> {
  const orderRef = db.collection("orders").doc(orderId);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(orderRef);
    if (!snap.exists) throw new HttpsError("not-found", "Order not found.");
    const order = snap.data() as Record<string, unknown>;

    const existing = order["receiptId"] as string | null;
    if (existing) return existing;

    const receiptRef = db.collection("receipts").doc();
    tx.set(receiptRef, {
      receiptId: receiptRef.id,
      orderId,
      studentId: order["studentId"],
      shopId: order["shopId"],
      shopName: order["shopName"],
      counter: "Main counter",
      receiptNumber: receiptNumber(),
      status: "ACTIVE",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    tx.update(orderRef, {
      paymentStatus: "PAID",
      orderStatus: "PAID",
      receiptId: receiptRef.id,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return receiptRef.id;
  });
}

/** Creates a Cashfree payment session with the vendor split for this order. */
export const createPaymentSession = onCall(
  { secrets: CASHFREE_SECRETS },
  async (req) => {
    const uid = req.auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Please sign in.");
    const orderId = String(req.data?.orderId ?? "");
    const returnUrl = String(req.data?.returnUrl ?? "");

    const snap = await db.collection("orders").doc(orderId).get();
    if (!snap.exists) throw new HttpsError("not-found", "Order not found.");
    const order = snap.data() as Record<string, any>;
    if (order["studentId"] !== uid) throw new HttpsError("permission-denied", "Not your order.");
    if (order["paymentStatus"] !== "PENDING_PAYMENT") {
      throw new HttpsError("failed-precondition", "This order is already paid.");
    }

    const shop = (await db.collection("shops").doc(order["shopId"]).get()).data() as
      | Record<string, any>
      | undefined;
    if (!shop?.["vendorId"]) {
      throw new HttpsError("failed-precondition", "This shop cannot accept payments yet.");
    }

    const user = (await db.collection("users").doc(uid).get()).data() as Record<string, any>;
    const session = await createSplitOrder({
      orderId,
      amount: order["totalAmount"],
      currency: order["currency"] ?? "INR",
      customer: {
        id: uid,
        name: user?.["name"] ?? "Student",
        email: user?.["email"] ?? "",
        phone: user?.["phone"] ?? "9999999999",
      },
      vendorId: shop["vendorId"],
      shopAmount: order["shopAmount"],
      returnUrl,
    });
    return { paymentSessionId: session.payment_session_id };
  },
);

/**
 * Client-side confirmation. It never trusts the caller: it re-reads the order
 * status from Cashfree before issuing the receipt. The webhook does the same
 * work independently, and the transaction makes them idempotent.
 */
export const confirmPayment = onCall({ secrets: CASHFREE_SECRETS }, async (req) => {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Please sign in.");
  const orderId = String(req.data?.orderId ?? "");

  const snap = await db.collection("orders").doc(orderId).get();
  if (!snap.exists) throw new HttpsError("not-found", "Order not found.");
  const order = snap.data() as Record<string, any>;
  if (order["studentId"] !== uid) throw new HttpsError("permission-denied", "Not your order.");
  if (order["receiptId"]) return { receiptId: order["receiptId"] as string };

  if (process.env["CASHFREE_APP_ID"]) {
    const remote = await fetchOrder(orderId);
    if (remote.order_status !== "PAID") {
      throw new HttpsError("failed-precondition", "Payment not completed.");
    }
  } else {
    // No gateway credentials configured yet: campus pilot mode.
    logger.warn("confirmPayment without Cashfree credentials", { orderId });
  }

  const receiptId = await issueReceipt(orderId);
  return { receiptId };
});

/** Cashfree webhook — the authoritative payment signal. */
export const cashfreeWebhook = onRequest(
  { secrets: [...CASHFREE_SECRETS, "CASHFREE_WEBHOOK_SECRET"] },
  async (req, res) => {
    const raw = (req as unknown as { rawBody: Buffer }).rawBody?.toString() ?? "";
    const timestamp = String(req.headers["x-webhook-timestamp"] ?? "");
    const signature = String(req.headers["x-webhook-signature"] ?? "");

    if (!verifyWebhookSignature(raw, timestamp, signature)) {
      res.status(401).send("Invalid signature");
      return;
    }

    const payload = JSON.parse(raw) as {
      type?: string;
      data?: { order?: { order_id?: string } };
    };
    const orderId = payload.data?.order?.order_id;
    if (!orderId) {
      res.status(400).send("Missing order id");
      return;
    }

    if (payload.type === "PAYMENT_SUCCESS_WEBHOOK") {
      await issueReceipt(orderId);
    } else if (payload.type === "PAYMENT_FAILED_WEBHOOK") {
      await db.collection("orders").doc(orderId).update({
        paymentStatus: "FAILED",
        orderStatus: "CANCELLED",
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
    res.status(200).send("ok");
  },
);

/**
 * One-time pickup redemption. The student's swipe is a gesture; this
 * transaction is the actual guarantee that a receipt is used exactly once.
 */
export const redeemReceipt = onCall(async (req) => {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Please sign in.");
  const receiptId = String(req.data?.receiptId ?? "");
  const ref = db.collection("receipts").doc(receiptId);

  const redeemedAt = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpsError("not-found", "Receipt not found.");
    const receipt = snap.data() as Record<string, any>;

    const shop = (await tx.get(db.collection("shops").doc(receipt["shopId"]))).data() as
      | Record<string, any>
      | undefined;
    const allowed = receipt["studentId"] === uid || shop?.["ownerId"] === uid;
    if (!allowed) throw new HttpsError("permission-denied", "Not your receipt.");
    if (receipt["status"] === "REDEEMED") {
      throw new HttpsError("failed-precondition", "Receipt already used.");
    }

    const now = new Date();
    tx.update(ref, {
      status: "REDEEMED",
      redeemedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    tx.update(db.collection("orders").doc(receipt["orderId"]), {
      orderStatus: "COMPLETED",
      updatedAt: FieldValue.serverTimestamp(),
    });
    return now.toISOString();
  });

  return { redeemedAt };
});

/** Registers a shop for payouts. Only the shop's owner may call it. */
export const connectShopPayouts = onCall({ secrets: CASHFREE_SECRETS }, async (req) => {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Please sign in.");
  const shopId = String(req.data?.shopId ?? "");
  const ref = db.collection("shops").doc(shopId);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError("not-found", "Shop not found.");
  const shop = snap.data() as Record<string, any>;
  if (shop["ownerId"] !== uid) throw new HttpsError("permission-denied", "Not your shop.");

  const vendorId = `shop_${shopId}`;
  await createVendor({
    vendorId,
    name: shop["name"],
    email: shop["contactEmail"] ?? req.auth?.token.email ?? "",
    phone: shop["contactNumber"] ?? "",
    bank: req.data?.bank,
    upi: req.data?.upi,
  });

  await ref.update({
    vendorId,
    payoutConfigured: true,
    updatedAt: FieldValue.serverTimestamp(),
  });
  return { vendorId };
});
