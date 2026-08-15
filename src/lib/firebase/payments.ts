import { httpsCallable } from "firebase/functions";
import { getFns } from "./client";
import { friendlyError } from "./errors";

/**
 * Cashfree checkout client.
 *
 * The browser never computes money and never marks anything paid: it asks the
 * Cloud Function for a payment session, hands the user to Cashfree, and then
 * asks the Cloud Function what actually happened.
 */

export interface CheckoutSession {
  orderId: string;
  orderNumber?: string;
  paymentSessionId?: string;
  totalAmount?: number;
  environment?: "sandbox" | "production";
  alreadyPaid?: boolean;
  receiptId?: string | null;
}

export interface VerifyResult {
  status: "SUCCESS" | "PENDING" | "FAILED";
  receiptId: string | null;
}

export async function createCheckoutOrder(input: {
  shopId: string;
  items: { itemId: string; quantity: number }[];
  idempotencyKey: string;
  returnUrl: string;
}): Promise<CheckoutSession> {
  try {
    const call = httpsCallable<typeof input, CheckoutSession>(getFns(), "createCheckoutOrder");
    return (await call(input)).data;
  } catch (err) {
    throw new Error(friendlyError(err, "Payment could not be started."));
  }
}

export async function verifyCashfreePayment(orderId: string): Promise<VerifyResult> {
  try {
    const call = httpsCallable<{ orderId: string }, VerifyResult>(
      getFns(),
      "verifyCashfreePayment",
    );
    return (await call({ orderId })).data;
  } catch (err) {
    throw new Error(friendlyError(err, "We couldn't confirm your payment."));
  }
}

/* ------------------------------------------------------------ SDK loader -- */

type CashfreeInstance = {
  checkout: (options: {
    paymentSessionId: string;
    redirectTarget?: "_self" | "_blank" | "_modal";
  }) => Promise<{ error?: { message?: string }; paymentDetails?: unknown }>;
};

declare global {
  interface Window {
    Cashfree?: (config: { mode: "sandbox" | "production" }) => CashfreeInstance;
  }
}

const SDK_URL = "https://sdk.cashfree.com/js/v3/cashfree.js";
let sdkPromise: Promise<void> | null = null;

function loadSdk(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Browser only"));
  if (window.Cashfree) return Promise.resolve();
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      sdkPromise = null;
      reject(new Error("Payment could not be started."));
    };
    document.head.appendChild(script);
  });
  return sdkPromise;
}

/**
 * Opens the Cashfree hosted checkout in a modal. Resolving here only means the
 * modal closed — the payment result always comes from verifyCashfreePayment.
 */
export async function openCashfreeCheckout(
  paymentSessionId: string,
  environment: "sandbox" | "production" = "sandbox",
): Promise<void> {
  await loadSdk();
  const factory = window.Cashfree;
  if (!factory) throw new Error("Payment could not be started.");
  const cashfree = factory({ mode: environment });
  const result = await cashfree.checkout({ paymentSessionId, redirectTarget: "_modal" });
  if (result?.error?.message) throw new Error(result.error.message);
}
