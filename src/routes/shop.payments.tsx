import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CreditCard, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { MerchantShell } from "@/components/merchant/MerchantShell";
import { Button, Card, SectionHeading } from "@/components/merchant/MerchantUI";
import { connectShopPayouts } from "@/lib/firebase/shops";
import { formatMoney } from "@/lib/merchant-data";
import { useMerchant } from "@/lib/merchant-store";

export const Route = createFileRoute("/shop/payments")({
  head: () => ({
    meta: [
      { title: "Payment Account — DigitalFoodStreet Shop" },
      {
        name: "description",
        content:
          "Connect your shop's own payment account to receive payouts for orders placed through DigitalFoodStreet.",
      },
      { property: "og:title", content: "Payment Account — DigitalFoodStreet Shop" },
      {
        property: "og:description",
        content: "Connect your shop's own payment account to receive order payouts.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const { activeShop, updateShop } = useMerchant();
  const [busy, setBusy] = useState(false);
  const connected = activeShop?.paymentConnected ?? false;
  const earned = (activeShop?.orders ?? [])
    .filter((o) => o.status === "COMPLETED")
    .reduce((n, o) => n + o.total, 0);

  const connect = async () => {
    if (!activeShop) return;
    setBusy(true);
    try {
      await connectShopPayouts(activeShop.id);
      toast.success("Payment account connected");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "We couldn't connect your account.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <MerchantShell
      title="Payments"
      subtitle={`Each shop has its own payment account. Managing ${activeShop?.name ?? "shop"}.`}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-accent-foreground">
              <CreditCard size={20} />
            </span>
            <div className="min-w-0">
              <p className="text-base font-semibold">Payment Account</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {connected ? "Connected" : "Not connected"}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Connect your payment account to receive payments for orders placed through
            DigitalFoodStreet. Payouts settle directly to this shop, never to a shared account.
          </p>
          <Button className="mt-5 w-full" disabled={busy} onClick={toggle}>
            {busy
              ? connected
                ? "Disconnecting…"
                : "Connecting…"
              : connected
                ? "Disconnect Payment Account"
                : "Connect Payment Account"}
          </Button>
        </Card>

        <Card>
          <SectionHeading title="Payout summary" description="Mock figures for this phase." />
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Collected today</dt>
              <dd className="font-semibold">{formatMoney(earned)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Pending payout</dt>
              <dd className="font-semibold">{connected ? formatMoney(earned) : "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Payout schedule</dt>
              <dd className="font-semibold">{connected ? "Daily" : "Not set"}</dd>
            </div>
          </dl>
          <div className="mt-5 flex items-start gap-2 rounded-xl bg-secondary p-3 text-xs text-muted-foreground">
            <ShieldCheck size={16} className="mt-0.5 shrink-0" />
            <p>
              We never ask for payment secret keys in the app. Merchant credentials will be handled
              securely on the backend in a later phase.
            </p>
          </div>
        </Card>
      </div>
    </MerchantShell>
  );
}
