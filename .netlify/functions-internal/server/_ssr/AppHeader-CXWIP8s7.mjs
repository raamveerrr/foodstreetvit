import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as motion } from "../_libs/motion.mjs";
import { d as cn } from "./router-BGLoriXd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AppHeader-CXWIP8s7.js
var import_jsx_runtime = require_jsx_runtime();
function Avatar({ initials, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("grid place-items-center rounded-full bg-primary-soft text-sm font-bold text-accent-foreground", className),
		children: initials
	});
}
function AppHeader({ greeting, subtitle, initials, signedIn = true }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "flex items-start justify-between gap-4 px-5 pt-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: greeting
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-0.5 text-[22px] font-bold leading-tight tracking-tight",
				children: subtitle
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
			whileTap: { scale: .92 },
			children: signedIn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/profile",
				"aria-label": "Open profile",
				className: "grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border bg-surface shadow-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
					initials,
					className: "h-9 w-9"
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/login",
				className: "mt-1 flex h-9 shrink-0 items-center whitespace-nowrap rounded-full bg-primary px-5 text-[13.5px] font-bold text-primary-foreground shadow-sm transition-all active:scale-95",
				children: "Sign In"
			})
		})]
	});
}
function PageHeader({ title, subtitle, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "flex items-start justify-between gap-4 px-5 pb-1 pt-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-bold tracking-tight",
				children: title
			}), subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: subtitle
			})]
		}), action]
	});
}
//#endregion
export { Avatar as n, PageHeader as r, AppHeader as t };
