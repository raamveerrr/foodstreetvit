import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useMotionValue, t as useTransform } from "../_libs/framer-motion+[...].mjs";
import { t as motion } from "../_libs/motion.mjs";
import { A as ChevronsRight, N as Check, k as CircleCheck } from "../_libs/lucide-react.mjs";
import { n as StatusBadge, t as EmptyState } from "./Primitives-DFV0Uw5E.mjs";
import { t as BackBar } from "./BackBar-C2z7hzFf.mjs";
import { v as useStore } from "./router-BGLoriXd.mjs";
import { r as Route$12 } from "./router-BGLoriXd2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/receipts._receiptId-jLUGOdQI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Counter-staff gesture: the worker swipes the student's phone to confirm
* pickup. Local UI state today; a redeem mutation later.
*/
function SwipeToConfirm({ onConfirm }) {
	const trackRef = (0, import_react.useRef)(null);
	const x = useMotionValue(0);
	const [done, setDone] = (0, import_react.useState)(false);
	const [max, setMax] = (0, import_react.useState)(220);
	const opacity = useTransform(x, [0, max * .7], [1, 0]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: (el) => {
			trackRef.current = el;
			if (el) setMax(el.clientWidth - 60);
		},
		className: "relative h-[60px] w-full select-none overflow-hidden rounded-2xl bg-primary-soft",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
			style: { opacity },
			className: "pointer-events-none absolute inset-0 grid place-items-center text-sm font-semibold text-accent-foreground",
			children: "Slide to confirm pickup"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.button, {
			drag: done ? false : "x",
			dragConstraints: {
				left: 0,
				right: max
			},
			dragElastic: .02,
			dragMomentum: false,
			style: { x },
			onDragEnd: () => {
				if (x.get() > max * .85) {
					setDone(true);
					x.set(max);
					onConfirm();
				} else x.set(0);
			},
			"aria-label": "Slide to confirm pickup",
			className: "absolute left-1 top-1 grid h-[52px] w-[52px] cursor-grab place-items-center rounded-xl bg-primary text-primary-foreground active:cursor-grabbing",
			children: done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 20 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsRight, { size: 20 })
		})]
	});
}
var formatTime = (iso) => new Date(iso).toLocaleTimeString([], {
	hour: "numeric",
	minute: "2-digit"
});
function ReceiptView({ receipt, onConfirmPickup }) {
	const collected = receipt.status === "picked_up";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.section, {
		initial: {
			opacity: 0,
			y: 14
		},
		animate: {
			opacity: 1,
			y: 0
		},
		transition: { duration: .25 },
		className: "mx-5 overflow-hidden rounded-3xl bg-card shadow-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b border-dashed border-border px-5 py-5 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground",
						children: "DigitalFoodStreet"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs font-medium text-muted-foreground",
						children: "Receipt"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-3xl font-bold tracking-[0.12em]",
						children: receipt.code
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm font-semibold",
						children: receipt.shopName
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2.5 px-5 py-5",
				children: receipt.lines.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-baseline justify-between text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-muted-foreground",
						children: [
							line.name,
							" × ",
							line.qty
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-medium",
						children: ["₹", line.price * line.qty]
					})]
				}, line.name))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 border-t border-dashed border-border px-5 py-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm text-muted-foreground",
							children: "Total"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-lg font-bold",
							children: ["₹", receipt.total]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm text-muted-foreground",
							children: "Payment"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
							tone: "success",
							children: "Paid ✓"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm text-muted-foreground",
							children: "Status"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
							tone: collected ? "closed" : "warning",
							children: collected ? "Picked up" : "Preparing"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm text-muted-foreground",
							children: "Pickup"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm font-medium",
							children: receipt.counter
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-t border-border bg-secondary/50 px-5 py-5",
				children: collected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
							size: 26,
							className: "mx-auto text-success"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm font-bold uppercase tracking-wide text-success",
							children: "Picked up"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 font-mono text-sm font-semibold",
							children: receipt.code
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: ["Order collected", receipt.pickedUpAt ? ` · ${formatTime(receipt.pickedUpAt)}` : ""]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-muted-foreground",
							children: "This receipt has already been used."
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-center text-xs text-muted-foreground",
					children: "Show this receipt at the counter. Counter staff will confirm pickup."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwipeToConfirm, { onConfirm: onConfirmPickup })] })
			})
		]
	});
}
function ReceiptDetailPage() {
	const { receiptId } = Route$12.useParams();
	const { receipts, confirmPickup } = useStore();
	const receipt = receipts.find((r) => r.id === receiptId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pb-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BackBar, { title: "Receipt" }), receipt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-5",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReceiptView, {
				receipt,
				onConfirmPickup: () => {
					confirmPickup(receipt.id);
					toast.success(`Pickup confirmed · ${receipt.code}`);
				}
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "Receipt not found",
			description: "This receipt is no longer available on this device."
		})]
	});
}
//#endregion
export { ReceiptDetailPage as component };
