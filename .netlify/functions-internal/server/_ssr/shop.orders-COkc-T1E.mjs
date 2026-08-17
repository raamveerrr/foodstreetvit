import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { a as MerchantEmpty, n as Card, s as OrderStatusBadge, t as Button } from "./MerchantUI-IaaBvX-G.mjs";
import { c as formatMoney, d as cn, l as formatTime, r as useMerchant, u as nextStatus } from "./router-BGLoriXd.mjs";
import { t as MerchantShell } from "./router-BGLoriXd2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shop.orders-COkc-T1E.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TABS = [
	"NEW",
	"ACCEPTED",
	"PREPARING",
	"READY",
	"COMPLETED",
	"CANCELLED"
];
function OrdersPage() {
	const { activeShop, setOrderStatus } = useMerchant();
	const [tab, setTab] = (0, import_react.useState)("NEW");
	const orders = (activeShop?.orders ?? []).filter((o) => o.status === tab);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MerchantShell, {
		title: "Orders",
		subtitle: "Fast, scannable order queue for the counter.",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "no-scrollbar -mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1",
			children: TABS.map((t) => {
				const count = (activeShop?.orders ?? []).filter((o) => o.status === t).length;
				const active = tab === t;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setTab(t),
					className: cn("flex min-h-[40px] shrink-0 items-center gap-2 rounded-full px-4 text-[13px] font-semibold transition-colors", active ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"),
					children: [t.charAt(0) + t.slice(1).toLowerCase(), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("text-[11px]", active ? "opacity-70" : "opacity-60"),
						children: count
					})]
				}, t);
			})
		}), orders.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MerchantEmpty, {
			title: "No orders yet.",
			description: `Nothing in ${tab.toLowerCase()} right now.`
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3 lg:grid-cols-2",
			children: orders.map((order, i) => {
				const next = nextStatus(order.status);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
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
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm font-bold",
									children: ["#", order.code]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: [
										order.customerName,
										" · ",
										formatTime(order.placedAt)
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderStatusBadge, { status: order.status })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 space-y-1 text-sm",
							children: order.lines.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									l.name,
									" × ",
									l.qty
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: formatMoney(l.price * l.qty)
								})]
							}, l.name))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex items-center justify-between border-t border-border pt-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-base font-bold",
								children: formatMoney(order.total)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("rounded-full px-2.5 py-1 text-[11px] font-bold uppercase", order.paid ? "bg-success-soft text-success" : "bg-secondary text-muted-foreground"),
								children: order.paid ? "Paid" : "Unpaid"
							})]
						}),
						(next || order.status !== "CANCELLED") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex gap-2",
							children: [next && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								className: "flex-1",
								onClick: () => setOrderStatus(order.id, next),
								children: ["Mark ", next.toLowerCase()]
							}), order.status !== "COMPLETED" && order.status !== "CANCELLED" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: () => setOrderStatus(order.id, "CANCELLED"),
								children: "Cancel"
							})]
						})
					] })
				}, order.id);
			})
		})]
	});
}
//#endregion
export { OrdersPage as component };
