import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { MerchantShell } from "@/components/merchant/MerchantShell";
import {
  Button,
  Card,
  MerchantEmpty,
  OrderStatusBadge,
} from "@/components/merchant/MerchantUI";
import {
  formatMoney,
  formatTime,
  nextStatus,
  type OrderStatus,
} from "@/lib/merchant-data";
import { useMerchant } from "@/lib/merchant-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shop/orders")({
  head: () => ({
    meta: [
      { title: "Orders — DigitalFoodStreet Shop" },
      {
        name: "description",
        content:
          "Manage new, preparing, ready and completed orders for your campus shop on DigitalFoodStreet.",
      },
      { property: "og:title", content: "Orders — DigitalFoodStreet Shop" },
      {
        property: "og:description",
        content: "Manage the full order queue for your campus shop.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrdersPage,
});

const TABS: OrderStatus[] = ["NEW", "ACCEPTED", "PREPARING", "READY", "COMPLETED", "CANCELLED"];

function OrdersPage() {
  const { activeShop, setOrderStatus } = useMerchant();
  const [tab, setTab] = useState<OrderStatus>("NEW");
  const orders = (activeShop?.orders ?? []).filter((o) => o.status === tab);

  return (
    <MerchantShell title="Orders" subtitle="Fast, scannable order queue for the counter.">
      <div className="no-scrollbar -mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1">
        {TABS.map((t) => {
          const count = (activeShop?.orders ?? []).filter((o) => o.status === t).length;
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex min-h-[40px] shrink-0 items-center gap-2 rounded-full px-4 text-[13px] font-semibold transition-colors",
                active ? "bg-foreground text-background" : "bg-secondary text-muted-foreground",
              )}
            >
              {t.charAt(0) + t.slice(1).toLowerCase()}
              <span className={cn("text-[11px]", active ? "opacity-70" : "opacity-60")}>{count}</span>
            </button>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <MerchantEmpty title="No orders yet." description={`Nothing in ${tab.toLowerCase()} right now.`} />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {orders.map((order, i) => {
            const next = nextStatus(order.status);
            return (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
              >
                <Card>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold">#{order.code}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.customerName} · {formatTime(order.placedAt)}
                      </p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <ul className="mt-3 space-y-1 text-sm">
                    {order.lines.map((l) => (
                      <li key={l.name} className="flex justify-between gap-3">
                        <span>
                          {l.name} × {l.qty}
                        </span>
                        <span className="text-muted-foreground">{formatMoney(l.price * l.qty)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                    <p className="text-base font-bold">{formatMoney(order.total)}</p>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[11px] font-bold uppercase",
                        order.paid
                          ? "bg-success-soft text-success"
                          : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {order.paid ? "Paid" : "Unpaid"}
                    </span>
                  </div>
                  {(next || order.status !== "CANCELLED") && (
                    <div className="mt-3 flex gap-2">
                      {next && (
                        <Button className="flex-1" onClick={() => setOrderStatus(order.id, next)}>
                          Mark {next.toLowerCase()}
                        </Button>
                      )}
                      {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
                        <Button
                          variant="outline"
                          onClick={() => setOrderStatus(order.id, "CANCELLED")}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </MerchantShell>
  );
}
