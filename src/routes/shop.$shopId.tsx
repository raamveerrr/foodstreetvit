import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Clock, Star } from "lucide-react";
import { BackBar } from "@/components/app/BackBar";
import { CategorySelector } from "@/components/app/CategorySelector";
import { FoodRow } from "@/components/app/FoodCard";
import { FoodDetailsSheet } from "@/components/app/FoodDetailsSheet";
import { StatusBadge } from "@/components/app/Primitives";
import { FoodDetailsSheet as Sheet } from "@/components/app/FoodDetailsSheet";
import { getShop, getShopFoods, type FoodItem } from "@/lib/data";
import { useCatalog } from "@/lib/catalog-store";
import { EmptyState } from "@/components/app/Primitives";

export const Route = createFileRoute("/shop/$shopId")({
  head: () => {
    const name = "Shop";
    return {
      meta: [
        { title: `${name} — DigitalFoodStreet` },
        {
          name: "description",
          content: `Browse the ${name} menu and pre-order for campus pickup on DigitalFoodStreet.`,
        },
        { property: "og:title", content: `${name} — DigitalFoodStreet` },
        { property: "og:description", content: `Pre-order from ${name} and skip the queue.` },
      ],
    };
  },
  component: ShopPage,
});

function ShopPage() {
  const { shopId } = Route.useParams();
  const { loading } = useCatalog();
  const shop = getShop(shopId);
  const items = shop ? getShopFoods(shop.id) : [];
  const [category, setCategory] = useState("Popular");
  const [selected, setSelected] = useState<FoodItem | null>(null);

  const categories = useMemo(
    () => ["Popular", ...Array.from(new Set(items.map((i) => i.category)))],
    [items],
  );

  const visible =
    category === "Popular" ? items : items.filter((i) => i.category === category);

  if (!shop) {
    return (
      <div className="pb-4">
        <BackBar title="Shop" />
        <EmptyState
          title={loading ? "Loading shop…" : "Unable to load this shop."}
          description={loading ? "One moment." : "It may no longer be available."}
        />
      </div>
    );
  }

  return (
    <div className="pb-4">
      <div className="relative">
        <img
          src={shop.image}
          alt={`${shop.name} storefront`}
          width={1024}
          height={576}
          className="h-44 w-full object-cover"
        />
        <div className="absolute inset-x-0 top-0">
          <BackBar />
        </div>
      </div>

      <div className="-mt-6 rounded-t-3xl bg-background px-5 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{shop.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{shop.description}</p>
          </div>
          <span className="flex items-center gap-1 text-sm font-medium">
            <Star size={15} className="text-primary" fill="currentColor" />
            {shop.rating}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <StatusBadge tone={shop.isOpen ? "open" : "closed"} dot>
            {shop.isOpen ? "Open" : "Closed"}
          </StatusBadge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock size={13} /> {shop.prepTime}
          </span>
        </div>
      </div>

      <div className="sticky top-0 z-20 -mx-0 mt-4 bg-background/95 py-2 backdrop-blur">
        <CategorySelector categories={categories} value={category} onChange={setCategory} />
      </div>

      <div className="space-y-3 px-5 pt-2">
        {visible.map((item, i) => (
          <FoodRow key={item.id} item={item} index={i} onOpen={setSelected} />
        ))}
      </div>

      <Sheet item={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

void FoodDetailsSheet;
