import { motion } from "motion/react";
import { formatPrice, getShop, type FoodItem } from "@/lib/data";
import { AddToCartButton, FavouriteButton } from "./ItemActions";

export function FoodCard({
  item,
  index = 0,
  onOpen,
}: {
  item: FoodItem;
  index?: number;
  onOpen?: (item: FoodItem) => void;
}) {
  const shop = getShop(item.shopId);
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="w-[160px] shrink-0"
    >
      <button
        onClick={() => onOpen?.(item)}
        className="block w-full text-left"
        aria-label={`View ${item.name}`}
      >
        <div className="relative">
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            width={640}
            height={640}
            className="aspect-square w-full rounded-2xl object-cover"
          />
          <FavouriteButton item={item} className="absolute right-2 top-2" />
        </div>
        <h3 className="mt-2 truncate text-sm font-semibold">{item.name}</h3>
        <p className="truncate text-xs text-muted-foreground">{shop?.name}</p>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-sm font-bold">{formatPrice(item.price)}</span>
          <AddToCartButton item={item} />
        </div>
      </button>
    </motion.article>
  );
}

export function FoodRow({
  item,
  index = 0,
  showShop = false,
  onOpen,
}: {
  item: FoodItem;
  index?: number;
  showShop?: boolean;
  onOpen?: (item: FoodItem) => void;
}) {
  const shop = getShop(item.shopId);
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.03 }}
    >
      <button
        onClick={() => onOpen?.(item)}
        className="flex w-full gap-3 rounded-2xl bg-card p-3 text-left shadow-card active:scale-[0.99] transition-transform"
        aria-label={`View ${item.name}`}
      >
        <div className="relative shrink-0">
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            width={640}
            height={640}
            className="h-[84px] w-[84px] rounded-xl object-cover"
          />
          <FavouriteButton item={item} className="absolute -right-2 -top-2 h-8 w-8" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="truncate text-sm font-semibold">{item.name}</h3>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
            {showShop ? shop?.name : item.description}
          </p>
          <div className="mt-auto flex items-end justify-between pt-2">
            <span className="text-sm font-bold">{formatPrice(item.price)}</span>
            {item.available ? (
              <AddToCartButton item={item} />
            ) : (
              <span className="text-[11px] font-semibold uppercase text-muted-foreground">
                Sold out
              </span>
            )}
          </div>
        </div>
      </button>
    </motion.article>
  );
}
