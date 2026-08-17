import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { f as TextInput, i as Field, t as Button } from "./MerchantUI-IaaBvX-G.mjs";
import { S as useAuth } from "./router-BGLoriXd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/signup-C1aCXLSU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SignupPage() {
	const navigate = useNavigate();
	const { signUp } = useAuth();
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const submit = async (e) => {
		e.preventDefault();
		if (busy) return;
		setError(null);
		if (!name.trim()) return setError("Please tell us your name.");
		if (!email.trim()) return setError("Email is required.");
		if (password.length < 6) return setError("Choose a password with at least 6 characters.");
		setBusy(true);
		try {
			await signUp({
				name,
				email,
				password,
				phone
			});
			toast.success("Account created");
			navigate({
				to: "/",
				replace: true
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "We couldn't create your account.");
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
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-7 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] font-bold uppercase tracking-[0.18em] text-primary",
							children: "DigitalFoodStreet"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 text-2xl font-bold tracking-tight",
							children: "Create your account"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1.5 text-sm text-muted-foreground",
							children: "One account for ordering or running your shop."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: (e) => void submit(e),
					className: "space-y-4 rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-2xl bg-secondary/60 p-3 text-sm text-muted-foreground",
							children: "Signing up creates a Student account. Shop owners must be provisioned by an administrator."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Full name",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								value: name,
								autoComplete: "name",
								onChange: (e) => setName(e.target.value),
								placeholder: "Ramveer Singh"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Email",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								type: "email",
								value: email,
								autoComplete: "email",
								onChange: (e) => setEmail(e.target.value),
								placeholder: "you@campus.edu"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Phone (optional)",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								value: phone,
								autoComplete: "tel",
								onChange: (e) => setPhone(e.target.value),
								placeholder: "+91 98765 43210"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Password",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								type: "password",
								value: password,
								autoComplete: "new-password",
								onChange: (e) => setPassword(e.target.value),
								placeholder: "At least 6 characters"
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
							children: busy ? "Creating account…" : "Create account"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Already have an account?"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/login",
						className: "mt-2 inline-flex min-h-[46px] items-center justify-center rounded-xl border border-border bg-surface px-5 text-sm font-semibold",
						children: "Sign in"
					})]
				})
			]
		})
	});
}
//#endregion
export { SignupPage as component };
