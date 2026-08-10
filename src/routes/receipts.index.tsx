import { createFileRoute } from "@tanstack/react-router";
import { ReceiptText } from "lucide-react";
import { PageHeader } from "@/components/app/AppHeader";
import { ReceiptCard } from "@/components/app/ReceiptCard";
import { EmptyState } from "@/components/app/Primitives";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/receipts/")({
  head: () => ({
    meta: [
      { title: "Receipts — DigitalFoodStreet" },
      {
        name: "description",
        content: "Your active and past pickup receipts. Show a receipt at the counter to collect.",
      },
      { property: "og:title", content: "Receipts — DigitalFoodStreet" },
      { property: "og:description", content: "Show your digital receipt at the counter." },
    ],
  }),
  component: ReceiptsPage,
});

function ReceiptsPage() {
  const { receipts } = useStore();
  const active = receipts.filter((r) => r.status !== "picked_up");
  const past = receipts.filter((r) => r.status === "picked_up");

  return (
    <div className="pb-6">
      <PageHeader title="Receipts" subtitle="Show a receipt at the counter to collect." />

      {receipts.length === 0 ? (
        <EmptyState
          icon={<ReceiptText size={26} />}
          title="No receipts yet"
          description="Every order you place creates one digital pickup receipt."
        />
      ) : (
        <div className="mt-4 space-y-6">
          {active.length > 0 && (
            <section>
              <h2 className="px-5 pb-2 text-sm font-semibold text-muted-foreground">Active</h2>
              <div className="space-y-3 px-5">
                {active.map((r, i) => (
                  <ReceiptCard key={r.id} receipt={r} index={i} />
                ))}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="px-5 pb-2 text-sm font-semibold text-muted-foreground">Past</h2>
              <div className="space-y-3 px-5">
                {past.map((r, i) => (
                  <ReceiptCard key={r.id} receipt={r} index={i} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
