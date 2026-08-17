import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { _ as Printer } from "../_libs/lucide-react.mjs";
import { a as MerchantEmpty, c as SectionHeading, n as Card, s as OrderStatusBadge, t as Button, u as StatCard } from "./MerchantUI-IaaBvX-G.mjs";
import { S as useAuth, T as supabase, c as formatMoney, d as cn, l as formatTime, r as useMerchant, u as nextStatus } from "./router-BGLoriXd.mjs";
import { t as MerchantShell } from "./router-BGLoriXd2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shop.index-juy0v6N0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var AVAILABILITY_OPTIONS = [
	{
		value: "open",
		label: "Open"
	},
	{
		value: "closed",
		label: "Closed"
	},
	{
		value: "unavailable",
		label: "Temporarily unavailable"
	}
];
function PrinterStatusWidget({ shopId }) {
	const [printer, setPrinter] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!shopId) return;
		supabase.from("printers").select("name, status").eq("shop_id", shopId).order("last_seen_at", { ascending: false }).limit(1).maybeSingle().then(({ data }) => {
			if (!data) return;
			supabase.from("print_jobs").select("id", {
				count: "exact",
				head: true
			}).eq("shop_id", shopId).in("status", ["QUEUED", "PRINTING"]).then(({ count }) => {
				setPrinter({
					status: data.status,
					name: data.name,
					queue: count ?? 0
				});
			});
		});
	}, [shopId]);
	if (!printer) return null;
	const isOnline = printer.status === "ONLINE" || printer.status === "PRINTING";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/shop/printer",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "flex items-center justify-between gap-3 hover:bg-secondary/60 transition-colors cursor-pointer",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("flex h-8 w-8 items-center justify-center rounded-full", isOnline ? "bg-success-soft" : "bg-secondary"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, {
						size: 15,
						className: isOnline ? "text-success" : "text-muted-foreground"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-semibold",
					children: printer.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Thermal Printer"
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [printer.queue > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary",
					children: [printer.queue, " queued"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("rounded-full px-2.5 py-1 text-[11px] font-bold uppercase", isOnline ? "bg-success-soft text-success" : "bg-secondary text-muted-foreground"),
					children: isOnline ? "Online" : "Offline"
				})]
			})]
		})
	});
}
function ShopDashboard() {
	const navigate = useNavigate();
	const { profile } = useAuth();
	const { activeShop, setAvailability, setOrderStatus } = useMerchant();
	const [greeting, setGreeting] = (0, import_react.useState)("Hello");
	(0, import_react.useEffect)(() => {
		if (profile?.mustChangePassword === true) navigate({
			to: "/shop/change-password",
			replace: true
		});
	}, [profile?.mustChangePassword, navigate]);
	(0, import_react.useEffect)(() => {
		const h = (/* @__PURE__ */ new Date()).getHours();
		setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
	}, []);
	const shop = activeShop;
	const orders = shop?.orders ?? [];
	const pending = orders.filter((o) => [
		"NEW",
		"ACCEPTED",
		"PREPARING",
		"READY"
	].includes(o.status));
	const completed = orders.filter((o) => o.status === "COMPLETED");
	const revenue = completed.reduce((n, o) => n + o.total, 0);
	const incoming = orders.filter((o) => o.status === "NEW" || o.status === "ACCEPTED");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MerchantShell, {
		title: `${greeting}, ${shop?.name ?? "Shop"} 👋`,
		subtitle: "Here's how your shop is doing today.",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/shop/menu",
			className: "inline-flex min-h-[44px] items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground",
			children: "Manage menu"
		}),
		children: !shop ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MerchantEmpty, {
			title: "No shop yet",
			description: "Create your shop to start receiving campus orders."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "flex flex-wrap items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Shop status"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-lg font-bold tracking-tight",
						children: shop.name
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: AVAILABILITY_OPTIONS.map((o) => {
							const active = shop.availability === o.value;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.button, {
								whileTap: { scale: .96 },
								onClick: () => {
									setAvailability(o.value);
									toast.success(`Shop set to ${o.label.toLowerCase()}`);
								},
								className: cn("min-h-[40px] rounded-full px-4 text-sm font-semibold transition-colors", active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"),
								children: o.label
							}, o.value);
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3 lg:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							label: "Today's orders",
							value: String(orders.length),
							index: 0
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							label: "Pending",
							value: String(pending.length),
							index: 1
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							label: "Completed",
							value: String(completed.length),
							index: 2
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							label: "Revenue",
							value: formatMoney(revenue),
							index: 3
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrinterStatusWidget, { shopId: shop.id }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
					title: "Incoming orders",
					description: "Accept and move orders through the counter flow."
				}), incoming.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MerchantEmpty, {
					title: "No orders yet.",
					description: "New orders will appear here instantly."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3 lg:grid-cols-2",
					children: incoming.map((order, i) => {
						const next = nextStatus(order.status);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
							initial: {
								opacity: 0,
								y: 10
							},
							animate: {
								opacity: 1,
								y: 0
							},
							transition: {
								duration: .22,
								delay: i * .04
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-sm font-bold",
										children: ["ORDER #", order.code]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground",
										children: [
											order.customerName,
											" · ",
											formatTime(order.placedAt)
										]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderStatusBadge, { status: order.status })]
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
										className: "rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-bold uppercase text-success",
										children: order.paid ? "Paid" : "Unpaid"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex gap-2",
									children: [next && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										className: "flex-1",
										onClick: () => setOrderStatus(order.id, next),
										children: ["Mark ", next.toLowerCase()]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										onClick: () => setOrderStatus(order.id, "CANCELLED"),
										children: "Cancel"
									})]
								})
							] })
						}, order.id);
					})
				})] })
			]
		})
	});
}
//#endregion
export { ShopDashboard as component };
