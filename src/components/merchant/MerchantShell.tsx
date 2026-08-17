import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect } from "react";
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  LogOut,
  ReceiptText,
  ScanLine,
  Settings,
  UsersRound,
  UtensilsCrossed,
} from "lucide-react";
import { useMerchant } from "@/lib/merchant-store";
import { cn } from "@/lib/utils";
import { SkeletonBlock } from "./MerchantUI";

export const MERCHANT_NAV = [
  { to: "/shop", label: "Dashboard", icon: LayoutDashboard },
  { to: "/shop/orders", label: "Orders", icon: ReceiptText },
  { to: "/shop/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/shop/receipts", label: "Receipts", icon: ScanLine },
  { to: "/shop/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/shop/customers", label: "Customers", icon: UsersRound },
  { to: "/shop/settings", label: "Settings", icon: Settings },
  { to: "/shop/payments", label: "Payments", icon: CreditCard },
] as const;

const MERCHANT_PATHS = new Set<string>([
  "/shop-login",
  "/create-shop",
  "/login",
  "/signup",
  "/forgot-password",
  "/admin",
  ...MERCHANT_NAV.map((n) => n.to),
]);

/** Student `/shop/$shopId` pages must never be treated as merchant routes. */
export const isMerchantPath = (pathname: string) => {
  const cleanPath = pathname.replace(/\/$/, "") || "/";
  // The only dynamic merchant paths are those under /admin
  if (cleanPath.startsWith("/admin")) return true;
  return MERCHANT_PATHS.has(cleanPath) || cleanPath === "/shop/change-password";
};

const AVAILABILITY = {
  open: { label: "Open", dot: "bg-success", chip: "bg-success-soft text-success" },
  closed: { label: "Closed", dot: "bg-muted-foreground", chip: "bg-secondary text-muted-foreground" },
  unavailable: {
    label: "Temporarily unavailable",
    dot: "bg-warning",
    chip: "bg-primary-soft text-accent-foreground",
  },
} as const;

function ShopSwitcher() {
  const { shops, activeShop, setActiveShop } = useMerchant();
  if (!activeShop) return null;
  return (
    <div className="min-w-0">
      <p className="truncate text-[15px] font-bold leading-tight">{activeShop.name}</p>
      {shops.length > 1 ? (
        <select
          aria-label="Switch shop"
          value={activeShop.id}
          onChange={(e) => setActiveShop(e.target.value)}
          className="-ml-1 mt-0.5 max-w-full rounded-md bg-transparent px-1 text-xs text-muted-foreground outline-none"
        >
          {shops.map((s) => (
            <option key={s.id} value={s.id}>
              Managing: {s.name}
            </option>
          ))}
        </select>
      ) : (
        <p className="text-xs text-muted-foreground">Shop Dashboard</p>
      )}
    </div>
  );
}

function StatusChip() {
  const { activeShop } = useMerchant();
  if (!activeShop) return null;
  const a = AVAILABILITY[activeShop.availability];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
        a.chip,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", a.dot)} />
      {a.label}
    </span>
  );
}

export function MerchantShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { hydrated, authed, signOut } = useMerchant();

  useEffect(() => {
    if (hydrated && !authed) navigate({ to: "/shop-login", replace: true });
  }, [hydrated, authed, navigate]);

  if (!hydrated || !authed) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar px-3 py-5 lg:flex">
        <div className="px-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
            DigitalFoodStreet
          </p>
          <div className="mt-3">
            <ShopSwitcher />
          </div>
          <div className="mt-3">
            <StatusChip />
          </div>
        </div>
        <nav className="mt-6 flex-1 space-y-1">
          {MERCHANT_NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "relative flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="merchant-nav"
                    transition={{ type: "spring", stiffness: 500, damping: 36 }}
                    className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-primary"
                  />
                )}
                <Icon size={18} strokeWidth={active ? 2.3 : 1.9} />
                {label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={() => {
            signOut();
            navigate({ to: "/shop-login", replace: true });
          }}
          className="flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3 px-4 pt-3">
            <ShopSwitcher />
            <div className="flex items-center gap-2">
              <StatusChip />
              <button
                aria-label="Sign out"
                onClick={() => {
                  signOut();
                  navigate({ to: "/shop-login", replace: true });
                }}
                className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
          <nav className="no-scrollbar mt-2 flex gap-1 overflow-x-auto px-3 pb-2">
            {MERCHANT_NAV.map(({ to, label, icon: Icon }) => {
              const active = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "flex min-h-[40px] shrink-0 items-center gap-2 rounded-full px-3.5 text-[13px] font-semibold transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground",
                  )}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="mx-auto w-full max-w-6xl px-4 pb-16 pt-5 sm:px-6"
        >
          <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-[22px] font-bold tracking-tight sm:text-2xl">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            {actions}
          </header>
          {children}
        </motion.main>
      </div>
    </div>
  );
}
