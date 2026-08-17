import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { d as cn } from "./router-BGLoriXd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Primitives-DFV0Uw5E.js
var import_jsx_runtime = require_jsx_runtime();
function StatusBadge({ tone = "neutral", children, dot = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide", {
			open: "bg-success-soft text-success",
			success: "bg-success-soft text-success",
			closed: "bg-secondary text-muted-foreground",
			neutral: "bg-secondary text-secondary-foreground",
			warning: "bg-primary-soft text-accent-foreground"
		}[tone]),
		children: [dot && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-current" }), children]
	});
}
function EmptyState({ title, description, actionLabel, onAction, icon }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center px-8 py-16 text-center",
		children: [
			icon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-primary-soft text-accent-foreground",
				children: icon
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-lg font-semibold",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1.5 max-w-[16rem] text-sm text-muted-foreground",
				children: description
			}),
			actionLabel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: onAction,
				className: "mt-6 min-h-[48px] rounded-2xl bg-primary px-6 text-sm font-semibold text-primary-foreground",
				children: actionLabel
			})
		]
	});
}
//#endregion
export { StatusBadge as n, EmptyState as t };
