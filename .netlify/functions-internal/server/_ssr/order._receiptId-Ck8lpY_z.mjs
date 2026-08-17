import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as motion } from "../_libs/motion.mjs";
import { N as Check } from "../_libs/lucide-react.mjs";
import { t as EmptyState } from "./Primitives-DFV0Uw5E.mjs";
import { v as useStore } from "./router-BGLoriXd.mjs";
import { i as Route$14 } from "./router-BGLoriXd2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/order._receiptId-Ck8lpY_z.js
var import_jsx_runtime = require_jsx_runtime();
function OrderConfirmedPage() {
	const { receiptId } = Route$14.useParams();
	const navigate = useNavigate();
	const { receipts } = useStore();
	const receipt = receipts.find((r) => r.id === receiptId);
	if (!receipt) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		title: "Order not found",
		description: "We couldn't find this order on this device.",
		actionLabel: "Back to Home",
		onAction: () => navigate({ to: "/" })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 pb-10 pt-14 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
			initial: {
				scale: .6,
				opacity: 0
			},
			animate: {
				scale: 1,
				opacity: 1
			},
			transition: {
				type: "spring",
				stiffness: 420,
				damping: 22
			},
			className: "mx-auto grid h-16 w-16 place-items-center rounded-full bg-success text-success-foreground",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
				size: 30,
				strokeWidth: 3
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			initial: {
				opacity: 0,
				y: 10
			},
			animate: {
				opacity: 1,
				y: 0
			},
			transition: {
				duration: .25,
				delay: .1
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-5 text-2xl font-bold tracking-tight",
					children: "Order confirmed"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Your food is being prepared."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto mt-6 max-w-sm rounded-3xl bg-card p-5 text-left shadow-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium text-muted-foreground",
							children: "Receipt"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-2xl font-bold tracking-[0.12em]",
							children: receipt.code
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm font-semibold",
							children: receipt.shopName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 space-y-1.5 border-t border-dashed border-border pt-4 text-sm",
							children: receipt.lines.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted-foreground",
									children: [
										l.name,
										" × ",
										l.qty
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-medium",
									children: ["₹", l.price * l.qty]
								})]
							}, l.name))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex items-center justify-between border-t border-dashed border-border pt-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-base font-bold",
								children: ["₹", receipt.total]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-bold uppercase tracking-wide text-success",
								children: "Paid ✓"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-xs text-muted-foreground",
							children: "Estimated preparation · 10–15 min"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto mt-6 max-w-sm space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/receipts/$receiptId",
						params: { receiptId: receipt.id },
						className: "flex min-h-[52px] items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground",
						children: "View Receipt"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "flex min-h-[52px] items-center justify-center rounded-2xl bg-secondary text-sm font-semibold text-secondary-foreground",
						children: "Back to Home"
					})]
				})
			]
		})]
	});
}
//#endregion
export { OrderConfirmedPage as component };
