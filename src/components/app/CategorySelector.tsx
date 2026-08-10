import { motion } from "motion/react";
import { Search } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function CategorySelector({
  categories,
  value,
  onChange,
}: {
  categories: readonly string[];
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 py-1">
      {categories.map((c) => {
        const active = c === value;
        return (
          <motion.button
            key={c}
            whileTap={{ scale: 0.94 }}
            onClick={() => onChange(c)}
            aria-pressed={active}
            className={cn(
              "relative min-h-[40px] shrink-0 rounded-full px-4 text-sm font-medium transition-colors",
              active ? "text-primary-foreground" : "bg-secondary text-secondary-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId="category-pill"
                transition={{ type: "spring", stiffness: 500, damping: 36 }}
                className="absolute inset-0 rounded-full bg-primary"
              />
            )}
            <span className="relative">{c}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search food or shops",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <motion.div
      animate={{ scale: focused ? 1.01 : 1 }}
      transition={{ duration: 0.18 }}
      className={cn(
        "mx-5 flex min-h-[48px] items-center gap-2.5 rounded-2xl border bg-surface px-4 transition-colors",
        focused ? "border-primary" : "border-border",
      )}
    >
      <Search size={18} className={focused ? "text-primary" : "text-muted-foreground"} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </motion.div>
  );
}

export function SectionTitle({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-5 pb-3 pt-6">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {action}
    </div>
  );
}
