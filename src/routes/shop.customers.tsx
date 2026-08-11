import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { MerchantShell } from "@/components/merchant/MerchantShell";
import { Card, MerchantEmpty } from "@/components/merchant/MerchantUI";
import { formatMoney } from "@/lib/merchant-data";
import { useMerchant } from "@/lib/merchant-store";

export const Route = createFileRoute("/shop/customers")({
  head: () => ({
    meta: [
      { title: "Customers — DigitalFoodStreet Shop" },
      {
        name: "description",
        content:
          "See how students order from your shop: order counts, total spend and most recent order.",
      },
      { property: "og:title", content: "Customers — DigitalFoodStreet Shop" },
      {
        property: "og:description",
        content: "Order counts, total spend and recent activity for your shop's customers.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CustomersPage,
});

function CustomersPage() {
  const { activeShop } = useMerchant();
  const customers = activeShop?.customers ?? [];

  return (
    <MerchantShell
      title="Customers"
      subtitle="Ordering activity through your shop. No personal contact details are shown."
    >
      {customers.length === 0 ? (
        <MerchantEmpty title="No customers yet." description="Customer activity appears after your first orders." />
      ) : (
        <Card className="p-0">
          <ul className="divide-y divide-border">
            {customers.map((c, i) => (
              <motion.li
                key={c.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
                className="flex items-center gap-3 px-4 py-3.5"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-bold text-accent-foreground">
                  {c.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.orders} orders · last order {c.lastOrder.toLowerCase()}
                  </p>
                </div>
                <p className="text-sm font-bold">{formatMoney(c.spent)}</p>
              </motion.li>
            ))}
          </ul>
        </Card>
      )}
    </MerchantShell>
  );
}
