import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Clock, Star } from "lucide-react";
import type { Shop } from "@/lib/data";
import { StatusBadge } from "./Primitives";

export function ShopCard({ shop, index = 0 }: { shop: Shop; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
    >
      <Link
        to="/shop/$shopId"
        params={{ shopId: shop.id }}
        className="flex gap-3 rounded-2xl bg-card p-3 shadow-card active:scale-[0.99] transition-transform"
      >
        <img
          src={shop.image}
          alt={`${shop.name} storefront`}
          loading="lazy"
          width={1024}
          height={576}
          className="h-20 w-24 shrink-0 rounded-xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-base font-semibold">{shop.name}</h3>
            <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Star size={13} className="text-primary" fill="currentColor" />
              {shop.rating}
            </span>
          </div>
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{shop.description}</p>
          <div className="mt-2 flex items-center gap-2">
            <StatusBadge tone={shop.isOpen ? "open" : "closed"} dot>
              {shop.isOpen ? "Open" : "Closed"}
            </StatusBadge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock size={12} /> {shop.prepTime}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
