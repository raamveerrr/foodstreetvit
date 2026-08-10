import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { AppHeader } from "@/components/app/AppHeader";
import { CategorySelector, SearchBar, SectionTitle } from "@/components/app/CategorySelector";
import { FoodCard, FoodRow } from "@/components/app/FoodCard";
import { ShopCard } from "@/components/app/ShopCard";
import { FoodDetailsSheet } from "@/components/app/FoodDetailsSheet";
import { EmptyState } from "@/components/app/Primitives";
import {
  CATEGORIES,
  getPopularFoods,
  getShops,
  getFoods,
  type FoodItem,
} from "@/lib/data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DigitalFoodStreet — Pre-order campus food" },
      {
        name: "description",
        content:
          "Pre-order food from campus shops, pay online and collect with a digital receipt. Fast, simple, no queues.",
      },
      { property: "og:title", content: "DigitalFoodStreet — Pre-order campus food" },
      {
        property: "og:description",
        content: "Order from campus shops and collect with a digital receipt.",
      },
    ],
  }),
  component: HomePage,
});

const greetingFor = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

function HomePage() {
  const navigate = useNavigate();
  const { user, favouriteItems } = useStore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [selected, setSelected] = useState<FoodItem | null>(null);

  const shops = getShops();
  const popular = getPopularFoods();

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return {
      foods: getFoods().filter((f) => f.name.toLowerCase().includes(q)),
      shops: shops.filter((s) => s.name.toLowerCase().includes(q)),
    };
  }, [query, shops]);

  const filteredPopular =
    category === "All" ? popular : getFoods().filter((f) => f.category === category);

  return (
    <div className="pb-4">
      <AppHeader
        greeting={`${greetingFor()}, ${user.name} 👋`}
        subtitle="What are you craving today?"
        initials={user.initials}
      />

      <div className="pt-5">
        <SearchBar value={query} onChange={setQuery} />
      </div>

      {searchResults ? (
        <section className="pt-4">
          <SectionTitle title="Results" />
          <div className="space-y-3 px-5">
            {searchResults.shops.map((s, i) => (
              <ShopCard key={s.id} shop={s} index={i} />
            ))}
            {searchResults.foods.map((f, i) => (
              <FoodRow key={f.id} item={f} index={i} showShop onOpen={setSelected} />
            ))}
            {searchResults.foods.length === 0 && searchResults.shops.length === 0 && (
              <EmptyState
                title="Nothing found"
                description="Try a different dish or shop name."
              />
            )}
          </div>
        </section>
      ) : (
        <>
          <div className="pt-4">
            <CategorySelector categories={CATEGORIES} value={category} onChange={setCategory} />
          </div>

          <section>
            <SectionTitle title="Open now" />
            <div className="space-y-3 px-5">
              {shops.map((shop, i) => (
                <ShopCard key={shop.id} shop={shop} index={i} />
              ))}
            </div>
          </section>

          <section>
            <SectionTitle title={category === "All" ? "Popular today" : category} />
            <motion.div layout className="no-scrollbar flex gap-3 overflow-x-auto px-5 pb-1">
              {filteredPopular.map((item, i) => (
                <FoodCard key={item.id} item={item} index={i} onOpen={setSelected} />
              ))}
              {filteredPopular.length === 0 && (
                <p className="py-6 text-sm text-muted-foreground">Nothing here yet.</p>
              )}
            </motion.div>
          </section>

          <section>
            <SectionTitle
              title="Your favourites"
              action={
                <button
                  onClick={() => navigate({ to: "/favourites" })}
                  className="text-sm font-medium text-primary"
                >
                  See all
                </button>
              }
            />
            <div className="space-y-3 px-5">
              {favouriteItems.slice(0, 3).map((item, i) => (
                <FoodRow key={item.id} item={item} index={i} showShop onOpen={setSelected} />
              ))}
              {favouriteItems.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Tap the heart on any dish to reorder it in one tap.
                </p>
              )}
            </div>
          </section>
        </>
      )}

      <FoodDetailsSheet item={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
