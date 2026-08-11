import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { MerchantShell } from "@/components/merchant/MerchantShell";
import {
  Button,
  Card,
  Field,
  SectionHeading,
  Select,
  TextArea,
  TextInput,
} from "@/components/merchant/MerchantUI";
import { SHOP_CATEGORIES, TIME_OPTIONS, type ShopAvailability } from "@/lib/merchant-data";
import { useMerchant } from "@/lib/merchant-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shop/settings")({
  head: () => ({
    meta: [
      { title: "Shop Settings — DigitalFoodStreet" },
      {
        name: "description",
        content:
          "Update your shop's basic information, branding, opening hours, contact details and availability.",
      },
      { property: "og:title", content: "Shop Settings — DigitalFoodStreet" },
      {
        property: "og:description",
        content: "Update basic information, branding, hours, contact details and availability.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { activeShop, updateShop } = useMerchant();
  const [busy, setBusy] = useState(false);

  if (!activeShop) {
    return (
      <MerchantShell title="Settings">
        <Card>No shop selected.</Card>
      </MerchantShell>
    );
  }

  const shop = activeShop;

  const save = () => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      toast.success("Shop settings updated");
    }, 400);
  };

  return (
    <MerchantShell
      title="Settings"
      subtitle={`Managing ${shop.name}`}
      actions={
        <Button onClick={save} disabled={busy}>
          {busy ? "Saving…" : "Save Changes"}
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-4">
          <SectionHeading title="Basic information" />
          <Field label="Shop name">
            <TextInput value={shop.name} onChange={(e) => updateShop({ name: e.target.value })} />
          </Field>
          <Field label="Description">
            <TextArea
              value={shop.description}
              onChange={(e) => updateShop({ description: e.target.value })}
            />
          </Field>
          <Field label="Category">
            <Select value={shop.category} onChange={(e) => updateShop({ category: e.target.value })}>
              {Array.from(new Set([shop.category, ...SHOP_CATEGORIES])).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Average preparation time">
            <Select value={shop.prepTime} onChange={(e) => updateShop({ prepTime: e.target.value })}>
              {Array.from(
                new Set([
                  shop.prepTime,
                  "5–10 minutes",
                  "10–15 minutes",
                  "15–20 minutes",
                  "20–30 minutes",
                ]),
              ).map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          </Field>
        </Card>

        <Card className="space-y-4">
          <SectionHeading title="Branding" />
          {shop.cover && (
            <img
              src={shop.cover}
              alt={`${shop.name} cover`}
              className="aspect-[16/9] w-full rounded-xl object-cover"
            />
          )}
          <Field label="Cover image URL">
            <TextInput
              value={shop.cover ?? ""}
              onChange={(e) => updateShop({ cover: e.target.value })}
            />
          </Field>
          <Field label="Logo image URL">
            <TextInput
              value={shop.logo ?? ""}
              onChange={(e) => updateShop({ logo: e.target.value })}
            />
          </Field>

          <SectionHeading title="Contact information" />
          <Field label="Contact number">
            <TextInput value={shop.phone} onChange={(e) => updateShop({ phone: e.target.value })} />
          </Field>
          <Field label="Email">
            <TextInput value={shop.email} onChange={(e) => updateShop({ email: e.target.value })} />
          </Field>
          <Field label="Campus / location">
            <TextInput value={shop.campus} onChange={(e) => updateShop({ campus: e.target.value })} />
          </Field>
        </Card>

        <Card className="space-y-3 lg:col-span-2">
          <SectionHeading title="Opening hours" />
          {shop.hours.map((h, i) => (
            <div
              key={h.day}
              className="rounded-xl border border-border p-3 sm:flex sm:items-center sm:justify-between sm:gap-3"
            >
              <div className="flex items-center justify-between gap-3 sm:w-48">
                <span className="text-sm font-semibold">{h.day}</span>
                <button
                  onClick={() =>
                    updateShop({
                      hours: shop.hours.map((d, di) => (di === i ? { ...d, open: !d.open } : d)),
                    })
                  }
                  className={cn(
                    "rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide",
                    h.open ? "bg-success-soft text-success" : "bg-secondary text-muted-foreground",
                  )}
                >
                  {h.open ? "Open" : "Closed"}
                </button>
              </div>
              {h.open && (
                <div className="mt-2 flex items-center gap-2 sm:mt-0">
                  <Select
                    aria-label={`${h.day} opening time`}
                    value={h.from}
                    onChange={(e) =>
                      updateShop({
                        hours: shop.hours.map((d, di) =>
                          di === i ? { ...d, from: e.target.value } : d,
                        ),
                      })
                    }
                    className="mt-0 py-2"
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </Select>
                  <span className="text-sm text-muted-foreground">–</span>
                  <Select
                    aria-label={`${h.day} closing time`}
                    value={h.to}
                    onChange={(e) =>
                      updateShop({
                        hours: shop.hours.map((d, di) =>
                          di === i ? { ...d, to: e.target.value } : d,
                        ),
                      })
                    }
                    className="mt-0 py-2"
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </Select>
                </div>
              )}
            </div>
          ))}
        </Card>

        <Card className="lg:col-span-2">
          <SectionHeading title="Shop availability" />
          <div className="flex flex-wrap gap-2">
            {(
              [
                { value: "open", label: "Open" },
                { value: "closed", label: "Closed" },
                { value: "unavailable", label: "Temporarily unavailable" },
              ] as { value: ShopAvailability; label: string }[]
            ).map((o) => (
              <button
                key={o.value}
                onClick={() => updateShop({ availability: o.value })}
                className={cn(
                  "min-h-[42px] rounded-full px-4 text-sm font-semibold transition-colors",
                  shop.availability === o.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground",
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-5">
        <Button className="w-full sm:w-auto" onClick={save} disabled={busy}>
          {busy ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </MerchantShell>
  );
}
