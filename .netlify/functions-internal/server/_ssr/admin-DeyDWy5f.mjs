import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { p as Outlet, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { S as useAuth } from "./router-BGLoriXd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-DeyDWy5f.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminShell() {
	const navigate = useNavigate();
	const { profile, ready } = useAuth();
	(0, import_react.useLayoutEffect)(() => {
		if (!ready) return;
		if (!profile) {
			navigate({
				to: "/login",
				replace: true
			});
			return;
		}
		if (profile.role !== "SUPER_ADMIN") {
			navigate({
				to: "/",
				replace: true
			});
			return;
		}
		if (window.location.pathname === "/admin" || window.location.pathname === "/admin/") navigate({
			to: "/admin/shops",
			replace: true
		});
	}, [
		profile,
		ready,
		navigate
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {});
}
//#endregion
export { AdminShell as component };
