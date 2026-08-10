import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Home, ShoppingBag, Heart, ReceiptText } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const ITEMS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/cart", label: "Cart", icon: ShoppingBag },
  { to: "/favourites", label: "Favourite", icon: Heart },
  { to: "/receipts", label: "Receipts", icon: ReceiptText },
] as const;

export function BottomNavigation() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { cartCount } = useStore();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur-lg shadow-nav safe-bottom"
    >
      <ul className="app-shell flex items-stretch justify-between px-2">
        {ITEMS.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className="relative flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-xl py-2"
              >
                {active && (
                  <motion.span
                    layoutId="nav-indicator"
                    transition={{ type: "spring", stiffness: 500, damping: 34 }}
                    className="absolute inset-x-4 top-0 h-[3px] rounded-full bg-primary"
                  />
                )}
                <motion.span
                  whileTap={{ scale: 0.86 }}
                  animate={{ scale: active ? 1.06 : 1 }}
                  transition={{ duration: 0.18 }}
                  className="relative"
                >
                  <Icon
                    size={22}
                    strokeWidth={active ? 2.4 : 1.9}
                    className={cn(
                      "transition-colors",
                      active ? "text-primary" : "text-muted-foreground",
                    )}
                    fill={active && label === "Favourite" ? "currentColor" : "none"}
                  />
                  {label === "Cart" && cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 600, damping: 22 }}
                      className="absolute -right-2.5 -top-1.5 min-w-[18px] rounded-full bg-primary px-1 text-[10px] font-bold leading-[18px] text-primary-foreground"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </motion.span>
                <span
                  className={cn(
                    "text-[11px] font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
