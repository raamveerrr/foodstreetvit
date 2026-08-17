import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as motion } from "../_libs/motion.mjs";
import { g as ReceiptText, j as ChevronRight } from "../_libs/lucide-react.mjs";
import { r as PageHeader } from "./AppHeader-CXWIP8s7.mjs";
import { n as StatusBadge, t as EmptyState } from "./Primitives-DFV0Uw5E.mjs";
import { v as useStore } from "./router-BGLoriXd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/receipts.index-cZH-MSyK.js
var import_jsx_runtime = require_jsx_runtime();
var STATUS_LABEL = {
	preparing: "Preparing",
	ready: "Ready",
	picked_up: "Picked up"
};
function ReceiptCard({ receipt, index = 0 }) {
	const collected = receipt.status === "picked_up";
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
			delay: index * .04
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/receipts/$receiptId",
			params: { receiptId: receipt.id },
			className: "flex items-center gap-3 rounded-2xl bg-card p-4 shadow-card active:scale-[0.99] transition-transform",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-sm font-bold tracking-widest",
						children: receipt.code
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
						tone: collected ? "closed" : "warning",
						children: STATUS_LABEL[receipt.status]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 truncate text-sm text-muted-foreground",
					children: [
						receipt.shopName,
						" · ",
						receipt.lines.reduce((n, l) => n + l.qty, 0),
						" items · ₹",
						receipt.total
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
				size: 18,
				className: "text-muted-foreground"
			})]
		})
	});
}
function ReceiptsPage() {
	const { receipts } = useStore();
	const active = receipts.filter((r) => r.status !== "picked_up");
	const past = receipts.filter((r) => r.status === "picked_up");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pb-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Receipts",
			subtitle: "Show a receipt at the counter to collect."
		}), receipts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReceiptText, { size: 26 }),
			title: "No receipts yet",
			description: "Every order you place creates one digital pickup receipt."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 space-y-6",
			children: [active.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "px-5 pb-2 text-sm font-semibold text-muted-foreground",
				children: "Active"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3 px-5",
				children: active.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReceiptCard, {
					receipt: r,
					index: i
				}, r.id))
			})] }), past.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "px-5 pb-2 text-sm font-semibold text-muted-foreground",
				children: "Past"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3 px-5",
				children: past.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReceiptCard, {
					receipt: r,
					index: i
				}, r.id))
			})] })]
		})]
	});
}
//#endregion
export { ReceiptsPage as component };
