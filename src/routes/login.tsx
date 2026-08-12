import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Button, Field, TextInput } from "@/components/merchant/MerchantUI";
import { useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — DigitalFoodStreet" },
      {
        name: "description",
        content:
          "Sign in to DigitalFoodStreet to pre-order campus food and collect it with a digital receipt.",
      },
      { property: "og:title", content: "Sign In — DigitalFoodStreet" },
      { property: "og:description", content: "Pre-order campus food and skip the queue." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password to continue.");
      return;
    }
    setBusy(true);
    try {
      const profile = await signIn(email, password);
      toast.success("Signed in");
      navigate({ to: profile?.role === "SHOP_OWNER" ? "/shop" : "/", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't sign you in.");
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
          <h1 className="mt-2 text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Sign in to order and track your pickups.
          </p>
        </div>

        <form
          onSubmit={(e) => void submit(e)}
          className="space-y-4 rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6"
        >
          <Field label="Email">
            <TextInput
              type="email"
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@campus.edu"
            />
          </Field>
          <Field label="Password">
            <TextInput
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </Field>

          {error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign In"}
          </Button>

          <Link
            to="/forgot-password"
            className="block text-center text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Forgot password?
          </Link>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">New to DigitalFoodStreet?</p>
          <Link
            to="/signup"
            className="mt-2 inline-flex min-h-[46px] items-center justify-center rounded-xl border border-border bg-surface px-5 text-sm font-semibold"
          >
            Create an account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
