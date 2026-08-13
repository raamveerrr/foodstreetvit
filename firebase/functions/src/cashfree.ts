/**
 * Cashfree marketplace (Easy Split) integration.
 *
 * Every shop is a Cashfree *vendor*. When a student pays, the order is created
 * with a split: the shop's vendor gets the shop amount, the platform keeps the
 * commission. Cashfree settles each side directly — money never pools in a
 * single shared account.
 *
 * Credentials live in function config only:
 *   firebase functions:secrets:set CASHFREE_APP_ID
 *   firebase functions:secrets:set CASHFREE_SECRET_KEY
 *   firebase functions:secrets:set CASHFREE_WEBHOOK_SECRET
 */
import crypto from "node:crypto";

const API_VERSION = "2023-08-01";

const baseUrl = () =>
  process.env["CASHFREE_ENV"] === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

const headers = () => ({
  "Content-Type": "application/json",
  "x-api-version": API_VERSION,
  "x-client-id": process.env["CASHFREE_APP_ID"] ?? "",
  "x-client-secret": process.env["CASHFREE_SECRET_KEY"] ?? "",
});

async function call<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${baseUrl()}${path}`, { ...init, headers: headers() });
  const json = (await res.json()) as T & { message?: string };
  if (!res.ok) throw new Error(json.message ?? "Cashfree request failed");
  return json;
}

export interface VendorInput {
  vendorId: string;
  name: string;
  email: string;
  phone: string;
  bank?: { accountNumber: string; ifsc: string; accountHolder: string };
  upi?: { vpa: string };
}

/** Registers a shop as a Cashfree vendor so payouts settle to the shop. */
export async function createVendor(input: VendorInput) {
  return call<{ vendor_id: string; status: string }>("/easy-split/vendors", {
    method: "POST",
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

export interface SplitOrderInput {
  orderId: string;
  amount: number;
  currency: string;
  customer: { id: string; name: string; email: string; phone: string };
  vendorId: string;
  shopAmount: number;
  returnUrl: string;
}

/** Creates a Cashfree order carrying the vendor split. */
export async function createSplitOrder(input: SplitOrderInput) {
  return call<{ payment_session_id: string; order_id: string }>("/orders", {
    method: "POST",
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
      order_meta: { return_url: input.returnUrl },
      order_splits: [{ vendor_id: input.vendorId, amount: input.shopAmount }],
    }),
  });
}

export async function fetchOrder(orderId: string) {
  return call<{ order_status: string; order_amount: number }>(`/orders/${orderId}`, {
    method: "GET",
  });
}

/** Cashfree signs webhooks as base64(HMAC-SHA256(timestamp + rawBody)). */
export function verifyWebhookSignature(
  rawBody: string,
  timestamp: string,
  signature: string,
): boolean {
  const secret = process.env["CASHFREE_WEBHOOK_SECRET"] ?? "";
  const expected = crypto
    .createHmac("sha256", secret)
    .update(timestamp + rawBody)
    .digest("base64");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature ?? "");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
