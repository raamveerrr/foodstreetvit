import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { f as TextInput, i as Field, t as Button } from "./MerchantUI-IaaBvX-G.mjs";
import { S as useAuth } from "./router-BGLoriXd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shop-login-a8dIBvPz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ShopLoginPage() {
	const navigate = useNavigate();
	const { signIn } = useAuth();
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const submit = async (e) => {
		e.preventDefault();
		setError(null);
		if (!email.trim() || !password.trim()) {
			setError("Enter your email and password to continue.");
			return;
		}
		setBusy(true);
		try {
			const profile = await signIn(email, password);
			if (profile && profile.role === "STUDENT") {
				setError("This account is registered as a student.");
				return;
			}
			toast.success("Signed in");
			navigate({
				to: "/shop",
				replace: true
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "We couldn't sign you in.");
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-5 py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			initial: {
				opacity: 0,
				y: 12
			},
			animate: {
				opacity: 1,
				y: 0
			},
			transition: { duration: .25 },
			className: "w-full max-w-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-7 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-bold uppercase tracking-[0.18em] text-primary",
						children: "DigitalFoodStreet"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 text-2xl font-bold tracking-tight",
						children: "Shop Owner Login"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1.5 text-sm text-muted-foreground",
						children: "Manage your shop, menu and incoming orders."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (e) => void submit(e),
				className: "space-y-4 rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Email",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							type: "email",
							value: email,
							autoComplete: "email",
							onChange: (e) => setEmail(e.target.value),
							placeholder: "owner@shop.com"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Password",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							type: "password",
							value: password,
							autoComplete: "current-password",
							onChange: (e) => setPassword(e.target.value),
							placeholder: "••••••••"
						})
					}),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "alert",
						className: "text-sm font-medium text-destructive",
						children: error
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "w-full",
						disabled: busy,
						children: busy ? "Signing in…" : "Sign In"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => navigate({ to: "/forgot-password" }),
						className: "w-full text-center text-sm font-medium text-muted-foreground hover:text-foreground",
						children: "Forgot password?"
					})
				]
			})]
		})
	});
}
//#endregion
export { ShopLoginPage as component };
