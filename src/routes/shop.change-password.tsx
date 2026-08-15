import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Button, Field, TextInput } from "@/components/merchant/MerchantUI";
import { useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/shop/change-password")({
  head: () => ({
    meta: [
      { title: "Secure Your Account — DigitalFoodStreet" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ChangePasswordPage,
});

function ChangePasswordPage() {
  const navigate = useNavigate();
  const { profile, changePassword } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If user is not authenticated or doesn't have mustChangePassword, redirect
  if (!profile || !profile.mustChangePassword) {
    navigate({ to: "/shop", replace: true });
    return null;
  }

  // Only shop owners should access this
  if (profile.role !== "SHOP_OWNER") {
    navigate({ to: "/", replace: true });
    return null;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      await changePassword(newPassword);
      toast.success("Password updated successfully");
      navigate({ to: "/shop", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to change your password.");
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
          <h1 className="mt-2 text-2xl font-bold tracking-tight">Secure your account</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Please create a new password before you can continue.
          </p>
        </div>

        <form
          onSubmit={(e) => void submit(e)}
          className="space-y-4 rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6"
        >
          <div className="rounded-2xl bg-blue-50 p-3 text-sm text-blue-900">
            Your account was created with a temporary password. Please set a secure password now.
          </div>

          <Field label="New password">
            <TextInput
              type="password"
              value={newPassword}
              autoComplete="new-password"
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </Field>

          <Field label="Confirm password">
            <TextInput
              type="password"
              value={confirmPassword}
              autoComplete="new-password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
            />
          </Field>

          {error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Updating…" : "Update Password"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
