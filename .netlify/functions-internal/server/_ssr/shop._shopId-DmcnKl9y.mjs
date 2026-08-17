import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { D as Clock, l as Star } from "../_libs/lucide-react.mjs";
import { n as StatusBadge, t as EmptyState } from "./Primitives-DFV0Uw5E.mjs";
import { t as BackBar } from "./BackBar-C2z7hzFf.mjs";
import { n as FoodDetailsSheet, r as FoodRow } from "./FoodCard-BVl-70f2.mjs";
import { _ as useCatalog } from "./router-BGLoriXd.mjs";
import { n as Route$10 } from "./router-BGLoriXd2.mjs";
import { t as CategorySelector } from "./CategorySelector-CH2xhnjS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shop._shopId-DmcnKl9y.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ShopPage() {
	const { shopId } = Route$10.useParams();
	const { loading, shops, foods } = useCatalog();
	const shop = shops.find((s) => s.id === shopId);
	const items = shop ? foods.filter((f) => f.shopId === shop.id) : [];
	const [category, setCategory] = (0, import_react.useState)("Popular");
	const [selected, setSelected] = (0, import_react.useState)(null);
	const categories = (0, import_react.useMemo)(() => ["Popular", ...Array.from(new Set(items.map((i) => i.category)))], [items]);
	const visible = category === "Popular" ? items : items.filter((i) => i.category === category);
	if (!shop) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pb-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BackBar, { title: "Shop" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: loading ? "Loading shop…" : "Unable to load this shop.",
			description: loading ? "One moment." : "It may no longer be available."
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pb-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: shop.image,
					alt: `${shop.name} storefront`,
					width: 1024,
					height: 576,
					className: "h-44 w-full object-cover"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-x-0 top-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BackBar, {})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "-mt-6 rounded-t-3xl bg-background px-5 pt-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-bold tracking-tight",
						children: shop.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: shop.description
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1 text-sm font-medium",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
							size: 15,
							className: "text-primary",
							fill: "currentColor"
						}), shop.rating]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
						tone: shop.isOpen ? "open" : "closed",
						dot: true,
						children: shop.isOpen ? "Open" : "Closed"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1 text-xs text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { size: 13 }),
							" ",
							shop.prepTime
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "sticky top-0 z-20 -mx-0 mt-4 bg-background/95 py-2 backdrop-blur",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategorySelector, {
					categories,
					value: category,
					onChange: setCategory
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3 px-5 pt-2",
				children: visible.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FoodRow, {
					item,
					index: i,
					onOpen: setSelected
				}, item.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FoodDetailsSheet, {
				item: selected,
				onClose: () => setSelected(null)
			})
		]
	});
}
//#endregion
export { ShopPage as component };
