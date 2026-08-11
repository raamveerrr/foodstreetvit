import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Check, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { Button, Card, Field, Select, TextArea, TextInput } from "@/components/merchant/MerchantUI";
import {
  DAYS,
  SHOP_CATEGORIES,
  TIME_OPTIONS,
  defaultHours,
  type DayHours,
  type OwnerShop,
  type ShopAvailability,
} from "@/lib/merchant-data";
import { useMerchant } from "@/lib/merchant-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/create-shop")({
  head: () => ({
    meta: [
      { title: "Create a Shop — DigitalFoodStreet" },
      {
        name: "description",
        content:
          "Set up your campus shop on DigitalFoodStreet: branding, business details, opening hours and menu.",
      },
      { property: "og:title", content: "Create a Shop — DigitalFoodStreet" },
      {
        property: "og:description",
        content: "Set up your campus shop on DigitalFoodStreet in a few guided steps.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CreateShopPage,
});

const STEPS = ["Basic Details", "Branding", "Business Details", "Opening Hours", "Review"];

interface Draft {
  name: string;
  description: string;
  category: string;
  phone: string;
  email: string;
  campus: string;
  logo: string | null;
  cover: string | null;
  cuisine: string;
  prepTime: string;
  hours: DayHours[];
  availability: ShopAvailability;
}

const emptyDraft = (): Draft => ({
  name: "",
  description: "",
  category: SHOP_CATEGORIES[0]!,
  phone: "",
  email: "",
  campus: "Campus Food Court",
  logo: null,
  cover: null,
  cuisine: SHOP_CATEGORIES[0]!,
  prepTime: "10–15 minutes",
  hours: defaultHours(),
  availability: "open",
});

function Progress({ step }: { step: number }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span>
          Step {step + 1} of {STEPS.length}
        </span>
        <span className="font-semibold text-foreground">{STEPS[step]}</span>
      </div>
      <div className="mt-2 flex gap-1.5">
        {STEPS.map((s, i) => (
          <div key={s} className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
            <motion.div
              initial={false}
              animate={{ width: i <= step ? "100%" : "0%" }}
              transition={{ duration: 0.25 }}
              className="h-full rounded-full bg-primary"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function MockUpload({
  label,
  value,
  aspect,
  onPick,
}: {
  label: string;
  value: string | null;
  aspect: string;
  onPick: (v: string | null) => void;
}) {
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onPick(URL.createObjectURL(file));
    toast.success(`${label} uploaded`);
  };
  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      <div
        className={cn(
          "mt-2 grid place-items-center overflow-hidden rounded-2xl border border-dashed border-border bg-secondary/40",
          aspect,
        )}
      >
        {value ? (
          <img src={value} alt={`${label} preview`} className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1 py-6 text-muted-foreground">
            <ImagePlus size={22} />
            <span className="text-xs">No image yet</span>
          </div>
        )}
      </div>
      <div className="mt-2 flex gap-2">
        <label className="inline-flex min-h-[42px] cursor-pointer items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold">
          Upload
          <input type="file" accept="image/*" className="hidden" onChange={onFile} />
        </label>
        {value && (
          <Button variant="ghost" onClick={() => onPick(null)}>
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}

function CreateShopPage() {
  const navigate = useNavigate();
  const { createShop } = useMerchant();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(false);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const validate = () => {
    if (step === 0) {
      if (!draft.name.trim()) return "Shop name is required.";
      if (!draft.description.trim()) return "Add a short shop description.";
      if (!draft.phone.trim()) return "Contact number is required.";
      if (!draft.email.trim()) return "Email is required.";
    }
    return null;
  };

  const next = () => {
    const err = validate();
    setError(err);
    if (err) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const submit = () => {
    setBusy(true);
    window.setTimeout(() => {
      const shop: OwnerShop = {
        id: `${draft.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`,
        name: draft.name.trim(),
        description: draft.description.trim(),
        category: draft.category,
        phone: draft.phone,
        email: draft.email,
        campus: draft.campus,
        logo: draft.logo,
        cover: draft.cover,
        prepTime: draft.prepTime,
        availability: draft.availability,
        hours: draft.hours,
        paymentConnected: false,
        categories: ["Snacks", "Drinks"],
        menu: [],
        orders: [],
        customers: [],
      };
      createShop(shop);
      setBusy(false);
      setCreated(true);
    }, 600);
  };

  if (created) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 30 }}
          className="w-full max-w-md text-center"
        >
          <motion.div
            initial={{ scale: 0.4 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 22, delay: 0.05 }}
            className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success-soft text-success"
          >
            <Check size={30} strokeWidth={3} />
          </motion.div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight">Your shop is ready</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {draft.name} has been created successfully.
          </p>
          <Button className="mt-7 w-full" onClick={() => navigate({ to: "/shop" })}>
            Go to Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-16 pt-6 sm:px-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
            DigitalFoodStreet
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Create your shop</h1>
        </div>
        <Button variant="ghost" onClick={() => navigate({ to: "/shop-login" })}>
          Cancel
        </Button>
      </div>

      <Progress step={step} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="space-y-4 p-5">
            {step === 0 && (
              <>
                <Field label="Shop name">
                  <TextInput
                    value={draft.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Zuzu"
                  />
                </Field>
                <Field label="Shop description">
                  <TextArea
                    value={draft.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Fresh burgers, snacks and beverages."
                  />
                </Field>
                <Field label="Shop category">
                  <Select value={draft.category} onChange={(e) => set("category", e.target.value)}>
                    {SHOP_CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </Select>
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Contact number">
                    <TextInput
                      value={draft.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                  </Field>
                  <Field label="Email">
                    <TextInput
                      type="email"
                      value={draft.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="owner@shop.com"
                    />
                  </Field>
                </div>
                <Field label="Campus / location">
                  <TextInput
                    value={draft.campus}
                    onChange={(e) => set("campus", e.target.value)}
                    placeholder="Campus Food Court"
                  />
                </Field>
              </>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <MockUpload
                  label="Shop logo"
                  value={draft.logo}
                  aspect="h-28 w-28 rounded-2xl"
                  onPick={(v) => set("logo", v)}
                />
                <MockUpload
                  label="Shop cover image"
                  value={draft.cover}
                  aspect="aspect-[16/9] w-full"
                  onPick={(v) => set("cover", v)}
                />
                <p className="text-xs text-muted-foreground">
                  Uploads are previewed locally for now and will move to cloud storage later.
                </p>
              </div>
            )}

            {step === 2 && (
              <>
                <Field label="Description">
                  <TextArea
                    value={draft.description}
                    onChange={(e) => set("description", e.target.value)}
                  />
                </Field>
                <Field label="Cuisine / category">
                  <Select value={draft.cuisine} onChange={(e) => set("cuisine", e.target.value)}>
                    {SHOP_CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Average preparation time">
                  <Select value={draft.prepTime} onChange={(e) => set("prepTime", e.target.value)}>
                    {["5–10 minutes", "10–15 minutes", "15–20 minutes", "20–30 minutes"].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </Select>
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Contact number">
                    <TextInput value={draft.phone} onChange={(e) => set("phone", e.target.value)} />
                  </Field>
                  <Field label="Contact email">
                    <TextInput value={draft.email} onChange={(e) => set("email", e.target.value)} />
                  </Field>
                </div>
              </>
            )}

            {step === 3 && (
              <div className="space-y-3">
                {draft.hours.map((h, i) => (
                  <div
                    key={h.day}
                    className="rounded-xl border border-border p-3 sm:flex sm:items-center sm:justify-between sm:gap-3"
                  >
                    <div className="flex items-center justify-between gap-3 sm:w-40">
                      <span className="text-sm font-semibold">{h.day}</span>
                      <button
                        type="button"
                        onClick={() =>
                          set(
                            "hours",
                            draft.hours.map((d, di) => (di === i ? { ...d, open: !d.open } : d)),
                          )
                        }
                        className={cn(
                          "rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide transition-colors",
                          h.open
                            ? "bg-success-soft text-success"
                            : "bg-secondary text-muted-foreground",
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
                            set(
                              "hours",
                              draft.hours.map((d, di) =>
                                di === i ? { ...d, from: e.target.value } : d,
                              ),
                            )
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
                            set(
                              "hours",
                              draft.hours.map((d, di) =>
                                di === i ? { ...d, to: e.target.value } : d,
                              ),
                            )
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
                <Field label="Current shop availability">
                  <Select
                    value={draft.availability}
                    onChange={(e) => set("availability", e.target.value as ShopAvailability)}
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="unavailable">Temporarily unavailable</option>
                  </Select>
                </Field>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                {draft.cover && (
                  <img
                    src={draft.cover}
                    alt={`${draft.name} cover`}
                    className="aspect-[16/9] w-full rounded-2xl object-cover"
                  />
                )}
                <div className="flex items-center gap-3">
                  {draft.logo ? (
                    <img
                      src={draft.logo}
                      alt={`${draft.name} logo`}
                      className="h-12 w-12 rounded-xl object-cover"
                    />
                  ) : (
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-lg font-bold text-accent-foreground">
                      {draft.name.charAt(0) || "S"}
                    </span>
                  )}
                  <div>
                    <p className="text-lg font-bold leading-tight">{draft.name || "Your shop"}</p>
                    <p className="text-sm text-muted-foreground">{draft.description}</p>
                  </div>
                </div>
                <dl className="grid gap-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Category</dt>
                    <dd className="font-medium">{draft.cuisine}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Preparation</dt>
                    <dd className="font-medium">{draft.prepTime}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Location</dt>
                    <dd className="font-medium">{draft.campus}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Contact</dt>
                    <dd className="font-medium">{draft.phone}</dd>
                  </div>
                </dl>
                <div className="rounded-xl border border-border p-3">
                  <p className="text-sm font-semibold">Opening hours</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {DAYS.map((day) => {
                      const h = draft.hours.find((x) => x.day === day)!;
                      return (
                        <li key={day} className="flex justify-between gap-4">
                          <span className="text-muted-foreground">{day}</span>
                          <span className="font-medium">
                            {h.open ? `${h.from} – ${h.to}` : "Closed"}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <Button variant="outline" className="w-full" onClick={() => setStep(0)}>
                  Edit details
                </Button>
              </div>
            )}

            {error && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {error}
              </p>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="mt-5 flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => (step === 0 ? navigate({ to: "/shop-login" }) : setStep((s) => s - 1))}
        >
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button className="flex-1" onClick={next}>
            Save &amp; Continue
          </Button>
        ) : (
          <Button className="flex-1" disabled={busy} onClick={submit}>
            {busy ? "Creating…" : "Create Shop"}
          </Button>
        )}
      </div>
    </div>
  );
}
