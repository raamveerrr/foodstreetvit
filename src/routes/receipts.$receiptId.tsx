import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { BackBar } from "@/components/app/BackBar";
import { ReceiptView } from "@/components/app/ReceiptView";
import { EmptyState } from "@/components/app/Primitives";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/receipts/$receiptId")({
  head: () => ({
    meta: [
      { title: "Pickup Receipt — DigitalFoodStreet" },
      {
        name: "description",
        content: "Your one-time digital pickup receipt. Counter staff confirm collection.",
      },
      { property: "og:title", content: "Pickup Receipt — DigitalFoodStreet" },
      { property: "og:description", content: "Show this receipt at the counter to collect." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReceiptDetailPage,
});

function ReceiptDetailPage() {
  const { receiptId } = Route.useParams();
  const { receipts, confirmPickup } = useStore();
  const receipt = receipts.find((r) => r.id === receiptId);

  return (
    <div className="pb-8">
      <BackBar title="Receipt" />
      {receipt ? (
        <div className="mt-5">
          <ReceiptView
            receipt={receipt}
            onConfirmPickup={() => {
              confirmPickup(receipt.id);
              toast.success(`Pickup confirmed · ${receipt.code}`);
            }}
          />
        </div>
      ) : (
        <EmptyState
          title="Receipt not found"
          description="This receipt is no longer available on this device."
        />
      )}
    </div>
  );
}
