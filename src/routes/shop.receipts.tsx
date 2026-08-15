import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { CheckCircle2, ScanLine } from "lucide-react";
import { MerchantShell } from "@/components/merchant/MerchantShell";
import { Button, Card, Field, SectionHeading, TextInput } from "@/components/merchant/MerchantUI";
import { useMerchant } from "@/lib/merchant-store";
import { redeemReceipt, subscribeShopReceipts } from "@/lib/firebase/receipts";
import type { ReceiptDoc } from "@/lib/firebase/types";

export const Route = createFileRoute("/shop/receipts")({
  head: () => ({
    meta: [
      { title: "Pickup Receipts — DigitalFoodStreet Shop" },
      {
        name: "description",
        content:
          "Confirm student pickups by redeeming their one-time digital receipt at your counter.",
      },
      { property: "og:title", content: "Pickup Receipts — DigitalFoodStreet Shop" },
      {
        property: "og:description",
        content: "Redeem one-time pickup receipts securely at the counter.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ShopReceiptsPage,
});

const time = (value: unknown) => {
  const t = value as { toDate?: () => Date } | null;
  const d = t && typeof t.toDate === "function" ? t.toDate() : null;
  return d ? d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "—";
};

function ShopReceiptsPage() {
  const { activeShop } = useMerchant();
  const [receipts, setReceipts] = useState<ReceiptDoc[]>([]);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!activeShop) return;
    return subscribeShopReceipts(activeShop.id, setReceipts, (m) => toast.error(m));
  }, [activeShop]);

  const redeem = async (input: { receiptId?: string; receiptNumber?: string }) => {
    const key = input.receiptId ?? input.receiptNumber ?? "";
    setBusy(key);
    try {
      await redeemReceipt(input);
      toast.success("Pickup confirmed");
      setCode("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "We couldn't confirm this pickup.");
    } finally {
      setBusy(null);
    }
  };

  const active = receipts.filter((r) => r.status !== "REDEEMED");
  const done = receipts.filter((r) => r.status === "REDEEMED").slice(0, 10);

  return (
    <MerchantShell
      title="Pickup receipts"
      subtitle="Each receipt can be redeemed exactly once, and only by this shop."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-accent-foreground">
              <ScanLine size={20} />
            </span>
            <div>
              <p className="text-base font-semibold">Redeem by receipt number</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Type the number shown on the student&apos;s phone.
              </p>
            </div>
          </div>
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const value = code.trim().toUpperCase();
              if (!value) return;
              void redeem({ receiptNumber: value });
            }}
          >
            <Field label="Receipt number">
              <TextInput
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="FS-000123"
                autoComplete="off"
                className="font-mono tracking-[0.14em]"
              />
            </Field>
            <Button type="submit" className="w-full" disabled={busy !== null || !code.trim()}>
              {busy ? "Confirming…" : "Confirm pickup"}
            </Button>
          </form>
        </Card>

        <Card>
          <SectionHeading
            title="Awaiting pickup"
            description={`${active.length} paid ${active.length === 1 ? "receipt" : "receipts"} ready to collect.`}
          />
          {active.length === 0 ? (
            <p className="text-sm text-muted-foreground">No receipts waiting right now.</p>
          ) : (
            <ul className="space-y-2">
              {active.map((r) => (
                <motion.li
                  key={r.receiptId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between gap-3 rounded-xl bg-secondary p-3"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-bold tracking-[0.12em]">
                      {r.receiptNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {r.counter} · {time(r.createdAt)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    disabled={busy !== null}
                    onClick={() => void redeem({ receiptId: r.receiptId })}
                  >
                    {busy === r.receiptId ? "Confirming…" : "Redeem"}
                  </Button>
                </motion.li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="mt-4">
        <SectionHeading title="Recently collected" description="Redeemed receipts cannot be reused." />
        {done.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing collected yet today.</p>
        ) : (
          <ul className="space-y-2">
            {done.map((r) => (
              <li
                key={r.receiptId}
                className="flex items-center justify-between rounded-xl border border-border p-3 text-sm"
              >
                <span className="font-mono font-semibold tracking-[0.12em]">{r.receiptNumber}</span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-success">
                  <CheckCircle2 size={14} /> Collected {time(r.redeemedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </MerchantShell>
  );
}
