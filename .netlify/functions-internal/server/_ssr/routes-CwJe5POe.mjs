import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as motion } from "../_libs/motion.mjs";
import { D as Clock, l as Star } from "../_libs/lucide-react.mjs";
import { t as AppHeader } from "./AppHeader-CXWIP8s7.mjs";
import { n as StatusBadge, t as EmptyState } from "./Primitives-DFV0Uw5E.mjs";
import { n as FoodDetailsSheet, r as FoodRow, t as FoodCard } from "./FoodCard-BVl-70f2.mjs";
import { _ as useCatalog, f as CATEGORIES, v as useStore } from "./router-BGLoriXd.mjs";
import { n as SearchBar, r as SectionTitle, t as CategorySelector } from "./CategorySelector-CH2xhnjS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CwJe5POe.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ShopCard({ shop, index = 0 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		initial: {
			opacity: 0,
			y: 12
		},
		animate: {
			opacity: 1,
			y: 0
		},
		transition: {
			duration: .25,
			delay: index * .04
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/shop/$shopId",
			params: { shopId: shop.id },
			className: "flex gap-3 rounded-2xl bg-card p-3 shadow-card active:scale-[0.99] transition-transform",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: shop.image,
				alt: `${shop.name} storefront`,
				loading: "lazy",
				width: 1024,
				height: 576,
				className: "h-20 w-24 shrink-0 rounded-xl object-cover"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "truncate text-base font-semibold",
							children: shop.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1 text-xs font-medium text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
								size: 13,
								className: "text-primary",
								fill: "currentColor"
							}), shop.rating]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 line-clamp-1 text-xs text-muted-foreground",
						children: shop.description
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
							tone: shop.isOpen ? "open" : "closed",
							dot: true,
							children: shop.isOpen ? "Open" : "Closed"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1 text-xs text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { size: 12 }),
								" ",
								shop.prepTime
							]
						})]
					})
				]
			})]
		})
	});
}
var greetingFor = () => {
	const h = (/* @__PURE__ */ new Date()).getHours();
	if (h < 5) return "Late night cravings";
	if (h < 12) return "Good morning";
	if (h < 17) return "Good afternoon";
	return "Good evening";
};
function HomePage() {
	const navigate = useNavigate();
	const { user, favouriteItems } = useStore();
	const [query, setQuery] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)("All");
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [greeting, setGreeting] = (0, import_react.useState)("Hello");
	(0, import_react.useEffect)(() => setGreeting(greetingFor()), []);
	const { shops, foods } = useCatalog();
	const popular = (0, import_react.useMemo)(() => foods.filter((f) => f.popular), [foods]);
	const searchResults = (0, import_react.useMemo)(() => {
		const q = query.trim().toLowerCase();
		if (!q) return null;
		return {
			foods: foods.filter((f) => f.name.toLowerCase().includes(q)),
			shops: shops.filter((s) => s.name.toLowerCase().includes(q))
		};
	}, [
		query,
		shops,
		foods
	]);
	const filteredPopular = category === "All" ? popular : foods.filter((f) => f.category === category && f.popular);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pb-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {
				greeting: user.id ? `${greeting}, ${user.name} 👋` : greeting + " 👋",
				subtitle: "What are you craving today?",
				initials: user.initials,
				signedIn: Boolean(user.id)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pt-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchBar, {
					value: query,
					onChange: setQuery
				})
			}),
			searchResults ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "pt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { title: "Results" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3 px-5",
					children: [
						searchResults.shops.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShopCard, {
							shop: s,
							index: i
						}, s.id)),
						searchResults.foods.map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FoodRow, {
							item: f,
							index: i,
							showShop: true,
							onOpen: setSelected
						}, f.id)),
						searchResults.foods.length === 0 && searchResults.shops.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
							title: "Nothing found",
							description: "Try a different dish or shop name."
						})
					]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategorySelector, {
						categories: CATEGORIES,
						value: category,
						onChange: setCategory
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { title: "Open now" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-3 px-5",
					children: shops.map((shop, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShopCard, {
						shop,
						index: i
					}, shop.id))
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, { title: category === "All" ? "Popular today" : category }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					layout: true,
					className: "no-scrollbar flex gap-3 overflow-x-auto px-5 pb-1",
					children: [filteredPopular.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FoodCard, {
						item,
						index: i,
						onOpen: setSelected
					}, item.id)), filteredPopular.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "py-6 text-sm text-muted-foreground",
						children: "Nothing here yet."
					})]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
					title: "Your favourites",
					action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => navigate({ to: "/favourites" }),
						className: "text-sm font-medium text-primary",
						children: "See all"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3 px-5",
					children: [favouriteItems.slice(0, 3).map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FoodRow, {
						item,
						index: i,
						showShop: true,
						onOpen: setSelected
					}, item.id)), favouriteItems.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Tap the heart on any dish to reorder it in one tap."
					})]
				})] })
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FoodDetailsSheet, {
				item: selected,
				onClose: () => setSelected(null)
			})
		]
	});
}
//#endregion
export { HomePage as component };
