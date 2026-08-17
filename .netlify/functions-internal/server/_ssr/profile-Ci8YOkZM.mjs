import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { O as CircleQuestionMark, f as Settings, g as ReceiptText, j as ChevronRight, s as User, x as LogOut } from "../_libs/lucide-react.mjs";
import { n as ConfirmSheet } from "./BottomSheet-CYaUI7P7.mjs";
import { n as Avatar } from "./AppHeader-CXWIP8s7.mjs";
import { t as BackBar } from "./BackBar-C2z7hzFf.mjs";
import { v as useStore } from "./router-BGLoriXd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile-Ci8YOkZM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ROWS = [
	{
		label: "My account",
		icon: User
	},
	{
		label: "Settings",
		icon: Settings
	},
	{
		label: "Help & support",
		icon: CircleQuestionMark
	}
];
function ProfilePage() {
	const { user, receipts, logout, signedIn } = useStore();
	const [confirmLogout, setConfirmLogout] = (0, import_react.useState)(false);
	if (!signedIn) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-screen flex-col items-center justify-center p-5 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-xl font-bold",
				children: "Please sign in"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted-foreground",
				children: "You need to sign in to view your profile."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/login",
				className: "mt-6 flex h-11 w-full max-w-[200px] items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground",
				children: "Sign in"
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pb-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BackBar, { title: "Account" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex items-center gap-4 px-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
					initials: user.initials,
					className: "h-16 w-16 text-xl"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-lg font-bold tracking-tight",
						children: user.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-sm text-muted-foreground",
						children: user.email
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 space-y-2 px-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/receipts",
						className: "flex min-h-[56px] items-center gap-3 rounded-2xl bg-card px-4 shadow-card",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReceiptText, {
								size: 18,
								className: "text-muted-foreground"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex-1 text-sm font-medium",
								children: "Past orders"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: receipts.length
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
								size: 18,
								className: "text-muted-foreground"
							})
						]
					}),
					ROWS.map(({ label, icon: Icon }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: "flex min-h-[56px] w-full items-center gap-3 rounded-2xl bg-card px-4 text-left shadow-card",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								size: 18,
								className: "text-muted-foreground"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex-1 text-sm font-medium",
								children: label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
								size: 18,
								className: "text-muted-foreground"
							})
						]
					}, label)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setConfirmLogout(true),
						className: "flex min-h-[56px] w-full items-center gap-3 rounded-2xl bg-card px-4 text-left text-destructive shadow-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { size: 18 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex-1 text-sm font-medium",
							children: "Logout"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmSheet, {
				open: confirmLogout,
				title: "Log out of DigitalFoodStreet?",
				description: "You can sign back in anytime. Your receipts stay with your account.",
				confirmLabel: "Log out",
				onConfirm: logout,
				onClose: () => setConfirmLogout(false)
			})
		]
	});
}
//#endregion
export { ProfilePage as component };
