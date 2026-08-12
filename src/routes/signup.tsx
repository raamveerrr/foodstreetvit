import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Button, Field, TextInput } from "@/components/merchant/MerchantUI";
import { useAuth } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Account — DigitalFoodStreet" },
      {
        name: "description",
        content:
          "Create a DigitalFoodStreet account to pre-order campus food, or register as a campus shop owner.",
      },
      { property: "og:title", content: "Create Account — DigitalFoodStreet" },
      { property: "og:description", content: "Join DigitalFoodStreet as a student or shop owner." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SignupPage,
});

type Role = "STUDENT" | "SHOP_OWNER";

function SignupPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [role, setRole] = useState<Role>("STUDENT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (!name.trim()) return setError("Please tell us your name.");
    if (!email.trim()) return setError("Email is required.");
    if (password.length < 6) return setError("Choose a password with at least 6 characters.");
    setBusy(true);
    try {
      await signUp({ name, email, password, phone, role });
      toast.success("Account created");
      navigate({ to: role === "SHOP_OWNER" ? "/create-shop" : "/", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't create your account.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md"
      >
        <div className="mb-7 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
            DigitalFoodStreet
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            One account for ordering or running your shop.
          </p>
        </div>

        <form
          onSubmit={(e) => void submit(e)}
          className="space-y-4 rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6"
        >
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-secondary p-1">
            {(["STUDENT", "SHOP_OWNER"] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={cn(
                  "min-h-[42px] rounded-xl text-sm font-semibold transition-colors",
                  role === r ? "bg-surface text-foreground shadow-card" : "text-muted-foreground",
                )}
              >
                {r === "STUDENT" ? "Student" : "Shop owner"}
              </button>
            ))}
          </div>

          <Field label="Full name">
            <TextInput
              value={name}
              autoComplete="name"
              onChange={(e) => setName(e.target.value)}
              placeholder="Ramveer Singh"
            />
          </Field>
          <Field label="Email">
            <TextInput
              type="email"
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@campus.edu"
            />
          </Field>
          <Field label="Phone (optional)">
            <TextInput
              value={phone}
              autoComplete="tel"
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
            />
          </Field>
          <Field label="Password">
            <TextInput
              type="password"
              value={password}
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </Field>

          {error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">Already have an account?</p>
          <Link
            to="/login"
            className="mt-2 inline-flex min-h-[46px] items-center justify-center rounded-xl border border-border bg-surface px-5 text-sm font-semibold"
          >
            Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
