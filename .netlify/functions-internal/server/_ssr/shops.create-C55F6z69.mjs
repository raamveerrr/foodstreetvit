import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { N as Check } from "../_libs/lucide-react.mjs";
import { d as TextArea, f as TextInput, i as Field, l as Select, t as Button } from "./MerchantUI-IaaBvX-G.mjs";
import { S as useAuth, a as SHOP_CATEGORIES, o as TIME_OPTIONS, s as defaultHours, w as createShopOwnerAndShop } from "./router-BGLoriXd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shops.create-C55F6z69.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminCreateShopPage() {
	const navigate = useNavigate();
	const { profile, ready } = useAuth();
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "p-6",
		children: "Loading..."
	});
	if (!profile) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Please sign in as an administrator." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			onClick: () => navigate({ to: "/login" }),
			children: "Sign in"
		})]
	});
	if (profile.role !== "SUPER_ADMIN") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "p-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Access denied. Only administrators may provision shops." })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCreateShopContent, {});
}
function AdminCreateShopContent() {
	const navigate = useNavigate();
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [ownerName, setOwnerName] = (0, import_react.useState)("");
	const [ownerEmail, setOwnerEmail] = (0, import_react.useState)("");
	const [ownerPhone, setOwnerPhone] = (0, import_react.useState)("");
	const [temporaryPassword, setTemporaryPassword] = (0, import_react.useState)("");
	const [name, setName] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)(SHOP_CATEGORIES[0] ?? "");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [campus, setCampus] = (0, import_react.useState)("Campus Food Court");
	const [prepTime, setPrepTime] = (0, import_react.useState)("10–15 minutes");
	const [hours] = (0, import_react.useState)(defaultHours());
	const [success, setSuccess] = (0, import_react.useState)(null);
	if (success) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-8 w-8 text-green-600" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-bold tracking-tight",
						children: "Shop created successfully"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1.5 text-sm text-muted-foreground",
						children: "The shop and owner account are ready."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4 rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium uppercase tracking-wider text-muted-foreground",
						children: "Shop"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-lg font-semibold",
						children: success.shopName
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border-t border-border pt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium uppercase tracking-wider text-muted-foreground",
							children: "Owner"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-lg font-semibold",
							children: success.ownerName
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border-t border-border pt-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium uppercase tracking-wider text-muted-foreground",
								children: "Login email"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 font-mono text-sm",
								children: success.ownerEmail
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => {
									navigator.clipboard.writeText(success.ownerEmail);
									toast.success("Email copied to clipboard");
								},
								className: "mt-2 text-xs font-medium text-primary hover:underline",
								children: "Copy Email"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border-t border-border pt-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium uppercase tracking-wider text-muted-foreground",
								children: "Temporary password"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 font-mono text-sm",
								children: "••••••••"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => {
									navigator.clipboard.writeText(success.temporaryPassword);
									toast.success("Password copied to clipboard");
								},
								className: "mt-2 text-xs font-medium text-primary hover:underline",
								children: "Copy Password"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-xl bg-blue-50 p-3 text-sm text-blue-900",
						children: "Share the login email and temporary password with the shop owner. They will be asked to set a new password on first login."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "w-full",
						onClick: () => navigate({
							to: "/admin/shops",
							replace: true
						}),
						children: "Done"
					})
				]
			})]
		})
	});
	const submit = async () => {
		if (busy) return;
		if (!ownerName || !ownerEmail || !temporaryPassword || !name) {
			toast.error("Please complete required fields.");
			return;
		}
		setBusy(true);
		try {
			const result = await createShopOwnerAndShop({
				ownerName,
				ownerEmail,
				ownerPhone,
				temporaryPassword,
				shop: {
					name,
					description,
					category,
					phone,
					email,
					campus,
					prepTime,
					hours,
					status: "CLOSED"
				}
			});
			setSuccess({
				shopName: result.shopName ?? name,
				ownerName: result.ownerName ?? ownerName,
				ownerEmail: result.ownerEmail ?? ownerEmail,
				temporaryPassword: result.temporaryPassword ?? temporaryPassword
			});
		} catch (err) {
			toast.error(err?.message || "Failed to create shop and owner.");
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-2xl px-4 pb-16 pt-6 sm:px-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-5 flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] font-bold uppercase tracking-[0.16em] text-primary",
				children: "DigitalFoodStreet"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-1 text-2xl font-bold tracking-tight",
				children: "Provision shop & owner"
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/admin/shops",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					children: "Back"
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border bg-surface p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold",
						children: "Owner information"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Owner name",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									value: ownerName,
									onChange: (e) => setOwnerName(e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Owner email",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									value: ownerEmail,
									onChange: (e) => setOwnerEmail(e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Owner phone",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									value: ownerPhone,
									onChange: (e) => setOwnerPhone(e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Temporary password",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									value: temporaryPassword,
									onChange: (e) => setTemporaryPassword(e.target.value)
								})
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border bg-surface p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold",
						children: "Shop information"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Shop name",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									value: name,
									onChange: (e) => setName(e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Description",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
									value: description,
									onChange: (e) => setDescription(e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Category",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
									value: category,
									onChange: (e) => setCategory(e.target.value),
									children: SHOP_CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: c }, c))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3 sm:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Contact number",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
										value: phone,
										onChange: (e) => setPhone(e.target.value)
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Contact email",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
										value: email,
										onChange: (e) => setEmail(e.target.value)
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Campus / location",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									value: campus,
									onChange: (e) => setCampus(e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Preparation time",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
									value: prepTime,
									onChange: (e) => setPrepTime(e.target.value),
									children: TIME_OPTIONS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: t }, t))
								})
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => navigate({ to: "/admin/shops" }),
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => void submit(),
						disabled: busy,
						children: busy ? "Creating…" : "Create Shop & Owner"
					})]
				})
			]
		})]
	});
}
//#endregion
export { AdminCreateShopPage as component };
