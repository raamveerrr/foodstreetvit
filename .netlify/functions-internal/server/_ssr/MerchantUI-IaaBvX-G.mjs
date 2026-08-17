import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { i as AnimatePresence } from "../_libs/framer-motion+[...].mjs";
import { t as motion } from "../_libs/motion.mjs";
import { t as X } from "../_libs/lucide-react.mjs";
import { d as cn } from "./router-BGLoriXd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/MerchantUI-IaaBvX-G.js
var import_jsx_runtime = require_jsx_runtime();
function Field({ label, hint, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium text-foreground",
				children: label
			}),
			children,
			hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-1 block text-xs text-muted-foreground",
				children: hint
			})
		]
	});
}
var controlClass = "mt-1.5 w-full rounded-xl border border-input bg-surface px-3.5 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring";
function TextInput(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		...props,
		className: cn(controlClass, props.className)
	});
}
function TextArea(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		rows: 3,
		...props,
		className: cn(controlClass, "resize-none", props.className)
	});
}
function Select(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
		...props,
		className: cn(controlClass, "appearance-none", props.className)
	});
}
function Button({ variant = "primary", className, ...props }) {
	const variants = {
		primary: "bg-primary text-primary-foreground hover:opacity-95",
		outline: "border border-border bg-surface text-foreground hover:bg-secondary",
		ghost: "text-muted-foreground hover:bg-secondary",
		danger: "bg-destructive text-destructive-foreground hover:opacity-95"
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		...props,
		className: cn("inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50", variants[variant], className)
	});
}
function Card({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		...props,
		className: cn("rounded-2xl border border-border bg-surface p-4 shadow-card", className)
	});
}
function SectionHeading({ title, description }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-base font-semibold tracking-tight",
			children: title
		}), description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-0.5 text-sm text-muted-foreground",
			children: description
		})]
	});
}
var ORDER_TONES = {
	NEW: "bg-primary-soft text-accent-foreground",
	ACCEPTED: "bg-secondary text-secondary-foreground",
	PREPARING: "bg-secondary text-secondary-foreground",
	READY: "bg-success-soft text-success",
	COMPLETED: "bg-success-soft text-success",
	CANCELLED: "bg-secondary text-muted-foreground"
};
function OrderStatusBadge({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
		initial: {
			opacity: 0,
			y: -4
		},
		animate: {
			opacity: 1,
			y: 0
		},
		transition: { duration: .18 },
		className: cn("inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide", ORDER_TONES[status]),
		children: status
	}, status);
}
function StatCard({ label, value, sub, index = 0 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
		initial: {
			opacity: 0,
			y: 10
		},
		animate: {
			opacity: 1,
			y: 0
		},
		transition: {
			duration: .24,
			delay: index * .04
		},
		className: "rounded-2xl border border-border bg-surface p-4 shadow-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-2xl font-bold tracking-tight",
				children: value
			}),
			sub && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: sub
			})
		]
	});
}
function MerchantEmpty({ title, description, actionLabel, onAction }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-dashed border-border bg-surface/60 px-6 py-14 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-base font-semibold",
				children: title
			}),
			description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground",
				children: description
			}),
			actionLabel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-5",
				onClick: onAction,
				children: actionLabel
			})
		]
	});
}
function Modal({ open, onClose, title, children, footer }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 flex items-end justify-center sm:items-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
			initial: { opacity: 0 },
			animate: { opacity: 1 },
			exit: { opacity: 0 },
			transition: { duration: .18 },
			onClick: onClose,
			className: "absolute inset-0 bg-foreground/40 backdrop-blur-[2px]"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			role: "dialog",
			"aria-modal": "true",
			"aria-label": title,
			initial: {
				y: 40,
				opacity: 0,
				scale: .98
			},
			animate: {
				y: 0,
				opacity: 1,
				scale: 1
			},
			exit: {
				y: 24,
				opacity: 0
			},
			transition: {
				type: "spring",
				stiffness: 460,
				damping: 36
			},
			className: "relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-border bg-surface sm:max-w-lg sm:rounded-3xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between border-b border-border px-5 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-base font-semibold",
						children: title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						"aria-label": "Close",
						className: "grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 18 })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-h-0 flex-1 overflow-y-auto px-5 py-4",
					children
				}),
				footer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-t border-border px-5 py-3",
					children: footer
				})
			]
		})]
	}) });
}
function ConfirmDialog({ open, title, description, confirmLabel = "Delete", busy, onCancel, onConfirm }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
		open,
		onClose: onCancel,
		title,
		footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				className: "flex-1",
				onClick: onCancel,
				children: "Cancel"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "danger",
				className: "flex-1",
				disabled: busy,
				onClick: onConfirm,
				children: busy ? "Deleting…" : confirmLabel
			})]
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: description
		})
	});
}
//#endregion
export { MerchantEmpty as a, SectionHeading as c, TextArea as d, TextInput as f, Field as i, Select as l, Card as n, Modal as o, ConfirmDialog as r, OrderStatusBadge as s, Button as t, StatCard as u };
