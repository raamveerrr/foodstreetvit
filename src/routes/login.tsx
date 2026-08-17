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
  const { signIn, signInWithGoogle } = useAuth();
  const [identifier, setIdentifier] = useState(""); // Email or phone
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (!identifier.trim() || !password.trim()) {
      setError("Enter your email or phone and password to continue.");
      return;
    }
    setBusy(true);
    try {
      // Basic check if it's an email or phone number
      const profile = await signIn(identifier, password);
      console.log("LoginPage: signIn returned profile:", profile);
      console.log("LoginPage: profile?.role:", profile?.role);
      toast.success("Signed in");
      if (profile?.role === "SUPER_ADMIN") {
        console.log("LoginPage: redirecting to /admin");
        navigate({ to: "/admin", replace: true });
      } else if (profile?.role === "SHOP_OWNER") {
        console.log("LoginPage: redirecting to /shop");
        navigate({ to: "/shop", replace: true });
      } else {
        console.log("LoginPage: redirecting to /");
        navigate({ to: "/", replace: true });
      }
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
          <Field label="Email or Phone">
            <TextInput
              type="text"
              value={identifier}
              autoComplete="username"
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="you@campus.edu or 9876543210"
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

        <div className="mt-5 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <div className="mt-5">
          <Button
            variant="outline"
            className="w-full bg-surface"
            disabled={busy}
            onClick={() => {
              setBusy(true);
              signInWithGoogle().catch((e) => {
                setError(e.message);
                setBusy(false);
              });
            }}
          >
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
            </svg>
            Google
          </Button>
        </div>

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
