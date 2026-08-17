import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { T as Heart } from "../_libs/lucide-react.mjs";
import { r as PageHeader } from "./AppHeader-CXWIP8s7.mjs";
import { t as EmptyState } from "./Primitives-DFV0Uw5E.mjs";
import { n as FoodDetailsSheet, r as FoodRow } from "./FoodCard-BVl-70f2.mjs";
import { v as useStore } from "./router-BGLoriXd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/favourites-Bkyop8iT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function FavouritesPage() {
	const navigate = useNavigate();
	const { favouriteItems } = useStore();
	const [selected, setSelected] = (0, import_react.useState)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pb-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Your Favourites",
				subtitle: "Your go-to food, one tap away."
			}),
			favouriteItems.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { size: 26 }),
				title: "No favourites yet ❤️",
				description: "Save your favourites for faster ordering.",
				actionLabel: "Explore Food",
				onAction: () => navigate({ to: "/" })
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 space-y-3 px-5",
				children: favouriteItems.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FoodRow, {
					item,
					index: i,
					showShop: true,
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
export { FavouritesPage as component };
