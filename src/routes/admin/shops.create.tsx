import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Button, Field, Select, TextArea, TextInput } from "@/components/merchant/MerchantUI";
import { useAuth } from "@/lib/auth-store";
import { SHOP_CATEGORIES, TIME_OPTIONS, defaultHours } from "@/lib/merchant-data";
import { createShopOwnerAndShop } from "@/lib/supabase";
import { Check } from "lucide-react";

export const Route = createFileRoute("/admin/shops/create")({
  head: () => ({
    meta: [{ title: "Create Shop & Owner — Admin" }],
  }),
  component: AdminCreateShopPage,
});

interface SuccessData {
  shopName: string;
  ownerName: string;
  ownerEmail: string;
  temporaryPassword: string;
}

function AdminCreateShopPage() {
  const navigate = useNavigate();
  const { profile, ready } = useAuth();
  const [busy, setBusy] = useState(false);
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(SHOP_CATEGORIES[0] ?? "");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [campus, setCampus] = useState("Campus Food Court");
  const [prepTime, setPrepTime] = useState("10–15 minutes");
  const [hours] = useState(defaultHours());

  const [success, setSuccess] = useState<SuccessData | null>(null);

  if (!ready) {
    return <div className="p-6">Loading...</div>;
  }

  if (!profile) {
    // Not signed in yet.
    return (
      <div className="p-6">
        <p>Please sign in as an administrator.</p>
        <Button onClick={() => navigate({ to: "/login" })}>Sign in</Button>
      </div>
    );
  }
  if (profile.role !== "SUPER_ADMIN") {
    return (
      <div className="p-6">
        <p>Access denied. Only administrators may provision shops.</p>
      </div>
    );
  }

  if (success) {
    // Success screen
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-md"
        >
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Shop created successfully</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              The shop and owner account are ready.
            </p>
          </div>

          <div className="space-y-4 rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Shop
              </p>
              <p className="mt-1 text-lg font-semibold">{success.shopName}</p>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Owner
              </p>
              <p className="mt-1 text-lg font-semibold">{success.ownerName}</p>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Login email
              </p>
              <p className="mt-1 font-mono text-sm">{success.ownerEmail}</p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(success.ownerEmail);
                  toast.success("Email copied to clipboard");
                }}
                className="mt-2 text-xs font-medium text-primary hover:underline"
              >
                Copy Email
              </button>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Temporary password
              </p>
              <p className="mt-1 font-mono text-sm">••••••••</p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(success.temporaryPassword);
                  toast.success("Password copied to clipboard");
                }}
                className="mt-2 text-xs font-medium text-primary hover:underline"
              >
                Copy Password
              </button>
            </div>

            <div className="rounded-xl bg-blue-50 p-3 text-sm text-blue-900">
              Share the login email and temporary password with the shop owner. They will be asked to
              set a new password on first login.
            </div>

            <Button className="w-full" onClick={() => navigate({ to: "/admin/shops", replace: true })}>
              Done
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const submit = async () => {
    if (busy) return;
    if (!ownerName || !ownerEmail || !temporaryPassword || !name) {
      toast.error("Please complete required fields.");
      return;
    }
    setBusy(true);
    try {
      const result = await createShopOwnerAndShop({
        ownerName,
        ownerEmail,
        ownerPhone,
        temporaryPassword,
        shop: {
          name,
          description,
          category,
          phone,
          email,
          campus,
          prepTime,
          hours,
          status: "CLOSED",
        },
      });

      setSuccess({
        shopName: result.shopName ?? name,
        ownerName: result.ownerName ?? ownerName,
        ownerEmail: result.ownerEmail ?? ownerEmail,
        temporaryPassword: result.temporaryPassword ?? temporaryPassword,
      });
    } catch (err: any) {
      toast.error(err?.message || "Failed to create shop and owner.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-16 pt-6 sm:px-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">DigitalFoodStreet</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Provision shop & owner</h1>
        </div>
        <Link to="/admin/shops">
          <Button variant="ghost">Back</Button>
        </Link>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-lg font-semibold">Owner information</h2>
          <div className="mt-3 grid gap-3">
            <Field label="Owner name">
              <TextInput value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
            </Field>
            <Field label="Owner email">
              <TextInput value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} />
            </Field>
            <Field label="Owner phone">
              <TextInput value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} />
            </Field>
            <Field label="Temporary password">
              <TextInput value={temporaryPassword} onChange={(e) => setTemporaryPassword(e.target.value)} />
            </Field>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-lg font-semibold">Shop information</h2>
          <div className="mt-3 grid gap-3">
            <Field label="Shop name">
              <TextInput value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Description">
              <TextArea value={description} onChange={(e) => setDescription(e.target.value)} />
            </Field>
            <Field label="Category">
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                {SHOP_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Contact number">
                <TextInput value={phone} onChange={(e) => setPhone(e.target.value)} />
              </Field>
              <Field label="Contact email">
                <TextInput value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>
            </div>
            <Field label="Campus / location">
              <TextInput value={campus} onChange={(e) => setCampus(e.target.value)} />
            </Field>
            <Field label="Preparation time">
              <Select value={prepTime} onChange={(e) => setPrepTime(e.target.value)}>
                {TIME_OPTIONS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Select>
            </Field>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate({ to: "/admin/shops" })}>
            Cancel
          </Button>
          <Button onClick={() => void submit()} disabled={busy}>
            {busy ? "Creating…" : "Create Shop & Owner"}
          </Button>
        </div>
      </div>
    </div>
  );
}
