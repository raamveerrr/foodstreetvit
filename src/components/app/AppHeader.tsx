import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function Avatar({
  initials,
  className,
}: {
  initials: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "grid place-items-center rounded-full bg-primary-soft text-sm font-bold text-accent-foreground",
        className,
      )}
    >
      {initials}
    </span>
  );
}

export function AppHeader({
  greeting,
  subtitle,
  initials,
}: {
  greeting: string;
  subtitle: string;
  initials: string;
}) {
  return (
    <header className="flex items-start justify-between gap-4 px-5 pt-6">
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{greeting}</p>
        <h1 className="mt-0.5 truncate text-2xl font-bold tracking-tight">{subtitle}</h1>
      </div>
      <motion.div whileTap={{ scale: 0.92 }}>
        <Link
          to="/profile"
          aria-label="Open profile"
          className="grid h-11 w-11 place-items-center rounded-full border border-border bg-surface"
        >
          <Avatar initials={initials} className="h-9 w-9" />
        </Link>
      </motion.div>
    </header>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string | undefined;
  action?: React.ReactNode | undefined;
}) {
  return (
    <header className="flex items-start justify-between gap-4 px-5 pb-1 pt-6">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}
