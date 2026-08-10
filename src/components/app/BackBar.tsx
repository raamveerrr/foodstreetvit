import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

export function BackBar({ title }: { title?: string | undefined }) {
  return (
    <div className="flex items-center gap-3 px-5 pt-6">
      <Link
        to=".."
        aria-label="Go back"
        className="grid h-10 w-10 place-items-center rounded-full border border-border bg-surface"
      >
        <ChevronLeft size={20} />
      </Link>
      {title && <h1 className="text-xl font-bold tracking-tight">{title}</h1>}
    </div>
  );
}
