import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Printer } from "lucide-react";
import { MerchantShell } from "@/components/merchant/MerchantShell";
import {
  Button,
  Card,
  MerchantEmpty,
  OrderStatusBadge,
  SectionHeading,
  StatCard,
} from "@/components/merchant/MerchantUI";
import {
  formatMoney,
  formatTime,
  nextStatus,
  type ShopAvailability,
} from "@/lib/merchant-data";
import { useAuth } from "@/lib/auth-store";
import { useMerchant } from "@/lib/merchant-store";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shop/")({
  head: () => ({
    meta: [
      { title: "Shop Dashboard — DigitalFoodStreet" },
      {
        name: "description",
        content:
          "Track today's orders, revenue and incoming order queue for your campus shop on DigitalFoodStreet.",
      },
      { property: "og:title", content: "Shop Dashboard — DigitalFoodStreet" },
      {
        property: "og:description",
        content: "Track today's orders, revenue and the live order queue for your campus shop.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ShopDashboard,
});

const AVAILABILITY_OPTIONS: { value: ShopAvailability; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
  { value: "unavailable", label: "Temporarily unavailable" },
];

// ── Printer Status Widget ─────────────────────────────────────────────────
function PrinterStatusWidget({ shopId }: { shopId: string }) {
  const [printer, setPrinter] = useState<{ status: string; name: string; queue: number } | null>(null);

  useEffect(() => {
    if (!shopId) return;
    // Fetch printer status
    supabase
      .from("printers")
      .select("name, status")
      .eq("shop_id", shopId)
      .order("last_seen_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        // Also count queued jobs
        supabase
          .from("print_jobs")
          .select("id", { count: "exact", head: true })
          .eq("shop_id", shopId)
          .in("status", ["QUEUED", "PRINTING"])
          .then(({ count }) => {
            setPrinter({ status: data.status, name: data.name, queue: count ?? 0 });
          });
      });
  }, [shopId]);

  if (!printer) return null;

  const isOnline = printer.status === "ONLINE" || printer.status === "PRINTING";

  return (
    <Link to="/shop/printer">
      <Card className="flex items-center justify-between gap-3 hover:bg-secondary/60 transition-colors cursor-pointer">
        <div className="flex items-center gap-2.5">
          <span className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full",
            isOnline ? "bg-success-soft" : "bg-secondary"
          )}>
            <Printer size={15} className={isOnline ? "text-success" : "text-muted-foreground"} />
          </span>
          <div>
            <p className="text-sm font-semibold">{printer.name}</p>
            <p className="text-xs text-muted-foreground">Thermal Printer</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {printer.queue > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
              {printer.queue} queued
            </span>
          )}
          <span className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-bold uppercase",
            isOnline ? "bg-success-soft text-success" : "bg-secondary text-muted-foreground"
          )}>
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>
      </Card>
    </Link>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────
function ShopDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { activeShop, setAvailability, setOrderStatus } = useMerchant();
  const [greeting, setGreeting] = useState("Hello");

  // If user needs to change password on first login, redirect to change-password
  useEffect(() => {
    if (profile?.mustChangePassword === true) {
      navigate({ to: "/shop/change-password", replace: true });
    }
  }, [profile?.mustChangePassword, navigate]);

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);

  const shop = activeShop;
  const orders = shop?.orders ?? [];
  const pending = orders.filter((o) => ["NEW", "ACCEPTED", "PREPARING", "READY"].includes(o.status));
  const completed = orders.filter((o) => o.status === "COMPLETED");
  const revenue = completed.reduce((n, o) => n + o.total, 0);
  const incoming = orders.filter((o) => o.status === "NEW" || o.status === "ACCEPTED");

  return (
    <MerchantShell
      title={`${greeting}, ${shop?.name ?? "Shop"} 👋`}
      subtitle="Here's how your shop is doing today."
      actions={
        <Link
          to="/shop/menu"
          className="inline-flex min-h-[44px] items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
        >
          Manage menu
        </Link>
      }
    >
      {!shop ? (
        <MerchantEmpty
          title="No shop yet"
          description="Create your shop to start receiving campus orders."
        />
      ) : (
        <div className="space-y-6">
          <Card className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Shop status</p>
              <p className="text-lg font-bold tracking-tight">{shop.name}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {AVAILABILITY_OPTIONS.map((o) => {
                const active = shop.availability === o.value;
                return (
                  <motion.button
                    key={o.value}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      setAvailability(o.value);
                      toast.success(`Shop set to ${o.label.toLowerCase()}`);
                    }}
                    className={cn(
                      "min-h-[40px] rounded-full px-4 text-sm font-semibold transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {o.label}
                  </motion.button>
                );
              })}
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Today's orders" value={String(orders.length)} index={0} />
            <StatCard label="Pending" value={String(pending.length)} index={1} />
            <StatCard label="Completed" value={String(completed.length)} index={2} />
            <StatCard label="Revenue" value={formatMoney(revenue)} index={3} />
          </div>

          <PrinterStatusWidget shopId={shop.id} />

          <section>
            <SectionHeading
              title="Incoming orders"
              description="Accept and move orders through the counter flow."
            />
            {incoming.length === 0 ? (
              <MerchantEmpty title="No orders yet." description="New orders will appear here instantly." />
            ) : (
              <div className="grid gap-3 lg:grid-cols-2">
                {incoming.map((order, i) => {
                  const next = nextStatus(order.status);
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22, delay: i * 0.04 }}
                    >
                      <Card>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold">ORDER #{order.code}</p>
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
                              <span className="text-muted-foreground">
                                {formatMoney(l.price * l.qty)}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                          <p className="text-base font-bold">{formatMoney(order.total)}</p>
                          <span className="rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-bold uppercase text-success">
                            {order.paid ? "Paid" : "Unpaid"}
                          </span>
                        </div>
                        <div className="mt-3 flex gap-2">
                          {next && (
                            <Button
                              className="flex-1"
                              onClick={() => setOrderStatus(order.id, next)}
                            >
                              Mark {next.toLowerCase()}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            onClick={() => setOrderStatus(order.id, "CANCELLED")}
                          >
                            Cancel
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </MerchantShell>
  );
}
