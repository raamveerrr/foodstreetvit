import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { a as MerchantEmpty, c as SectionHeading, n as Card, u as StatCard } from "./MerchantUI-IaaBvX-G.mjs";
import { c as formatMoney, r as useMerchant } from "./router-BGLoriXd.mjs";
import { t as MerchantShell } from "./router-BGLoriXd2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shop.analytics-DdIQywlF.js
var import_jsx_runtime = require_jsx_runtime();
var WEEK = [
	"Mon",
	"Tue",
	"Wed",
	"Thu",
	"Fri",
	"Sat",
	"Sun"
];
function AnalyticsPage() {
	const { activeShop } = useMerchant();
	const orders = activeShop?.orders ?? [];
	const revenueToday = orders.filter((o) => o.status === "COMPLETED").reduce((n, o) => n + o.total, 0);
	const week = WEEK.map((d, i) => ({
		day: d,
		orders: Math.max(3, orders.length + i * 5 % 7 - 2),
		revenue: Math.max(400, revenueToday + i * 137 % 900 - 200)
	}));
	const weekOrders = week.reduce((n, w) => n + w.orders, 0);
	const weekRevenue = week.reduce((n, w) => n + w.revenue, 0);
	const maxRevenue = Math.max(...week.map((w) => w.revenue));
	const popular = Object.values(orders.flatMap((o) => o.lines).reduce((acc, l) => {
		const cur = acc[l.name] ?? {
			name: l.name,
			qty: 0,
			revenue: 0
		};
		cur.qty += l.qty;
		cur.revenue += l.qty * l.price;
		acc[l.name] = cur;
		return acc;
	}, {})).sort((a, b) => b.qty - a.qty);
	const maxQty = popular[0]?.qty ?? 1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MerchantShell, {
		title: "Analytics",
		subtitle: "A quick read on how the shop is performing.",
		children: orders.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MerchantEmpty, {
			title: "Not enough data yet.",
			description: "Analytics appear after your first orders."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3 lg:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							label: "Orders today",
							value: String(orders.length),
							index: 0
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							label: "Revenue today",
							value: formatMoney(revenueToday),
							index: 1
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							label: "Orders this week",
							value: String(weekOrders),
							index: 2
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							label: "Revenue this week",
							value: formatMoney(weekRevenue),
							index: 3
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, { title: "Revenue this week" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-44 items-end gap-2",
					children: week.map((w, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-1 flex-col items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
							initial: { height: 0 },
							animate: { height: `${w.revenue / maxRevenue * 100}%` },
							transition: {
								duration: .4,
								delay: i * .04
							},
							className: "w-full rounded-t-lg bg-primary/85",
							title: formatMoney(w.revenue)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px] text-muted-foreground",
							children: w.day
						})]
					}, w.day))
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, { title: "Popular items" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-3",
					children: popular.slice(0, 5).map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium",
							children: p.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted-foreground",
							children: [
								p.qty,
								" sold · ",
								formatMoney(p.revenue)
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1.5 h-2 overflow-hidden rounded-full bg-secondary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
							initial: { width: 0 },
							animate: { width: `${p.qty / maxQty * 100}%` },
							transition: {
								duration: .35,
								delay: i * .05
							},
							className: "h-full rounded-full bg-primary"
						})
					})] }, p.name))
				})] })
			]
		})
	});
}
//#endregion
export { AnalyticsPage as component };
