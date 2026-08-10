import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Heart } from "lucide-react";
import { PageHeader } from "@/components/app/AppHeader";
import { FoodRow } from "@/components/app/FoodCard";
import { FoodDetailsSheet } from "@/components/app/FoodDetailsSheet";
import { EmptyState } from "@/components/app/Primitives";
import type { FoodItem } from "@/lib/data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/favourites")({
  head: () => ({
    meta: [
      { title: "Your Favourites — DigitalFoodStreet" },
      { name: "description", content: "Your go-to campus food, saved for one-tap reordering." },
      { property: "og:title", content: "Your Favourites — DigitalFoodStreet" },
      { property: "og:description", content: "Reorder your go-to campus food in one tap." },
    ],
  }),
  component: FavouritesPage,
});

function FavouritesPage() {
  const navigate = useNavigate();
  const { favouriteItems } = useStore();
  const [selected, setSelected] = useState<FoodItem | null>(null);

  return (
    <div className="pb-6">
      <PageHeader title="Your Favourites" subtitle="Your go-to food, one tap away." />

      {favouriteItems.length === 0 ? (
        <EmptyState
          icon={<Heart size={26} />}
          title="No favourites yet ❤️"
          description="Save your favourites for faster ordering."
          actionLabel="Explore Food"
          onAction={() => navigate({ to: "/" })}
        />
      ) : (
        <div className="mt-4 space-y-3 px-5">
          {favouriteItems.map((item, i) => (
            <FoodRow key={item.id} item={item} index={i} showShop onOpen={setSelected} />
          ))}
        </div>
      )}

      <FoodDetailsSheet item={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
