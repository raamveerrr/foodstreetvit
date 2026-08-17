import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { i as AnimatePresence } from "../_libs/framer-motion+[...].mjs";
import { t as motion } from "../_libs/motion.mjs";
import { t as X } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/BottomSheet-CYaUI7P7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function BottomSheet({ open, onClose, title, children }) {
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const onKey = (e) => e.key === "Escape" && onClose();
		window.addEventListener("keydown", onKey);
		document.body.style.overflow = "hidden";
		return () => {
			window.removeEventListener("keydown", onKey);
			document.body.style.overflow = "";
		};
	}, [open, onClose]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
			initial: { opacity: 0 },
			animate: { opacity: 1 },
			exit: { opacity: 0 },
			transition: { duration: .18 },
			onClick: onClose,
			className: "absolute inset-0 bg-foreground/40"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			role: "dialog",
			"aria-modal": "true",
			"aria-label": title,
			initial: { y: "100%" },
			animate: { y: 0 },
			exit: { y: "100%" },
			transition: {
				type: "spring",
				stiffness: 420,
				damping: 38
			},
			drag: "y",
			dragConstraints: {
				top: 0,
				bottom: 0
			},
			dragElastic: {
				top: 0,
				bottom: .4
			},
			onDragEnd: (_, info) => {
				if (info.offset.y > 110 || info.velocity.y > 700) onClose();
			},
			className: "app-shell absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-3xl bg-surface pb-6 shadow-card",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "sticky top-0 z-10 flex items-center justify-between rounded-t-3xl bg-surface px-5 pb-2 pt-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-border" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "pt-3 text-base font-semibold",
						children: title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						"aria-label": "Close",
						className: "mt-3 grid h-9 w-9 place-items-center rounded-full bg-secondary text-secondary-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 18 })
					})
				]
			}), children]
		})]
	}) });
}
function ConfirmSheet({ open, title, description, confirmLabel = "Remove", onConfirm, onClose }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BottomSheet, {
		open,
		onClose,
		title,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-5 pt-1",
			children: [description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: description
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onClose,
					className: "min-h-[48px] rounded-2xl bg-secondary text-sm font-semibold text-secondary-foreground",
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => {
						onConfirm();
						onClose();
					},
					className: "min-h-[48px] rounded-2xl bg-destructive text-sm font-semibold text-destructive-foreground",
					children: confirmLabel
				})]
			})]
		})
	});
}
//#endregion
export { ConfirmSheet as n, BottomSheet as t };
