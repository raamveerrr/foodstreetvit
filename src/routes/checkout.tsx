import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Wallet } from "lucide-react";
import { BackBar } from "@/components/app/BackBar";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — DigitalFoodStreet" },
      { name: "description", content: "Pay and get your digital pickup receipt instantly." },
      { property: "og:title", content: "Checkout — DigitalFoodStreet" },
      { property: "og:description", content: "Pay and get your digital pickup receipt instantly." },
    ],
  }),
  component: CheckoutPage,
});

const STEP_LABEL: Record<string, string> = {
  idle: "Processing…",
  validating: "Checking your items…",
  creating: "Starting secure payment…",
  paying: "Complete payment in the window…",
  verifying: "Confirming your payment…",
};

function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, cartShopName, subtotal, discount, total, placeOrder, checkoutStep } = useStore();
  const { ready, profile, firebaseUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (ready && !firebaseUser) {
      toast.error("Please sign in to checkout");
      navigate({ to: "/login", replace: true });
    }
  }, [ready, firebaseUser, navigate]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const cfOrderId = searchParams.get("cf_order_id");
    const cfVerify = searchParams.get("cf_verify");

    if (cfOrderId && cfVerify === "true" && ready && firebaseUser) {
      verifyReturnPayment(cfOrderId);
    }
  }, [ready, firebaseUser]);

  const verifyReturnPayment = async (orderId: string) => {
    if (verifying) return;
    setVerifying(true);
    setLoading(true);
    let success = false;
    try {
      // Uses dynamic import of supabase from data layer or generic API to avoid large file diffs, wait, I can just use supabase from lib 
      const { supabase } = await import("@/lib/supabase");
      const { data: verRes, error } = await supabase.functions.invoke("verify-cashfree-payment", {
        body: { cashfreeOrderId: orderId }
      });

      if (error || !verRes || !verRes.success) {
        toast.error(verRes?.message || "Payment verification failed.");
        return;
      }

      if (verRes.order_status === "PAID" && verRes.receipt_id) {
        toast.success("Payment verified! Receipt ready.");
        success = true;
        navigate({ to: "/order/$receiptId", params: { receiptId: verRes.receipt_id }, replace: true });
      } else {
        toast.error("Payment status is: " + verRes.order_status);
      }
    } catch (e) {
      toast.error("Payment Verification Error");
    } finally {
      setLoading(false);
      if (!success) {
        setVerifying(false);
        navigate({ to: "/checkout", replace: true }); // Clear params only if it failed
      }
    }
  };

  if (!ready || !firebaseUser) return null;

  const pay = async () => {
    if (loading) return; // guards double taps, refreshes and retries
    setLoading(true);
    try {
      const result = await placeOrder();
      // placeOrder now triggers web SDK redirect, so this won't hit immediately unless it's a fallback 
      if (result?.receiptId) {
        toast.success("Order confirmed · Receipt ready");
        navigate({ to: "/order/$receiptId", params: { receiptId: result.receiptId } });
      }
    } finally {
      // Don't turn off loading if placing effectively takes you out of the frame
      // setLoading(false);
    }
  };

  return (
    <div className="pb-40">
      <BackBar title="Checkout" />

      <div className="mt-5 space-y-3 px-5">
        <div className="rounded-2xl bg-card p-4 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Pickup from
          </p>
          <p className="mt-1 text-base font-semibold">{cartShopName ?? "—"}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Campus pickup only · Show your receipt at the counter
          </p>
        </div>

        <div className="rounded-2xl bg-card p-4 shadow-card">
          {cartItems.map(({ item, qty }) => (
            <div key={item.id} className="flex justify-between py-1 text-sm">
              <span className="text-muted-foreground">
                {item.name} × {qty}
              </span>
              <span className="font-medium">₹{item.price * qty}</span>
            </div>
          ))}
          <div className="mt-3 space-y-1.5 border-t border-dashed border-border pt-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Campus discount</span>
              <span className="text-success">−₹{discount}</span>
            </div>
            <div className="flex justify-between pt-1 text-base font-bold">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>
        </div>

        <p className="px-1 text-[11px] leading-relaxed text-muted-foreground">
          Your total is calculated and verified on our servers. Your receipt is issued only after
          the payment is confirmed by Cashfree.
        </p>

        <div className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-card">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-accent-foreground">
            <Wallet size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold">Pay securely with Cashfree</p>
            <p className="text-xs text-muted-foreground">UPI · Cards · Netbanking · Wallets</p>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-[72px] z-30 safe-bottom">
        <div className="app-shell border-t border-border bg-surface px-5 pb-3 pt-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => void pay()}
            disabled={loading || verifying || cartItems.length === 0}
            className="min-h-[52px] w-full rounded-2xl bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {verifying
              ? "Confirming your payment…"
              : loading
                ? STEP_LABEL[checkoutStep]
                : `Pay ₹${total} securely`}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
