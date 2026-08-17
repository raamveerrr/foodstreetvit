/**
 * DigitalFoodStreet Cloud Functions — the only place money logic lives.
 *
 * These are the only places allowed to:
 *  - price an order (never the browser)
 *  - create a Cashfree payment session with the Easy Split vendor share
 *  - mark an order PAID (only after server-side verification with Cashfree)
 *  - issue a receipt (exactly one per paid order)
 *  - redeem a receipt (exactly once, ever, by the owning shop)
 *  - register a shop as an Easy Split vendor
 *  - refund
 *
 * Firestore rules block every one of those from any browser.
 */
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore, Timestamp } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { cashfreeConfigured, cashfreeEnv, createRefund, createSplitOrder, createVendor, fetchOrder, fetchOrderPayments, fetchVendor, verifyWebhookSignature, } from "./cashfree.js";
import { computeAmounts, DEFAULT_COMMISSION, receiptNumber, round2, } from "./money.js";
initializeApp();
const db = getFirestore();
const auth = getAuth();
const CASHFREE_SECRETS = ["CASHFREE_APP_ID", "CASHFREE_SECRET_KEY"];
const WEBHOOK_SECRETS = [...CASHFREE_SECRETS, "CASHFREE_WEBHOOK_SECRET"];
const now = () => FieldValue.serverTimestamp();
const requireAuth = (uid) => {
    if (!uid)
        throw new HttpsError("unauthenticated", "Please sign in.");
    return uid;
};
/* --------------------------------------------------------------- config -- */
async function loadCommission() {
    const snap = await db.collection("config").doc("platform").get();
    const stored = (snap.data()?.["commission"] ?? {});
    return { ...DEFAULT_COMMISSION, ...stored };
}
async function isSuperAdmin(uid) {
    const user = (await db.collection("users").doc(uid).get()).data();
    return user?.["role"] === "SUPER_ADMIN";
}
/** Only SUPER_ADMIN may change what the platform earns. */
export const setCommissionConfig = onCall(async (req) => {
    const uid = requireAuth(req.auth?.uid);
    if (!(await isSuperAdmin(uid)))
        throw new HttpsError("permission-denied", "Not allowed.");
    const input = (req.data ?? {});
    const commission = {
        mode: input.mode === "FIXED" ? "FIXED" : "PERCENTAGE",
        value: Math.max(0, Number(input.value ?? DEFAULT_COMMISSION.value)),
        gatewayChargesBorneBy: input.gatewayChargesBorneBy === "SHOP" ? "SHOP" : "PLATFORM",
        discountRate: Math.min(0.5, Math.max(0, Number(input.discountRate ?? 0))),
    };
    await db
        .collection("config")
        .doc("platform")
        .set({ commission, updatedAt: now(), updatedBy: uid }, { merge: true });
    await audit("COMMISSION_UPDATED", { actorId: uid, commission });
    return { commission };
});
/* ---------------------------------------------------------------- audit -- */
async function audit(event, data) {
    try {
        await db.collection("auditLogs").add({ event, ...data, createdAt: now() });
    }
    catch (err) {
        logger.error("audit write failed", { event, err });
    }
}
/* -------------------------------------------------------- order numbers -- */
/** Monotonic, human-readable numbers from a single counter document. */
async function nextSequence(name) {
    const ref = db.collection("counters").doc(name);
    return db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        const value = (snap.data()?.["value"] ?? 4820) + 1;
        tx.set(ref, { value, updatedAt: now() }, { merge: true });
        return value;
    });
}
/* ------------------------------------------------------------- receipts -- */
/**
 * Issues the single receipt for an order and flips it to PAID, inside one
 * transaction so concurrent callers (client verify + webhook + webhook retry)
 * can never mint two receipts or two transaction records.
 */
async function markPaidAndIssueReceipt(orderId, payment) {
    const orderRef = db.collection("orders").doc(orderId);
    const { receiptId, issued } = await db.runTransaction(async (tx) => {
        const snap = await tx.get(orderRef);
        if (!snap.exists)
            throw new HttpsError("not-found", "Order not found.");
        const order = snap.data();
        const existing = order["receiptId"];
        if (existing)
            return { receiptId: existing, issued: false };
        const receiptRef = db.collection("receipts").doc();
        const txnRef = db.collection("transactions").doc(orderId);
        tx.set(receiptRef, {
            receiptId: receiptRef.id,
            receiptNumber: order["orderNumber"],
            orderId,
            studentId: order["studentId"],
            shopId: order["shopId"],
            shopName: order["shopName"],
            counter: "Main counter",
            items: order["items"] ?? [],
            totalAmount: order["totalAmount"],
            paymentStatus: "PAID",
            status: "ACTIVE",
            createdAt: now(),
            updatedAt: now(),
            redeemedAt: null,
        });
        tx.update(orderRef, {
            paymentStatus: "PAID",
            orderStatus: "PAID",
            receiptId: receiptRef.id,
            cashfreePaymentId: payment.cfPaymentId ?? null,
            cashfreeOrderId: payment.cfOrderId ?? orderId,
            paidAt: now(),
            updatedAt: now(),
        });
        tx.set(txnRef, {
            transactionId: orderId,
            orderId,
            studentId: order["studentId"],
            shopId: order["shopId"],
            cashfreeOrderId: payment.cfOrderId ?? orderId,
            cashfreePaymentId: payment.cfPaymentId ?? null,
            customerAmount: order["totalAmount"],
            platformCommission: order["platformCommission"],
            cashfreeCharges: order["paymentGatewayCharges"] ?? 0,
            shopAmount: order["shopAmount"],
            currency: order["currency"] ?? "INR",
            paymentStatus: "PAYMENT_SUCCESS",
            settlementStatus: "SETTLEMENT_PENDING",
            refundAmount: 0,
            environment: cashfreeEnv(),
            createdAt: now(),
            updatedAt: now(),
        }, { merge: true });
        return { receiptId: receiptRef.id, issued: true };
    });
    if (issued) {
        await audit("RECEIPT_GENERATED", { orderId, receiptId });
        await audit("PAYMENT_VERIFIED", { orderId, cfPaymentId: payment.cfPaymentId ?? null });
    }
    return receiptId;
}
/**
 * Creates the pending order AND the Cashfree payment session in one secure
 * step. Prices, discount, commission and the vendor split are read from
 * Firestore — the client only ever sends item ids and quantities.
 */
export const createCheckoutOrder = onCall({ secrets: CASHFREE_SECRETS }, async (req) => {
    const uid = requireAuth(req.auth?.uid);
    const shopId = String(req.data?.shopId ?? "");
    const returnUrl = String(req.data?.returnUrl ?? "");
    const idempotencyKey = String(req.data?.idempotencyKey ?? "");
    const lines = (Array.isArray(req.data?.items) ? req.data.items : []);
    if (!shopId || lines.length === 0 || !idempotencyKey) {
        throw new HttpsError("invalid-argument", "Your cart is empty.");
    }
    // An identical key from a double tap / refresh / retry returns the same order.
    const existingSnap = await db
        .collection("orders")
        .where("studentId", "==", uid)
        .where("idempotencyKey", "==", idempotencyKey)
        .limit(1)
        .get();
    const existingDoc = existingSnap.docs[0];
    if (existingDoc) {
        const existing = existingDoc.data();
        if (existing["paymentStatus"] === "PAID") {
            return {
                orderId: existing["orderId"],
                alreadyPaid: true,
                receiptId: existing["receiptId"] ?? null,
            };
        }
        if (existing["paymentSessionId"]) {
            return {
                orderId: existing["orderId"],
                orderNumber: existing["orderNumber"],
                paymentSessionId: existing["paymentSessionId"],
                totalAmount: existing["totalAmount"],
                environment: cashfreeEnv(),
            };
        }
    }
    /* -- shop + vendor readiness -------------------------------------------- */
    const shopSnap = await db.collection("shops").doc(shopId).get();
    const shop = shopSnap.data();
    if (!shopSnap.exists || !shop) {
        throw new HttpsError("not-found", "This shop is no longer available.");
    }
    if (shop["status"] !== "OPEN") {
        throw new HttpsError("failed-precondition", "Online ordering is temporarily unavailable for this shop.");
    }
    const vendorId = shop["vendorId"];
    if (!vendorId || shop["payoutConfigured"] !== true) {
        throw new HttpsError("failed-precondition", "Online ordering is temporarily unavailable for this shop.");
    }
    if (cashfreeConfigured()) {
        try {
            const vendor = await fetchVendor(vendorId);
            if (String(vendor.status).toUpperCase() !== "ACTIVE") {
                throw new HttpsError("failed-precondition", "Online ordering is temporarily unavailable for this shop.");
            }
        }
        catch (err) {
            if (err instanceof HttpsError)
                throw err;
            logger.error("vendor lookup failed", { vendorId, err });
            throw new HttpsError("failed-precondition", "Online ordering is temporarily unavailable for this shop.");
        }
    }
    /* -- authoritative pricing ---------------------------------------------- */
    const config = await loadCommission();
    const items = [];
    let subtotal = 0;
    for (const line of lines) {
        const quantity = Math.floor(Number(line.quantity));
        if (!Number.isFinite(quantity) || quantity < 1 || quantity > 50) {
            throw new HttpsError("failed-precondition", "Your cart has changed. Please review your order.");
        }
        const itemSnap = await db
            .collection("shops")
            .doc(shopId)
            .collection("menuItems")
            .doc(String(line.itemId))
            .get();
        const item = itemSnap.data();
        if (!itemSnap.exists || !item || item["available"] === false) {
            throw new HttpsError("failed-precondition", "Your cart has changed. Please review your order.");
        }
        const price = round2(Number(item["price"]));
        const itemTotal = round2(price * quantity);
        subtotal += itemTotal;
        items.push({
            itemId: item["itemId"] ?? itemSnap.id,
            name: item["name"],
            price,
            quantity,
            itemTotal,
        });
    }
    const amounts = computeAmounts(subtotal, config);
    if (amounts.customerAmount <= 0) {
        throw new HttpsError("failed-precondition", "Your cart has changed. Please review your order.");
    }
    const orderRef = db.collection("orders").doc();
    const orderId = orderRef.id;
    const sequence = await nextSequence("orderNumber");
    const orderNumber = receiptNumber(sequence);
    const user = (await db.collection("users").doc(uid).get()).data();
    await orderRef.set({
        orderId,
        orderNumber,
        studentId: uid,
        studentName: user?.["name"] ?? "Student",
        shopId,
        shopName: shop["name"],
        vendorId,
        items,
        subtotal: amounts.subtotal,
        discount: amounts.discount,
        platformCommission: amounts.platformCommission,
        paymentGatewayCharges: amounts.cashfreeCharges,
        shopAmount: amounts.shopGrossAmount,
        shopNetAmount: amounts.shopNetAmount,
        refundAmount: 0,
        totalAmount: amounts.customerAmount,
        currency: "INR",
        paymentStatus: "PENDING",
        orderStatus: "PENDING_PAYMENT",
        receiptId: null,
        idempotencyKey,
        environment: cashfreeEnv(),
        commissionConfig: config,
        createdAt: now(),
        updatedAt: now(),
    });
    await audit("PAYMENT_CREATED", { orderId, studentId: uid, shopId, amount: amounts.customerAmount });
    if (!cashfreeConfigured()) {
        throw new HttpsError("failed-precondition", "Payment could not be started.");
    }
    let paymentSessionId;
    try {
        const session = await createSplitOrder({
            orderId,
            amount: amounts.customerAmount,
            currency: "INR",
            customer: {
                id: uid,
                name: user?.["name"] ?? "Student",
                email: user?.["email"] ?? req.auth?.token.email ?? "",
                phone: String(user?.["phone"] ?? "9999999999"),
            },
            vendorId,
            shopAmount: amounts.shopGrossAmount,
            returnUrl,
            idempotencyKey,
        });
        paymentSessionId = session.payment_session_id;
        await orderRef.update({
            paymentSessionId,
            cashfreeOrderId: session.order_id,
            updatedAt: now(),
        });
    }
    catch (err) {
        logger.error("cashfree order creation failed", { orderId, err });
        await orderRef.update({ paymentStatus: "FAILED", orderStatus: "CANCELLED", updatedAt: now() });
        await audit("PAYMENT_FAILED", { orderId, reason: "SESSION_CREATE_FAILED" });
        throw new HttpsError("internal", "Payment could not be started.");
    }
    return {
        orderId,
        orderNumber,
        paymentSessionId,
        totalAmount: amounts.customerAmount,
        environment: cashfreeEnv(),
    };
});
/** Amount/currency/order must all match before a payment counts as ours. */
function paymentMatches(order, amount, currency) {
    return (Math.abs(round2(amount) - round2(Number(order["totalAmount"]))) < 0.01 &&
        String(currency).toUpperCase() === String(order["currency"] ?? "INR").toUpperCase());
}
/**
 * Authoritative payment check. Never trusts the browser: it re-reads the order
 * from Cashfree, confirms amount, currency and ownership, then issues the
 * receipt. The webhook runs the same path independently; the transaction in
 * markPaidAndIssueReceipt makes both idempotent.
 */
export const verifyCashfreePayment = onCall({ secrets: CASHFREE_SECRETS }, async (req) => {
    const uid = requireAuth(req.auth?.uid);
    const orderId = String(req.data?.orderId ?? "");
    const snap = await db.collection("orders").doc(orderId).get();
    if (!snap.exists)
        throw new HttpsError("not-found", "Order not found.");
    const order = snap.data();
    if (order["studentId"] !== uid)
        throw new HttpsError("permission-denied", "Not your order.");
    if (order["receiptId"]) {
        return { status: "SUCCESS", receiptId: order["receiptId"] };
    }
    if (!cashfreeConfigured())
        throw new HttpsError("failed-precondition", "Payment could not be started.");
    const remote = await fetchOrder(orderId);
    const status = String(remote.order_status).toUpperCase();
    if (status === "PAID") {
        if (!paymentMatches(order, remote.order_amount, remote.order_currency)) {
            logger.error("amount mismatch on verify", { orderId });
            throw new HttpsError("failed-precondition", "Your order could not be confirmed.");
        }
        const payments = await fetchOrderPayments(orderId);
        const success = payments.find((p) => String(p.payment_status).toUpperCase() === "SUCCESS");
        const receiptId = await markPaidAndIssueReceipt(orderId, {
            cfPaymentId: success?.cf_payment_id ? String(success.cf_payment_id) : null,
            cfOrderId: String(remote.order_id ?? orderId),
        });
        return { status: "SUCCESS", receiptId };
    }
    if (status === "ACTIVE") {
        // Still awaiting a completed attempt: pending, never a receipt.
        const payments = await fetchOrderPayments(orderId);
        const pending = payments.some((p) => ["PENDING", "USER_DROPPED", "NOT_ATTEMPTED"].includes(String(p.payment_status).toUpperCase()));
        return { status: pending ? "PENDING" : "PENDING", receiptId: null };
    }
    await db.collection("orders").doc(orderId).update({
        paymentStatus: "FAILED",
        orderStatus: "CANCELLED",
        updatedAt: now(),
    });
    await audit("PAYMENT_FAILED", { orderId, cashfreeStatus: status });
    return { status: "FAILED", receiptId: null };
});
/* -------------------------------------------------------------- webhook -- */
/**
 * Cashfree webhook — the authoritative payment signal. Signature-verified,
 * replay-safe (each event id is recorded once) and idempotent.
 */
export const cashfreeWebhook = onRequest({ secrets: WEBHOOK_SECRETS }, async (req, res) => {
    const raw = req.rawBody?.toString() ?? "";
    const timestamp = String(req.headers["x-webhook-timestamp"] ?? "");
    const signature = String(req.headers["x-webhook-signature"] ?? "");
    if (!verifyWebhookSignature(raw, timestamp, signature)) {
        res.status(401).send("Invalid signature");
        return;
    }
    let payload;
    try {
        payload = JSON.parse(raw);
    }
    catch {
        res.status(400).send("Invalid payload");
        return;
    }
    const type = String(payload["type"] ?? "");
    const data = (payload["data"] ?? {});
    const orderId = String(data["order"]?.["order_id"] ?? "");
    if (!orderId) {
        res.status(200).send("ignored");
        return;
    }
    // Replay guard: the same event id is processed exactly once.
    const eventId = `${type}:${orderId}:${String(data["payment"]?.["cf_payment_id"] ?? data["refund"]?.["refund_id"] ?? timestamp)}`;
    const eventRef = db.collection("webhookEvents").doc(eventId.replace(/\//g, "_"));
    const fresh = await db.runTransaction(async (tx) => {
        const snap = await tx.get(eventRef);
        if (snap.exists)
            return false;
        tx.set(eventRef, { eventId, type, orderId, receivedAt: now() });
        return true;
    });
    if (!fresh) {
        res.status(200).send("duplicate");
        return;
    }
    try {
        const orderSnap = await db.collection("orders").doc(orderId).get();
        const order = orderSnap.data();
        if (type === "PAYMENT_SUCCESS_WEBHOOK" && order) {
            const payment = (data["payment"] ?? {});
            const amount = Number(payment["payment_amount"] ?? data["order"]?.["order_amount"] ?? 0);
            const currency = String(payment["payment_currency"] ?? "INR");
            if (!paymentMatches(order, amount, currency)) {
                logger.error("webhook amount mismatch", { orderId, amount });
                res.status(200).send("mismatch");
                return;
            }
            await markPaidAndIssueReceipt(orderId, {
                cfPaymentId: payment["cf_payment_id"] ? String(payment["cf_payment_id"]) : null,
                cfOrderId: orderId,
            });
        }
        else if (type === "PAYMENT_FAILED_WEBHOOK" ||
            type === "PAYMENT_USER_DROPPED_WEBHOOK") {
            if (order && !order["receiptId"]) {
                await db.collection("orders").doc(orderId).update({
                    paymentStatus: "FAILED",
                    orderStatus: "CANCELLED",
                    updatedAt: now(),
                });
                await audit("PAYMENT_FAILED", { orderId, type });
            }
        }
        else if (type.startsWith("REFUND")) {
            const refund = (data["refund"] ?? {});
            const refundAmount = round2(Number(refund["refund_amount"] ?? 0));
            const refundStatus = String(refund["refund_status"] ?? "").toUpperCase();
            if (order) {
                const total = Number(order["totalAmount"] ?? 0);
                const full = refundAmount >= total - 0.01;
                const paymentStatus = refundStatus === "SUCCESS"
                    ? full
                        ? "REFUNDED"
                        : "PARTIALLY_REFUNDED"
                    : order["paymentStatus"];
                await db.collection("orders").doc(orderId).update({
                    paymentStatus,
                    refundAmount,
                    updatedAt: now(),
                });
                await db
                    .collection("transactions")
                    .doc(orderId)
                    .set({
                    paymentStatus: refundStatus === "SUCCESS"
                        ? full
                            ? "REFUNDED"
                            : "PARTIALLY_REFUNDED"
                        : "REFUND_PENDING",
                    refundAmount,
                    updatedAt: now(),
                }, { merge: true });
                await audit(refundStatus === "SUCCESS" ? "REFUND_COMPLETED" : "REFUND_PENDING", {
                    orderId,
                    refundAmount,
                });
            }
        }
        else if (type.includes("SETTLEMENT")) {
            const settlement = (data["settlement"] ?? data["order"] ?? {});
            const charges = round2(Number(settlement["service_charge"] ?? 0) + Number(settlement["service_tax"] ?? 0));
            await db
                .collection("transactions")
                .doc(orderId)
                .set({
                settlementStatus: "SETTLED",
                cashfreeCharges: charges,
                settledAt: now(),
                updatedAt: now(),
            }, { merge: true });
            if (order) {
                const borneByShop = order["commissionConfig"]?.["gatewayChargesBorneBy"] === "SHOP";
                await db
                    .collection("orders")
                    .doc(orderId)
                    .update({
                    paymentGatewayCharges: charges,
                    shopNetAmount: round2(Number(order["shopAmount"] ?? 0) - (borneByShop ? charges : 0)),
                    updatedAt: now(),
                });
            }
            await audit("SETTLEMENT_RECEIVED", { orderId, charges });
        }
    }
    catch (err) {
        logger.error("webhook processing failed", { orderId, type, err });
        // Let Cashfree retry: the replay guard is keyed on the event, so clear it.
        await eventRef.delete().catch(() => undefined);
        res.status(500).send("retry");
        return;
    }
    res.status(200).send("ok");
});
/* ------------------------------------------------------------ redemption -- */
/**
 * One-time pickup redemption. The swipe is a gesture; this transaction is the
 * guarantee. Only the shop that owns the receipt may redeem it — never the
 * student, and never another shop.
 */
export const redeemReceipt = onCall(async (req) => {
    const uid = requireAuth(req.auth?.uid);
    const receiptId = String(req.data?.receiptId ?? "");
    const receiptNo = String(req.data?.receiptNumber ?? "").trim().toUpperCase();
    let ref = db.collection("receipts").doc(receiptId);
    if (!receiptId && receiptNo) {
        const found = await db
            .collection("receipts")
            .where("receiptNumber", "==", receiptNo)
            .limit(1)
            .get();
        const first = found.docs[0];
        if (!first)
            throw new HttpsError("not-found", "Receipt not found.");
        ref = first.ref;
    }
    const redeemedAt = await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists)
            throw new HttpsError("not-found", "Receipt not found.");
        const receipt = snap.data();
        const orderRef = db.collection("orders").doc(receipt["orderId"]);
        const orderSnap = await tx.get(orderRef);
        const order = orderSnap.data();
        const shopSnap = await tx.get(db.collection("shops").doc(receipt["shopId"]));
        const shop = shopSnap.data();
        // Shop-scoped authority: the counter redeems, the student never can.
        if (!shop || shop["ownerId"] !== uid) {
            throw new HttpsError("permission-denied", "Only the shop counter can confirm pickup.");
        }
        if (!order || order["orderId"] !== receipt["orderId"] || order["paymentStatus"] !== "PAID") {
            throw new HttpsError("failed-precondition", "This receipt is not payable.");
        }
        if (receipt["status"] === "REDEEMED") {
            throw new HttpsError("failed-precondition", "Receipt already used.");
        }
        tx.update(ref, {
            status: "REDEEMED",
            redeemedAt: now(),
            redeemedBy: uid,
            updatedAt: now(),
        });
        tx.update(orderRef, { orderStatus: "COMPLETED", updatedAt: now() });
        return new Date().toISOString();
    });
    await audit("RECEIPT_REDEEMED", { receiptId: ref.id, actorId: uid });
    return { redeemedAt, receiptId: ref.id };
});
/* --------------------------------------------------------------- vendor -- */
/** Registers a shop for Easy Split payouts. Only the shop's owner may call it. */
export const connectShopPayouts = onCall({ secrets: CASHFREE_SECRETS }, async (req) => {
    const uid = requireAuth(req.auth?.uid);
    const shopId = String(req.data?.shopId ?? "");
    const ref = db.collection("shops").doc(shopId);
    const snap = await ref.get();
    if (!snap.exists)
        throw new HttpsError("not-found", "Shop not found.");
    const shop = snap.data();
    if (shop["ownerId"] !== uid)
        throw new HttpsError("permission-denied", "Not your shop.");
    if (!cashfreeConfigured()) {
        throw new HttpsError("failed-precondition", "Payments are not configured yet.");
    }
    const vendorId = shop["vendorId"] ?? `shop_${shopId}`;
    const vendor = await createVendor({
        vendorId,
        name: shop["name"],
        email: shop["contactEmail"] ?? req.auth?.token.email ?? "",
        phone: String(shop["contactNumber"] ?? ""),
        bank: req.data?.bank,
        upi: req.data?.upi,
    });
    const active = String(vendor.status).toUpperCase() === "ACTIVE";
    await ref.update({
        vendorId,
        payoutConfigured: active,
        vendorStatus: vendor.status,
        updatedAt: now(),
    });
    await audit("VENDOR_CONNECTED", { shopId, vendorId, status: vendor.status });
    return { vendorId, status: vendor.status, payoutConfigured: active };
});
/* -------------------------------------------------------------- refunds -- */
/**
 * Full or partial refund through Cashfree, with the Easy Split share reversed
 * proportionally so vendor and platform accounting stay correct. Authorised
 * for the shop owner or SUPER_ADMIN only; no custom money movement.
 */
export const refundOrder = onCall({ secrets: CASHFREE_SECRETS }, async (req) => {
    const uid = requireAuth(req.auth?.uid);
    const orderId = String(req.data?.orderId ?? "");
    const requested = Number(req.data?.amount ?? 0);
    const orderRef = db.collection("orders").doc(orderId);
    const snap = await orderRef.get();
    if (!snap.exists)
        throw new HttpsError("not-found", "Order not found.");
    const order = snap.data();
    if (order["paymentStatus"] !== "PAID" && order["paymentStatus"] !== "PARTIALLY_REFUNDED") {
        throw new HttpsError("failed-precondition", "This order cannot be refunded.");
    }
    const shop = (await db.collection("shops").doc(order["shopId"]).get()).data();
    const allowed = shop?.["ownerId"] === uid || (await isSuperAdmin(uid));
    if (!allowed)
        throw new HttpsError("permission-denied", "Not allowed.");
    if (!cashfreeConfigured())
        throw new HttpsError("failed-precondition", "Payments are not configured.");
    const total = round2(Number(order["totalAmount"]));
    const alreadyRefunded = round2(Number(order["refundAmount"] ?? 0));
    const amount = round2(requested > 0 ? Math.min(requested, total - alreadyRefunded) : total - alreadyRefunded);
    if (amount <= 0)
        throw new HttpsError("failed-precondition", "Nothing left to refund.");
    const ratio = amount / total;
    const vendorShare = round2(Number(order["shopAmount"] ?? 0) * ratio);
    const refundId = `rf_${orderId}_${Math.round(alreadyRefunded * 100)}`;
    const refund = await createRefund({
        orderId,
        refundId,
        refundAmount: amount,
        refundSplits: order["vendorId"]
            ? [{ vendor_id: order["vendorId"], amount: vendorShare }]
            : undefined,
    });
    await db
        .collection("transactions")
        .doc(orderId)
        .set({
        paymentStatus: "REFUND_PENDING",
        refundAmount: round2(alreadyRefunded + amount),
        refundVendorShare: vendorShare,
        refundPlatformShare: round2(amount - vendorShare),
        updatedAt: now(),
    }, { merge: true });
    await orderRef.update({ refundAmount: round2(alreadyRefunded + amount), updatedAt: now() });
    await audit("REFUND_INITIATED", { orderId, amount, vendorShare, actorId: uid });
    return { refundId: refund.refund_id, status: refund.refund_status, amount };
});
/* ----------------------------------------------------------- reporting -- */
/** Platform-level financial roll-up. SUPER_ADMIN only. */
export const platformFinancials = onCall(async (req) => {
    const uid = requireAuth(req.auth?.uid);
    if (!(await isSuperAdmin(uid)))
        throw new HttpsError("permission-denied", "Not allowed.");
    const since = Timestamp.fromMillis(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const snap = await db.collection("transactions").where("createdAt", ">=", since).get();
    const totals = {
        customerAmount: 0,
        platformCommission: 0,
        shopAmount: 0,
        cashfreeCharges: 0,
        refundAmount: 0,
        successfulPayments: 0,
        settled: 0,
        pendingSettlement: 0,
    };
    snap.forEach((d) => {
        const t = d.data();
        totals.customerAmount += Number(t["customerAmount"] ?? 0);
        totals.platformCommission += Number(t["platformCommission"] ?? 0);
        totals.shopAmount += Number(t["shopAmount"] ?? 0);
        totals.cashfreeCharges += Number(t["cashfreeCharges"] ?? 0);
        totals.refundAmount += Number(t["refundAmount"] ?? 0);
        if (t["paymentStatus"] === "PAYMENT_SUCCESS")
            totals.successfulPayments += 1;
        if (t["settlementStatus"] === "SETTLED")
            totals.settled += Number(t["shopAmount"] ?? 0);
        else
            totals.pendingSettlement += Number(t["shopAmount"] ?? 0);
    });
    return Object.fromEntries(Object.entries(totals).map(([k, v]) => [k, round2(v)]));
});
/**
 * Provision a shop owner account and shop. Only callable by SUPER_ADMIN.
 * This function uses the Admin SDK to create the Authentication account and
 * two Firestore documents: users/{uid} and shops/{shopId}. It returns the
 * newly created owner UID, shopId and the temporaryPassword (only once).
 */
export const createShopOwnerAndShop = onCall(async (req) => {
    const callerUid = req.auth?.uid;
    if (!callerUid)
        throw new HttpsError("unauthenticated", "Please sign in.");
    // Verify caller is SUPER_ADMIN by reading their user profile.
    const callerDoc = await db.collection("users").doc(callerUid).get();
    const caller = callerDoc.exists ? callerDoc.data() : null;
    if (!caller || caller["role"] !== "SUPER_ADMIN") {
        throw new HttpsError("permission-denied", "Not authorised.");
    }
    const data = req.data;
    const ownerName = String(data?.ownerName ?? "").trim();
    const ownerEmail = String(data?.ownerEmail ?? "").trim().toLowerCase();
    const ownerPhone = String(data?.ownerPhone ?? "").trim();
    const temporaryPassword = String(data?.temporaryPassword ?? "");
    const shop = data?.shop ?? {};
    if (!ownerName || !ownerEmail || !temporaryPassword || !shop?.name) {
        throw new HttpsError("invalid-argument", "Missing required fields.");
    }
    // Prevent duplicate emails.
    try {
        await auth.getUserByEmail(ownerEmail);
        throw new HttpsError("already-exists", "This email is already registered.");
    }
    catch (err) {
        if (err.code && err.code !== "auth/user-not-found") {
            // Unexpected admin error.
            throw new HttpsError("internal", "Unable to verify email.");
        }
    }
    // Create the auth user.
    let createdUser;
    try {
        createdUser = await auth.createUser({
            email: ownerEmail,
            password: temporaryPassword,
            displayName: ownerName,
        });
    }
    catch (err) {
        throw new HttpsError("internal", "Unable to create authentication account.");
    }
    const ownerUid = createdUser.uid;
    // Create users/{uid}
    const userDoc = {
        uid: ownerUid,
        name: ownerName,
        email: ownerEmail,
        phone: ownerPhone || "",
        role: "SHOP_OWNER",
        mustChangePassword: true,
        createdBy: callerUid,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
    };
    // Create shops/{shopId}
    const shopRef = db.collection("shops").doc();
    const shopId = shopRef.id;
    const shopDoc = {
        shopId,
        ownerId: ownerUid,
        name: String(shop.name ?? "").trim(),
        description: String(shop.description ?? "").trim(),
        category: String(shop.category ?? "").trim(),
        logoUrl: shop.logo?.url ?? null,
        logoPublicId: shop.logo?.publicId ?? null,
        coverImageUrl: shop.cover?.url ?? null,
        coverPublicId: shop.cover?.publicId ?? null,
        location: String(shop.campus ?? "").trim(),
        contactNumber: String(shop.phone ?? "").trim(),
        contactEmail: String(shop.email ?? "").trim(),
        preparationTime: String(shop.prepTime ?? "").trim(),
        rating: 5,
        status: String(shop.status ?? "CLOSED").toUpperCase(),
        openingHours: shop.hours ?? [],
        vendorId: null,
        payoutConfigured: false,
        createdBy: callerUid,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
    };
    try {
        const batch = db.batch();
        batch.set(db.collection("users").doc(ownerUid), userDoc);
        batch.set(shopRef, shopDoc);
        await batch.commit();
    }
    catch (err) {
        // Try to clean up the created auth user if Firestore write failed.
        try {
            await auth.deleteUser(ownerUid);
        }
        catch (e) {
            logger.error("Failed to delete orphaned auth user", { ownerUid });
        }
        throw new HttpsError("internal", "Unable to create user or shop.");
    }
    return {
        ownerUid,
        shopId,
        temporaryPassword,
        ownerEmail,
    };
});
