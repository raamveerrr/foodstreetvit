import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { EmptyState } from "@/components/app/Primitives";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/order/$receiptId")({
  head: () => ({
    meta: [
      { title: "Order Confirmed — DigitalFoodStreet" },
      { name: "description", content: "Your campus food order is confirmed and being prepared." },
      { property: "og:title", content: "Order Confirmed — DigitalFoodStreet" },
      { property: "og:description", content: "Your order is confirmed and being prepared." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderConfirmedPage,
});

function OrderConfirmedPage() {
  const { receiptId } = Route.useParams();
  const navigate = useNavigate();
  const { receipts } = useStore();
  const receipt = receipts.find((r) => r.id === receiptId);

  if (!receipt) {
    return (
      <EmptyState
        title="Order not found"
        description="We couldn't find this order on this device."
        actionLabel="Back to Home"
        onAction={() => navigate({ to: "/" })}
      />
    );
  }

  return (
    <div className="px-5 pb-10 pt-14 text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 420, damping: 22 }}
        className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success text-success-foreground"
      >
        <Check size={30} strokeWidth={3} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.1 }}
      >
        <h1 className="mt-5 text-2xl font-bold tracking-tight">Order confirmed</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your food is being prepared.</p>

        <div className="mx-auto mt-6 max-w-sm rounded-3xl bg-card p-5 text-left shadow-card">
          <p className="text-xs font-medium text-muted-foreground">Receipt</p>
          <p className="font-mono text-2xl font-bold tracking-[0.12em]">{receipt.code}</p>
          <p className="mt-1 text-sm font-semibold">{receipt.shopName}</p>
          <div className="mt-4 space-y-1.5 border-t border-dashed border-border pt-4 text-sm">
            {receipt.lines.map((l) => (
              <div key={l.name} className="flex justify-between">
                <span className="text-muted-foreground">
                  {l.name} × {l.qty}
                </span>
                <span className="font-medium">₹{l.price * l.qty}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-dashed border-border pt-4">
            <span className="text-base font-bold">₹{receipt.total}</span>
            <span className="text-xs font-bold uppercase tracking-wide text-success">Paid ✓</span>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Estimated preparation · 10–15 min</p>
        </div>

        <div className="mx-auto mt-6 max-w-sm space-y-3">
          <Link
            to="/receipts/$receiptId"
            params={{ receiptId: receipt.id }}
            className="flex min-h-[52px] items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground"
          >
            View Receipt
          </Link>
          <Link
            to="/"
            className="flex min-h-[52px] items-center justify-center rounded-2xl bg-secondary text-sm font-semibold text-secondary-foreground"
          >
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
