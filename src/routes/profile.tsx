import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, HelpCircle, LogOut, ReceiptText, Settings, User } from "lucide-react";
import { BackBar } from "@/components/app/BackBar";
import { Avatar } from "@/components/app/AppHeader";
import { ConfirmSheet } from "@/components/app/BottomSheet";
import { useState } from "react";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your Account — DigitalFoodStreet" },
      { name: "description", content: "Manage your DigitalFoodStreet account, orders and settings." },
      { property: "og:title", content: "Your Account — DigitalFoodStreet" },
      { property: "og:description", content: "Manage your account, orders and settings." },
    ],
  }),
  component: ProfilePage,
});

const ROWS = [
  { label: "My account", icon: User },
  { label: "Settings", icon: Settings },
  { label: "Help & support", icon: HelpCircle },
];

function ProfilePage() {
  const { user, receipts, logout, signedIn } = useStore();
  const [confirmLogout, setConfirmLogout] = useState(false);

  if (!signedIn) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-5 text-center">
        <h1 className="text-xl font-bold">Please sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">You need to sign in to view your profile.</p>
        <Link to="/login" className="mt-6 flex h-11 w-full max-w-[200px] items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-6">
      <BackBar title="Account" />

      <div className="mt-6 flex items-center gap-4 px-5">
        <Avatar initials={user.initials} className="h-16 w-16 text-xl" />
        <div className="min-w-0">
          <p className="truncate text-lg font-bold tracking-tight">{user.name}</p>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="mt-6 space-y-2 px-5">
        <Link
          to="/receipts"
          className="flex min-h-[56px] items-center gap-3 rounded-2xl bg-card px-4 shadow-card"
        >
          <ReceiptText size={18} className="text-muted-foreground" />
          <span className="flex-1 text-sm font-medium">Past orders</span>
          <span className="text-xs text-muted-foreground">{receipts.length}</span>
          <ChevronRight size={18} className="text-muted-foreground" />
        </Link>

        {ROWS.map(({ label, icon: Icon }) => (
          <button
            key={label}
            className="flex min-h-[56px] w-full items-center gap-3 rounded-2xl bg-card px-4 text-left shadow-card"
          >
            <Icon size={18} className="text-muted-foreground" />
            <span className="flex-1 text-sm font-medium">{label}</span>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
        ))}

        <button
          onClick={() => setConfirmLogout(true)}
          className="flex min-h-[56px] w-full items-center gap-3 rounded-2xl bg-card px-4 text-left text-destructive shadow-card"
        >
          <LogOut size={18} />
          <span className="flex-1 text-sm font-medium">Logout</span>
        </button>
      </div>

      <ConfirmSheet
        open={confirmLogout}
        title="Log out of DigitalFoodStreet?"
        description="You can sign back in anytime. Your receipts stay with your account."
        confirmLabel="Log out"
        onConfirm={logout}
        onClose={() => setConfirmLogout(false)}
      />
    </div>
  );
}
