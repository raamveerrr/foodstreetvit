import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button, Field, TextInput } from "@/components/merchant/MerchantUI";
import { useMerchant } from "@/lib/merchant-store";

export const Route = createFileRoute("/shop-login")({
  head: () => ({
    meta: [
      { title: "Shop Owner Login — DigitalFoodStreet" },
      {
        name: "description",
        content:
          "Sign in to the DigitalFoodStreet merchant app to manage your campus shop, menu and orders.",
      },
      { property: "og:title", content: "Shop Owner Login — DigitalFoodStreet" },
      {
        property: "og:description",
        content: "Manage your campus shop, menu, orders and payments on DigitalFoodStreet.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ShopLoginPage,
});

function ShopLoginPage() {
  const navigate = useNavigate();
  const { signIn } = useMerchant();
  const [email, setEmail] = useState("owner@zuzu.com");
  const [password, setPassword] = useState("password");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password to continue.");
      return;
    }
    setBusy(true);
    window.setTimeout(() => {
      const { hasShop } = signIn(email.trim(), password);
      setBusy(false);
      toast.success("Signed in");
      navigate({ to: hasShop ? "/shop" : "/create-shop", replace: true });
    }, 400);
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
          <h1 className="mt-2 text-2xl font-bold tracking-tight">Shop Owner Login</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Manage your shop, menu and incoming orders.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="space-y-4 rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6"
        >
          <Field label="Email">
            <TextInput
              type="email"
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@shop.com"
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

          <button
            type="button"
            onClick={() => toast("Password reset link sent", { description: email })}
            className="w-full text-center text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Forgot password?
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">Don't have a shop?</p>
          <Link
            to="/create-shop"
            className="mt-2 inline-flex min-h-[46px] items-center justify-center rounded-xl border border-border bg-surface px-5 text-sm font-semibold"
          >
            Create a Shop
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
