import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { p as Search } from "../_libs/lucide-react.mjs";
import { d as cn } from "./router-BGLoriXd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/CategorySelector-CH2xhnjS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CategorySelector({ categories, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "no-scrollbar flex gap-2 overflow-x-auto px-5 py-1",
		children: categories.map((c) => {
			const active = c === value;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
				whileTap: { scale: .94 },
				onClick: () => onChange(c),
				"aria-pressed": active,
				className: cn("relative min-h-[40px] shrink-0 rounded-full px-4 text-sm font-medium transition-colors", active ? "text-primary-foreground" : "bg-secondary text-secondary-foreground"),
				children: [active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
					layoutId: "category-pill",
					transition: {
						type: "spring",
						stiffness: 500,
						damping: 36
					},
					className: "absolute inset-0 rounded-full bg-primary"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "relative",
					children: c
				})]
			}, c);
		})
	});
}
function SearchBar({ value, onChange, placeholder = "Search food or shops" }) {
	const [focused, setFocused] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
		animate: { scale: focused ? 1.01 : 1 },
		transition: { duration: .18 },
		className: cn("mx-5 flex min-h-[48px] items-center gap-2.5 rounded-2xl border bg-surface px-4 transition-colors", focused ? "border-primary" : "border-border"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
			size: 18,
			className: focused ? "text-primary" : "text-muted-foreground"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			value,
			onChange: (e) => onChange(e.target.value),
			onFocus: () => setFocused(true),
			onBlur: () => setFocused(false),
			placeholder,
			"aria-label": placeholder,
			className: "w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
		})]
	});
}
function SectionTitle({ title, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between px-5 pb-3 pt-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-lg font-semibold tracking-tight",
			children: title
		}), action]
	});
}
//#endregion
export { SearchBar as n, SectionTitle as r, CategorySelector as t };
