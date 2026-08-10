import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import type { Receipt } from "@/lib/store";
import { StatusBadge } from "./Primitives";
import { SwipeToConfirm } from "./SwipeToConfirm";

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export function ReceiptView({
  receipt,
  onConfirmPickup,
}: {
  receipt: Receipt;
  onConfirmPickup: () => void;
}) {
  const collected = receipt.status === "picked_up";

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mx-5 overflow-hidden rounded-3xl bg-card shadow-card"
    >
      <div className="border-b border-dashed border-border px-5 py-5 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          DigitalFoodStreet
        </p>
        <p className="mt-3 text-xs font-medium text-muted-foreground">Receipt</p>
        <p className="font-mono text-3xl font-bold tracking-[0.12em]">{receipt.code}</p>
        <p className="mt-2 text-sm font-semibold">{receipt.shopName}</p>
      </div>

      <div className="space-y-2.5 px-5 py-5">
        {receipt.lines.map((line) => (
          <div key={line.name} className="flex items-baseline justify-between text-sm">
            <span className="text-muted-foreground">
              {line.name} × {line.qty}
            </span>
            <span className="font-medium">₹{line.price * line.qty}</span>
          </div>
        ))}
      </div>

      <div className="space-y-3 border-t border-dashed border-border px-5 py-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-lg font-bold">₹{receipt.total}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Payment</span>
          <StatusBadge tone="success">Paid ✓</StatusBadge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          <StatusBadge tone={collected ? "closed" : "warning"}>
            {collected ? "Picked up" : "Preparing"}
          </StatusBadge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Pickup</span>
          <span className="text-sm font-medium">{receipt.counter}</span>
        </div>
      </div>

      <div className="border-t border-border bg-secondary/50 px-5 py-5">
        {collected ? (
          <div className="text-center">
            <CheckCircle2 size={26} className="mx-auto text-success" />
            <p className="mt-2 text-sm font-bold uppercase tracking-wide text-success">Picked up</p>
            <p className="mt-1 font-mono text-sm font-semibold">{receipt.code}</p>
            <p className="text-xs text-muted-foreground">
              Order collected{receipt.pickedUpAt ? ` · ${formatTime(receipt.pickedUpAt)}` : ""}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              This receipt has already been used.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-3 text-center text-xs text-muted-foreground">
              Show this receipt at the counter. Counter staff will confirm pickup.
            </p>
            <SwipeToConfirm onConfirm={onConfirmPickup} />
          </>
        )}
      </div>
    </motion.section>
  );
}
