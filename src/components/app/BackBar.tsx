import { Link, useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

export function BackBar({ title, fallback = "/" }: { title?: string | undefined; fallback?: string }) {
  const router = useRouter();
  return (
    <div className="flex items-center gap-3 px-5 pt-6">
      <button
        onClick={() => {
          if (window.history.length > 2) {
            router.history.back();
          } else {
            router.navigate({ to: fallback, replace: true });
          }
        }}
        aria-label="Go back"
        className="grid h-10 w-10 place-items-center rounded-full border border-border bg-surface hover:bg-secondary transition-colors"
      >
        <ChevronLeft size={20} />
      </button>
      {title && <h1 className="text-xl font-bold tracking-tight">{title}</h1>}
    </div>
  );
}
