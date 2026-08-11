import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { MerchantShell } from "@/components/merchant/MerchantShell";
import { Card, MerchantEmpty, SectionHeading, StatCard } from "@/components/merchant/MerchantUI";
import { formatMoney } from "@/lib/merchant-data";
import { useMerchant } from "@/lib/merchant-store";

export const Route = createFileRoute("/shop/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — DigitalFoodStreet Shop" },
      {
        name: "description",
        content:
          "See daily and weekly orders, revenue and your most popular items on DigitalFoodStreet.",
      },
      { property: "og:title", content: "Analytics — DigitalFoodStreet Shop" },
      {
        property: "og:description",
        content: "Daily and weekly orders, revenue and your most popular items.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AnalyticsPage,
});

const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function AnalyticsPage() {
  const { activeShop } = useMerchant();
  const orders = activeShop?.orders ?? [];
  const completed = orders.filter((o) => o.status === "COMPLETED");
  const revenueToday = completed.reduce((n, o) => n + o.total, 0);

  // Deterministic mock week derived from today's numbers.
  const week = WEEK.map((d, i) => ({
    day: d,
    orders: Math.max(3, orders.length + ((i * 5) % 7) - 2),
    revenue: Math.max(400, revenueToday + ((i * 137) % 900) - 200),
  }));
  const weekOrders = week.reduce((n, w) => n + w.orders, 0);
  const weekRevenue = week.reduce((n, w) => n + w.revenue, 0);
  const maxRevenue = Math.max(...week.map((w) => w.revenue));

  const popular = Object.values(
    orders
      .flatMap((o) => o.lines)
      .reduce<Record<string, { name: string; qty: number; revenue: number }>>((acc, l) => {
        const cur = acc[l.name] ?? { name: l.name, qty: 0, revenue: 0 };
        cur.qty += l.qty;
        cur.revenue += l.qty * l.price;
        acc[l.name] = cur;
        return acc;
      }, {}),
  ).sort((a, b) => b.qty - a.qty);

  const maxQty = popular[0]?.qty ?? 1;

  return (
    <MerchantShell title="Analytics" subtitle="A quick read on how the shop is performing.">
      {orders.length === 0 ? (
        <MerchantEmpty title="Not enough data yet." description="Analytics appear after your first orders." />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Orders today" value={String(orders.length)} index={0} />
            <StatCard label="Revenue today" value={formatMoney(revenueToday)} index={1} />
            <StatCard label="Orders this week" value={String(weekOrders)} index={2} />
            <StatCard label="Revenue this week" value={formatMoney(weekRevenue)} index={3} />
          </div>

          <Card>
            <SectionHeading title="Revenue this week" />
            <div className="flex h-44 items-end gap-2">
              {week.map((w, i) => (
                <div key={w.day} className="flex flex-1 flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(w.revenue / maxRevenue) * 100}%` }}
                    transition={{ duration: 0.4, delay: i * 0.04 }}
                    className="w-full rounded-t-lg bg-primary/85"
                    title={formatMoney(w.revenue)}
                  />
                  <span className="text-[11px] text-muted-foreground">{w.day}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionHeading title="Popular items" />
            <ul className="space-y-3">
              {popular.slice(0, 5).map((p, i) => (
                <li key={p.name}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-muted-foreground">
                      {p.qty} sold · {formatMoney(p.revenue)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(p.qty / maxQty) * 100}%` }}
                      transition={{ duration: 0.35, delay: i * 0.05 }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </MerchantShell>
  );
}
