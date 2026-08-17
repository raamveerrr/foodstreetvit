import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { f as TextInput, i as Field, t as Button } from "./MerchantUI-IaaBvX-G.mjs";
import { S as useAuth } from "./router-BGLoriXd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shop.change-password-Nuhon3WM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ChangePasswordPage() {
	const navigate = useNavigate();
	const { profile, changePassword } = useAuth();
	const [newPassword, setNewPassword] = (0, import_react.useState)("");
	const [confirmPassword, setConfirmPassword] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	if (!profile || !profile.mustChangePassword) {
		navigate({
			to: "/shop",
			replace: true
		});
		return null;
	}
	if (profile.role !== "SHOP_OWNER") {
		navigate({
			to: "/",
			replace: true
		});
		return null;
	}
	const submit = async (e) => {
		e.preventDefault();
		setError(null);
		if (newPassword.length < 6) {
			setError("Password must be at least 6 characters long.");
			return;
		}
		if (newPassword !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}
		setBusy(true);
		try {
			await changePassword(newPassword);
			toast.success("Password updated successfully");
			navigate({
				to: "/shop",
				replace: true
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unable to change your password.");
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
						children: "Secure your account"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1.5 text-sm text-muted-foreground",
						children: "Please create a new password before you can continue."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (e) => void submit(e),
				className: "space-y-4 rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-2xl bg-blue-50 p-3 text-sm text-blue-900",
						children: "Your account was created with a temporary password. Please set a secure password now."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "New password",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							type: "password",
							value: newPassword,
							autoComplete: "new-password",
							onChange: (e) => setNewPassword(e.target.value),
							placeholder: "At least 6 characters"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Confirm password",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							type: "password",
							value: confirmPassword,
							autoComplete: "new-password",
							onChange: (e) => setConfirmPassword(e.target.value),
							placeholder: "Confirm your password"
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
						children: busy ? "Updating…" : "Update Password"
					})
				]
			})]
		})
	});
}
//#endregion
export { ChangePasswordPage as component };
