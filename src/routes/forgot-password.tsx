import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Button, Field, TextInput } from "@/components/merchant/MerchantUI";
import { useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — DigitalFoodStreet" },
      {
        name: "description",
        content: "Reset the password for your DigitalFoodStreet campus food account.",
      },
      { property: "og:title", content: "Reset Password — DigitalFoodStreet" },
      { property: "og:description", content: "Send yourself a password reset link." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (!email.trim()) {
      setError("Enter the email you signed up with.");
      return;
    }
    setBusy(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast.success("Reset link sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't send the reset email.");
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
          <h1 className="text-2xl font-bold tracking-tight">Reset your password</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            We'll email you a secure link to set a new password.
          </p>
        </div>

        {sent ? (
          <div className="rounded-3xl border border-border bg-surface p-6 text-center shadow-card">
            <p className="text-sm font-semibold">Check your inbox</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              If an account exists for {email}, a reset link is on its way.
            </p>
            <Link
              to="/login"
              className="mt-5 inline-flex min-h-[46px] items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
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
            {error && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Sending…" : "Send reset link"}
            </Button>
            <Link
              to="/login"
              className="block text-center text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Back to sign in
            </Link>
          </form>
        )}
      </motion.div>
    </div>
  );
}
