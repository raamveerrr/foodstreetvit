import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/app/AppHeader";
import { EmptyState } from "@/components/app/Primitives";
import { ConfirmSheet } from "@/components/app/BottomSheet";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — DigitalFoodStreet" },
      { name: "description", content: "Review your campus food order and continue to checkout." },
      { property: "og:title", content: "Your Cart — DigitalFoodStreet" },
      { property: "og:description", content: "Review your order and check out in seconds." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const navigate = useNavigate();
  const { cartItems, cartShopName, subtotal, discount, total, increment, decrement, removeFromCart } =
    useStore();
  const [pendingRemove, setPendingRemove] = useState<{ id: string; name: string } | null>(null);

  if (cartItems.length === 0) {
    return (
      <div>
        <PageHeader title="Your Cart" />
        <EmptyState
          icon={<ShoppingBag size={26} />}
          title="Your cart is waiting 🍔"
          description="Add something delicious and it'll appear here."
          actionLabel="Explore Food"
          onAction={() => navigate({ to: "/" })}
        />
      </div>
    );
  }

  return (
    <div className="pb-44">
      <PageHeader title="Your Cart" subtitle={cartShopName ? `From ${cartShopName}` : undefined} />

      <div className="mt-4 space-y-3 px-5">
        {cartItems.map(({ item, qty }, i) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.03 }}
            className="flex gap-3 rounded-2xl bg-card p-3 shadow-card"
          >
            <img
              src={item.image}
              alt={item.name}
              loading="lazy"
              width={640}
              height={640}
              className="h-[76px] w-[76px] rounded-xl object-cover"
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <h3 className="truncate text-sm font-semibold">{item.name}</h3>
                <button
                  onClick={() => setPendingRemove({ id: item.id, name: item.name })}
                  aria-label={`Remove ${item.name}`}
                  className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center gap-3 rounded-xl bg-secondary px-2 py-1">
                  <button
                    onClick={() => decrement(item.id)}
                    aria-label="Decrease quantity"
                    className="grid h-8 w-8 place-items-center rounded-full bg-surface"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-4 text-center text-sm font-semibold">{qty}</span>
                  <button
                    onClick={() => increment(item.id)}
                    aria-label="Increase quantity"
                    className="grid h-8 w-8 place-items-center rounded-full bg-surface"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <span className="text-sm font-bold">₹{item.price * qty}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="fixed inset-x-0 bottom-[72px] z-30 safe-bottom">
        <div className="app-shell border-t border-border bg-surface px-5 pb-3 pt-4">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Campus discount</span>
              <span className="text-success">−₹{discount}</span>
            </div>
            <div className="flex justify-between pt-1 text-base font-bold">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate({ to: "/checkout" })}
            className="mt-3 min-h-[52px] w-full rounded-2xl bg-primary text-sm font-semibold text-primary-foreground"
          >
            Continue to Checkout
          </motion.button>
        </div>
      </div>

      <ConfirmSheet
        open={!!pendingRemove}
        title={pendingRemove ? `Remove ${pendingRemove.name}?` : ""}
        description="This item will be removed from your cart."
        onConfirm={() => pendingRemove && removeFromCart(pendingRemove.id)}
        onClose={() => setPendingRemove(null)}
      />
    </div>
  );
}
