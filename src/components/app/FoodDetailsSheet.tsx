import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { formatPrice, getShop, type FoodItem } from "@/lib/data";
import { BottomSheet } from "./BottomSheet";
import { AddToCartButton, FavouriteButton } from "./ItemActions";

export function FoodDetailsSheet({
  item,
  onClose,
}: {
  item: FoodItem | null;
  onClose: () => void;
}) {
  const [qty, setQty] = useState(1);
  const shop = item ? getShop(item.shopId) : null;

  return (
    <BottomSheet
      open={!!item}
      onClose={() => {
        setQty(1);
        onClose();
      }}
      title={item?.name}
    >
      {item && (
        <div className="px-5">
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            width={640}
            height={640}
            className="aspect-[4/3] w-full rounded-2xl object-cover"
          />
          <div className="mt-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-xl font-bold tracking-tight">{item.name}</h3>
              <p className="text-sm text-muted-foreground">{shop?.name}</p>
            </div>
            <FavouriteButton item={item} className="h-10 w-10" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{item.description}</p>
          {item.ingredients && (
            <p className="mt-3 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Ingredients · </span>
              {item.ingredients}
            </p>
          )}
          <div className="mt-5 flex items-center justify-between">
            <span className="text-xl font-bold">{formatPrice(item.price * qty)}</span>
            <div className="flex items-center gap-4 rounded-2xl bg-secondary px-3 py-2">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="grid h-8 w-8 place-items-center rounded-full bg-surface"
              >
                <Minus size={15} />
              </button>
              <span className="w-4 text-center text-sm font-semibold">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                aria-label="Increase quantity"
                className="grid h-8 w-8 place-items-center rounded-full bg-surface"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>
          <div className="mt-5">
            <AddToCartButton
              item={item}
              variant="wide"
              qty={qty}
              onAdded={() => {
                setQty(1);
                onClose();
              }}
            />
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
