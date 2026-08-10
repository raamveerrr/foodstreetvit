import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import type { Receipt } from "@/lib/store";
import { StatusBadge } from "./Primitives";

const STATUS_LABEL: Record<Receipt["status"], string> = {
  preparing: "Preparing",
  ready: "Ready",
  picked_up: "Picked up",
};

export function ReceiptCard({ receipt, index = 0 }: { receipt: Receipt; index?: number }) {
  const collected = receipt.status === "picked_up";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.04 }}
    >
      <Link
        to="/receipts/$receiptId"
        params={{ receiptId: receipt.id }}
        className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-card active:scale-[0.99] transition-transform"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold tracking-widest">{receipt.code}</span>
            <StatusBadge tone={collected ? "closed" : "warning"}>
              {STATUS_LABEL[receipt.status]}
            </StatusBadge>
          </div>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {receipt.shopName} · {receipt.lines.reduce((n, l) => n + l.qty, 0)} items · ₹
            {receipt.total}
          </p>
        </div>
        <ChevronRight size={18} className="text-muted-foreground" />
      </Link>
    </motion.div>
  );
}
