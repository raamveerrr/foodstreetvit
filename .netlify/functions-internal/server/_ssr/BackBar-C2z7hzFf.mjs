import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { b as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { M as ChevronLeft } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/BackBar-C2z7hzFf.js
var import_jsx_runtime = require_jsx_runtime();
function BackBar({ title, fallback = "/" }) {
	const router = useRouter();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3 px-5 pt-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			onClick: () => {
				if (window.history.length > 2) router.history.back();
				else router.navigate({
					to: fallback,
					replace: true
				});
			},
			"aria-label": "Go back",
			className: "grid h-10 w-10 place-items-center rounded-full border border-border bg-surface hover:bg-secondary transition-colors",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { size: 20 })
		}), title && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-xl font-bold tracking-tight",
			children: title
		})]
	});
}
//#endregion
export { BackBar as t };
