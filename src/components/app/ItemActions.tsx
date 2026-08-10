import { motion } from "motion/react";
import { Heart, Check, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { FoodItem } from "@/lib/data";
import { useStore } from "@/lib/store";

export function FavouriteButton({
  item,
  className,
}: {
  item: FoodItem;
  className?: string;
}) {
  const { isFavourite, toggleFavourite } = useStore();
  const active = isFavourite(item.id);

  return (
    <motion.button
      whileTap={{ scale: 0.82 }}
      animate={active ? { scale: [1, 1.25, 1] } : { scale: 1 }}
      transition={{ duration: 0.22 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavourite(item);
      }}
      aria-pressed={active}
      aria-label={active ? `Remove ${item.name} from favourites` : `Add ${item.name} to favourites`}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-full border border-border bg-surface/90 backdrop-blur",
        className,
      )}
    >
      <Heart
        size={17}
        className={active ? "text-primary" : "text-muted-foreground"}
        fill={active ? "currentColor" : "none"}
        strokeWidth={2}
      />
    </motion.button>
  );
}

export function AddToCartButton({
  item,
  variant = "icon",
  qty = 1,
  onAdded,
}: {
  item: FoodItem;
  variant?: "icon" | "wide";
  qty?: number;
  onAdded?: () => void;
}) {
  const { addToCart } = useStore();
  const [added, setAdded] = useState(false);

  const handle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!item.available) return;
    addToCart(item, qty);
    setAdded(true);
    onAdded?.();
    setTimeout(() => setAdded(false), 1200);
  };

  if (variant === "wide") {
    return (
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handle}
        disabled={!item.available}
        className="min-h-[52px] w-full rounded-2xl bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-50"
      >
        {added ? "✓ Added" : item.available ? `Add · ₹${item.price * qty}` : "Unavailable"}
      </motion.button>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.86 }}
      onClick={handle}
      disabled={!item.available}
      aria-label={`Add ${item.name} to cart`}
      className={cn(
        "grid h-9 min-w-[36px] place-items-center rounded-xl px-2 text-xs font-semibold transition-colors",
        added
          ? "bg-success text-success-foreground"
          : "bg-primary text-primary-foreground disabled:bg-secondary disabled:text-muted-foreground",
      )}
    >
      {added ? <Check size={16} /> : <Plus size={16} />}
    </motion.button>
  );
}
