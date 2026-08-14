/**
 * Cashfree PG + Easy Split integration.
 *
 * Every shop is a Cashfree *vendor*. When a student pays, the order is created
 * with an order split: the shop's vendor gets the shop amount, the platform
 * keeps the commission. Cashfree settles each side — money never pools in a
 * single shared account and this app never moves money itself.
 *
 * Endpoints, headers, signature scheme and field names follow the Cashfree
 * PG API (version pinned via CASHFREE_API_VERSION, default 2023-08-01).
 *
 * Credentials live in function secrets only:
 *   firebase functions:secrets:set CASHFREE_APP_ID
 *   firebase functions:secrets:set CASHFREE_SECRET_KEY
 *   firebase functions:secrets:set CASHFREE_WEBHOOK_SECRET
 * Environment selection:
 *   CASHFREE_ENV=sandbox (default) | production
 */
import crypto from "node:crypto";

const apiVersion = () => process.env["CASHFREE_API_VERSION"] ?? "2023-08-01";

export const cashfreeEnv = () =>
  process.env["CASHFREE_ENV"] === "production" ? "production" : "sandbox";

export const cashfreeConfigured = () =>
  Boolean(process.env["CASHFREE_APP_ID"] && process.env["CASHFREE_SECRET_KEY"]);

const baseUrl = () =>
  cashfreeEnv() === "production" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";

const headers = (idempotencyKey?: string) => ({
  "Content-Type": "application/json",
  "x-api-version": apiVersion(),
  "x-client-id": process.env["CASHFREE_APP_ID"] ?? "",
  "x-client-secret": process.env["CASHFREE_SECRET_KEY"] ?? "",
  ...(idempotencyKey ? { "x-idempotency-key": idempotencyKey } : {}),
});

async function call<T>(
  path: string,
  init: RequestInit & { idempotencyKey?: string },
): Promise<T> {
  const { idempotencyKey, ...rest } = init;
  const res = await fetch(`${baseUrl()}${path}`, {
    ...rest,
    headers: headers(idempotencyKey),
  });
  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { message: text };
  }
  if (!res.ok) {
    const message = (json as { message?: string }).message ?? `Cashfree request failed (${res.status})`;
    const error = new Error(message) as Error & { status?: number; body?: unknown };
    error.status = res.status;
    error.body = json;
    throw error;
  }
  return json as T;
}

/* -------------------------------------------------------------- vendors -- */

export interface VendorInput {
  vendorId: string;
  name: string;
  email: string;
  phone: string;
  bank?: { accountNumber: string; ifsc: string; accountHolder: string };
  upi?: { vpa: string };
}

export interface VendorResponse {
  vendor_id: string;
  status: string;
  /** KYC/verification detail as returned by Cashfree, when present. */
  kyc_details?: unknown;
}

/** Registers a shop as an Easy Split vendor so payouts settle to the shop. */
export async function createVendor(input: VendorInput): Promise<VendorResponse> {
  return call<VendorResponse>("/easy-split/vendors", {
    method: "POST",
    idempotencyKey: input.vendorId,
    body: JSON.stringify({
      vendor_id: input.vendorId,
      status: "ACTIVE",
      name: input.name,
      email: input.email,
      phone: input.phone,
      verify_account: true,
      dashboard_access: false,
      schedule_option: 1,
      ...(input.bank
        ? {
            bank: {
              account_number: input.bank.accountNumber,
              account_holder: input.bank.accountHolder,
              ifsc: input.bank.ifsc,
            },
          }
        : {}),
      ...(input.upi ? { upi: { vpa: input.upi.vpa, account_holder: input.name } } : {}),
    }),
  });
}

/** Reads a vendor so payment readiness can be verified before charging. */
export async function fetchVendor(vendorId: string): Promise<VendorResponse> {
  return call<VendorResponse>(`/easy-split/vendors/${encodeURIComponent(vendorId)}`, {
    method: "GET",
  });
}

/* --------------------------------------------------------------- orders -- */

export interface SplitOrderInput {
  orderId: string;
  amount: number;
  currency: string;
  customer: { id: string; name: string; email: string; phone: string };
  vendorId: string;
  shopAmount: number;
  returnUrl: string;
  notifyUrl?: string;
  /** Reused across retries so a re-submitted attempt never double-charges. */
  idempotencyKey: string;
}

export interface CashfreeOrderResponse {
  cf_order_id?: string | number;
  order_id: string;
  order_status: string;
  order_amount: number;
  order_currency: string;
  payment_session_id: string;
}

/** Creates a Cashfree order carrying the Easy Split vendor share. */
export async function createSplitOrder(input: SplitOrderInput): Promise<CashfreeOrderResponse> {
  return call<CashfreeOrderResponse>("/orders", {
    method: "POST",
    idempotencyKey: input.idempotencyKey,
    body: JSON.stringify({
      order_id: input.orderId,
      order_amount: input.amount,
      order_currency: input.currency,
      customer_details: {
        customer_id: input.customer.id,
        customer_name: input.customer.name,
        customer_email: input.customer.email,
        customer_phone: input.customer.phone,
      },
      order_meta: {
        return_url: input.returnUrl,
        ...(input.notifyUrl ? { notify_url: input.notifyUrl } : {}),
      },
      order_splits: [{ vendor_id: input.vendorId, amount: input.shopAmount }],
    }),
  });
}

export async function fetchOrder(orderId: string): Promise<CashfreeOrderResponse> {
  return call<CashfreeOrderResponse>(`/orders/${encodeURIComponent(orderId)}`, { method: "GET" });
}

export interface CashfreePayment {
  cf_payment_id?: string | number;
  payment_status: string;
  payment_amount: number;
  payment_currency: string;
  payment_time?: string;
  payment_group?: string;
  payment_message?: string;
}

/** All payment attempts for an order — used to pick the authoritative one. */
export async function fetchOrderPayments(orderId: string): Promise<CashfreePayment[]> {
  const res = await call<CashfreePayment[]>(
    `/orders/${encodeURIComponent(orderId)}/payments`,
    { method: "GET" },
  );
  return Array.isArray(res) ? res : [];
}

/* -------------------------------------------------------------- refunds -- */

export interface RefundInput {
  orderId: string;
  refundId: string;
  refundAmount: number;
  refundNote?: string;
  /** Easy Split refund shares, so the vendor and platform are both adjusted. */
  refundSplits?: { vendor_id: string; amount: number }[];
}

export interface CashfreeRefund {
  cf_refund_id?: string | number;
  refund_id: string;
  refund_status: string;
  refund_amount: number;
}

export async function createRefund(input: RefundInput): Promise<CashfreeRefund> {
  return call<CashfreeRefund>(`/orders/${encodeURIComponent(input.orderId)}/refunds`, {
    method: "POST",
    idempotencyKey: input.refundId,
    body: JSON.stringify({
      refund_id: input.refundId,
      refund_amount: input.refundAmount,
      refund_note: input.refundNote ?? "DigitalFoodStreet refund",
      ...(input.refundSplits ? { refund_splits: input.refundSplits } : {}),
    }),
  });
}

/* ------------------------------------------------------------- webhooks -- */

/** Cashfree signs webhooks as base64(HMAC-SHA256(timestamp + rawBody)). */
export function verifyWebhookSignature(
  rawBody: string,
  timestamp: string,
  signature: string,
): boolean {
  const secret = process.env["CASHFREE_WEBHOOK_SECRET"] ?? "";
  if (!secret || !timestamp || !signature) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(timestamp + rawBody)
    .digest("base64");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
