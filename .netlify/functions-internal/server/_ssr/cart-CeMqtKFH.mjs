import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as motion } from "../_libs/motion.mjs";
import { b as Minus, c as Trash2, u as ShoppingBag, v as Plus } from "../_libs/lucide-react.mjs";
import { n as ConfirmSheet } from "./BottomSheet-CYaUI7P7.mjs";
import { r as PageHeader } from "./AppHeader-CXWIP8s7.mjs";
import { t as EmptyState } from "./Primitives-DFV0Uw5E.mjs";
import { v as useStore } from "./router-BGLoriXd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cart-CeMqtKFH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CartPage() {
	const navigate = useNavigate();
	const { cartItems, cartShopName, subtotal, discount, total, increment, decrement, removeFromCart } = useStore();
	const [pendingRemove, setPendingRemove] = (0, import_react.useState)(null);
	if (cartItems.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, { title: "Your Cart" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { size: 26 }),
		title: "Your cart is waiting 🍔",
		description: "Add something delicious and it'll appear here.",
		actionLabel: "Explore Food",
		onAction: () => navigate({ to: "/" })
	})] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pb-44",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Your Cart",
				subtitle: cartShopName ? `From ${cartShopName}` : void 0
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 space-y-3 px-5",
				children: cartItems.map(({ item, qty }, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					layout: true,
					initial: {
						opacity: 0,
						y: 8
					},
					animate: {
						opacity: 1,
						y: 0
					},
					transition: {
						duration: .2,
						delay: i * .03
					},
					className: "flex gap-3 rounded-2xl bg-card p-3 shadow-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: item.image,
						alt: item.name,
						loading: "lazy",
						width: 640,
						height: 640,
						className: "h-[76px] w-[76px] rounded-xl object-cover"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 flex-1 flex-col",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "truncate text-sm font-semibold",
								children: item.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setPendingRemove({
									id: item.id,
									name: item.name
								}),
								"aria-label": `Remove ${item.name}`,
								className: "grid h-8 w-8 place-items-center rounded-full text-muted-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { size: 16 })
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-auto flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3 rounded-xl bg-secondary px-2 py-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => decrement(item.id),
										"aria-label": "Decrease quantity",
										className: "grid h-8 w-8 place-items-center rounded-full bg-surface",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { size: 14 })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "w-4 text-center text-sm font-semibold",
										children: qty
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => increment(item.id),
										"aria-label": "Increase quantity",
										className: "grid h-8 w-8 place-items-center rounded-full bg-surface",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 14 })
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-sm font-bold",
								children: ["₹", item.price * qty]
							})]
						})]
					})]
				}, item.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-x-0 bottom-[72px] z-30 safe-bottom",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "app-shell border-t border-border bg-surface px-5 pb-3 pt-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Subtotal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["₹", subtotal] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Campus discount" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-success",
									children: ["−₹", discount]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between pt-1 text-base font-bold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["₹", total] })]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.button, {
						whileTap: { scale: .98 },
						onClick: () => navigate({ to: "/checkout" }),
						className: "mt-3 min-h-[52px] w-full rounded-2xl bg-primary text-sm font-semibold text-primary-foreground",
						children: "Continue to Checkout"
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmSheet, {
				open: !!pendingRemove,
				title: pendingRemove ? `Remove ${pendingRemove.name}?` : "",
				description: "This item will be removed from your cart.",
				onConfirm: () => pendingRemove && removeFromCart(pendingRemove.id),
				onClose: () => setPendingRemove(null)
			})
		]
	});
}
//#endregion
export { CartPage as component };
