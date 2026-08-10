import { cn } from "@/lib/utils";

export function StatusBadge({
  tone = "neutral",
  children,
  dot = false,
}: {
  tone?: "open" | "closed" | "neutral" | "success" | "warning";
  children: React.ReactNode;
  dot?: boolean;
}) {
  const tones: Record<string, string> = {
    open: "bg-success-soft text-success",
    success: "bg-success-soft text-success",
    closed: "bg-secondary text-muted-foreground",
    neutral: "bg-secondary text-secondary-foreground",
    warning: "bg-primary-soft text-accent-foreground",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        tones[tone],
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-secondary", className)} />;
}

export function FoodCardSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="aspect-square w-full rounded-2xl" />
      <Skeleton className="h-3.5 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: {
  title: string;
  description: string;
  actionLabel?: string | undefined;
  onAction?: (() => void) | undefined;
  icon?: React.ReactNode | undefined;
}) {
  return (
    <div className="flex flex-col items-center px-8 py-16 text-center">
      {icon && (
        <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-primary-soft text-accent-foreground">
          {icon}
        </div>
      )}
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1.5 max-w-[16rem] text-sm text-muted-foreground">{description}</p>
      {actionLabel && (
        <button
          onClick={onAction}
          className="mt-6 min-h-[48px] rounded-2xl bg-primary px-6 text-sm font-semibold text-primary-foreground"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
