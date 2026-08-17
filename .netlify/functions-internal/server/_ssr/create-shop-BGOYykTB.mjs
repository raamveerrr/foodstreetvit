import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as AnimatePresence } from "../_libs/framer-motion+[...].mjs";
import { t as motion } from "../_libs/motion.mjs";
import { C as ImagePlus, N as Check } from "../_libs/lucide-react.mjs";
import { d as TextArea, f as TextInput, i as Field, l as Select, n as Card, t as Button } from "./MerchantUI-IaaBvX-G.mjs";
import { S as useAuth, a as SHOP_CATEGORIES, b as uploadImage, d as cn, i as DAYS, o as TIME_OPTIONS, r as useMerchant, s as defaultHours } from "./router-BGLoriXd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/create-shop-BGOYykTB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STEPS = [
	"Basic Details",
	"Branding",
	"Business Details",
	"Opening Hours",
	"Review"
];
var emptyDraft = () => ({
	name: "",
	description: "",
	category: SHOP_CATEGORIES[0],
	phone: "",
	email: "",
	campus: "Campus Food Court",
	logo: null,
	cover: null,
	cuisine: SHOP_CATEGORIES[0],
	prepTime: "10–15 minutes",
	hours: defaultHours(),
	availability: "open"
});
function Progress({ step }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between text-xs font-medium text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
				"Step ",
				step + 1,
				" of ",
				STEPS.length
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-semibold text-foreground",
				children: STEPS[step]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2 flex gap-1.5",
			children: STEPS.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-1.5 flex-1 overflow-hidden rounded-full bg-secondary",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
					initial: false,
					animate: { width: i <= step ? "100%" : "0%" },
					transition: { duration: .25 },
					className: "h-full rounded-full bg-primary"
				})
			}, s))
		})]
	});
}
function MockUpload({ label, value, aspect, onPick }) {
	const [uploading, setUploading] = (0, import_react.useState)(false);
	const onFile = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setUploading(true);
		try {
			onPick((await uploadImage(file, `digitalfoodstreet/shops/pending/${Date.now()}`)).url);
			toast.success(`${label} uploaded`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "We couldn't upload that image.");
		} finally {
			setUploading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-medium",
			children: label
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("mt-2 grid place-items-center overflow-hidden rounded-2xl border border-dashed border-border bg-secondary/40", aspect),
			children: value ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: value,
				alt: `${label} preview`,
				className: "h-full w-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center gap-1 py-6 text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { size: 22 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs",
					children: "No image yet"
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-2 flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "inline-flex min-h-[42px] cursor-pointer items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold",
				children: [uploading ? "Uploading…" : "Upload", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "file",
					accept: "image/*",
					className: "hidden",
					disabled: uploading,
					onChange: (e) => void onFile(e)
				})]
			}), value && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				onClick: () => onPick(null),
				children: "Remove"
			})]
		})
	] });
}
function CreateShopPage() {
	const navigate = useNavigate();
	const { createShop } = useMerchant();
	const { profile } = useAuth();
	const [step, setStep] = (0, import_react.useState)(0);
	const [draft, setDraft] = (0, import_react.useState)(emptyDraft);
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [created, setCreated] = (0, import_react.useState)(false);
	if (!profile) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Please sign in to access shop provisioning." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			onClick: () => navigate({ to: "/login" }),
			children: "Sign in"
		})]
	});
	if (profile.role !== "SUPER_ADMIN") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "p-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Access denied. Shop creation is restricted to administrators." })
	});
	const set = (k, v) => setDraft((d) => ({
		...d,
		[k]: v
	}));
	const validate = () => {
		if (step === 0) {
			if (!draft.name.trim()) return "Shop name is required.";
			if (!draft.description.trim()) return "Add a short shop description.";
			if (!draft.phone.trim()) return "Contact number is required.";
			if (!draft.email.trim()) return "Email is required.";
		}
		return null;
	};
	const next = () => {
		const err = validate();
		setError(err);
		if (err) return;
		setStep((s) => Math.min(s + 1, STEPS.length - 1));
	};
	const submit = async () => {
		setBusy(true);
		setError(null);
		try {
			await createShop({
				name: draft.name,
				description: draft.description,
				category: draft.category,
				phone: draft.phone,
				email: draft.email,
				campus: draft.campus,
				prepTime: draft.prepTime,
				hours: draft.hours,
				logo: draft.logo ? {
					url: draft.logo,
					publicId: ""
				} : null,
				cover: draft.cover ? {
					url: draft.cover,
					publicId: ""
				} : null
			});
			setCreated(true);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Couldn't create your shop.");
		} finally {
			setBusy(false);
		}
	};
	if (created) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center px-5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			initial: {
				opacity: 0,
				scale: .96
			},
			animate: {
				opacity: 1,
				scale: 1
			},
			transition: {
				type: "spring",
				stiffness: 420,
				damping: 30
			},
			className: "w-full max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
					initial: { scale: .4 },
					animate: { scale: 1 },
					transition: {
						type: "spring",
						stiffness: 500,
						damping: 22,
						delay: .05
					},
					className: "mx-auto grid h-16 w-16 place-items-center rounded-full bg-success-soft text-success",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
						size: 30,
						strokeWidth: 3
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-5 text-2xl font-bold tracking-tight",
					children: "Your shop is ready"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: [draft.name, " has been created successfully."]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-7 w-full",
					onClick: () => navigate({ to: "/shop" }),
					children: "Go to Dashboard"
				})
			]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-2xl px-4 pb-16 pt-6 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-5 flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-bold uppercase tracking-[0.16em] text-primary",
					children: "DigitalFoodStreet"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 text-2xl font-bold tracking-tight",
					children: "Create your shop"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					onClick: () => navigate({ to: "/shop-login" }),
					children: "Cancel"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, { step }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
				mode: "wait",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
					initial: {
						opacity: 0,
						x: 16
					},
					animate: {
						opacity: 1,
						x: 0
					},
					exit: {
						opacity: 0,
						x: -16
					},
					transition: { duration: .2 },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "space-y-4 p-5",
						children: [
							step === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Shop name",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
										value: draft.name,
										onChange: (e) => set("name", e.target.value),
										placeholder: "Zuzu"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Shop description",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
										value: draft.description,
										onChange: (e) => set("description", e.target.value),
										placeholder: "Fresh burgers, snacks and beverages."
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Shop category",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
										value: draft.category,
										onChange: (e) => set("category", e.target.value),
										children: SHOP_CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: c }, c))
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-4 sm:grid-cols-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Contact number",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
											value: draft.phone,
											onChange: (e) => set("phone", e.target.value),
											placeholder: "+91 98765 43210"
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Email",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
											type: "email",
											value: draft.email,
											onChange: (e) => set("email", e.target.value),
											placeholder: "owner@shop.com"
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Campus / location",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
										value: draft.campus,
										onChange: (e) => set("campus", e.target.value),
										placeholder: "Campus Food Court"
									})
								})
							] }),
							step === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MockUpload, {
										label: "Shop logo",
										value: draft.logo,
										aspect: "h-28 w-28 rounded-2xl",
										onPick: (v) => set("logo", v)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MockUpload, {
										label: "Shop cover image",
										value: draft.cover,
										aspect: "aspect-[16/9] w-full",
										onPick: (v) => set("cover", v)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Uploads are previewed locally for now and will move to cloud storage later."
									})
								]
							}),
							step === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Description",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
										value: draft.description,
										onChange: (e) => set("description", e.target.value)
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Cuisine / category",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
										value: draft.cuisine,
										onChange: (e) => set("cuisine", e.target.value),
										children: SHOP_CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: c }, c))
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Average preparation time",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
										value: draft.prepTime,
										onChange: (e) => set("prepTime", e.target.value),
										children: [
											"5–10 minutes",
											"10–15 minutes",
											"15–20 minutes",
											"20–30 minutes"
										].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: t }, t))
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-4 sm:grid-cols-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Contact number",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
											value: draft.phone,
											onChange: (e) => set("phone", e.target.value)
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Contact email",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
											value: draft.email,
											onChange: (e) => set("email", e.target.value)
										})
									})]
								})
							] }),
							step === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-3",
								children: [draft.hours.map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border border-border p-3 sm:flex sm:items-center sm:justify-between sm:gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between gap-3 sm:w-40",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sm font-semibold",
											children: h.day
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => set("hours", draft.hours.map((d, di) => di === i ? {
												...d,
												open: !d.open
											} : d)),
											className: cn("rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide transition-colors", h.open ? "bg-success-soft text-success" : "bg-secondary text-muted-foreground"),
											children: h.open ? "Open" : "Closed"
										})]
									}), h.open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-2 flex items-center gap-2 sm:mt-0",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
												"aria-label": `${h.day} opening time`,
												value: h.from,
												onChange: (e) => set("hours", draft.hours.map((d, di) => di === i ? {
													...d,
													from: e.target.value
												} : d)),
												className: "mt-0 py-2",
												children: TIME_OPTIONS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: t }, t))
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-sm text-muted-foreground",
												children: "–"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
												"aria-label": `${h.day} closing time`,
												value: h.to,
												onChange: (e) => set("hours", draft.hours.map((d, di) => di === i ? {
													...d,
													to: e.target.value
												} : d)),
												className: "mt-0 py-2",
												children: TIME_OPTIONS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: t }, t))
											})
										]
									})]
								}, h.day)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Current shop availability",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: draft.availability,
										onChange: (e) => set("availability", e.target.value),
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "open",
												children: "Open"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "closed",
												children: "Closed"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "unavailable",
												children: "Temporarily unavailable"
											})
										]
									})
								})]
							}),
							step === 4 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-4",
								children: [
									draft.cover && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: draft.cover,
										alt: `${draft.name} cover`,
										className: "aspect-[16/9] w-full rounded-2xl object-cover"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-3",
										children: [draft.logo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: draft.logo,
											alt: `${draft.name} logo`,
											className: "h-12 w-12 rounded-xl object-cover"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-lg font-bold text-accent-foreground",
											children: draft.name.charAt(0) || "S"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-lg font-bold leading-tight",
											children: draft.name || "Your shop"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-muted-foreground",
											children: draft.description
										})] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
										className: "grid gap-2 text-sm",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between gap-4",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
													className: "text-muted-foreground",
													children: "Category"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
													className: "font-medium",
													children: draft.cuisine
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between gap-4",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
													className: "text-muted-foreground",
													children: "Preparation"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
													className: "font-medium",
													children: draft.prepTime
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between gap-4",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
													className: "text-muted-foreground",
													children: "Location"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
													className: "font-medium",
													children: draft.campus
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between gap-4",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
													className: "text-muted-foreground",
													children: "Contact"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
													className: "font-medium",
													children: draft.phone
												})]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-xl border border-border p-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-semibold",
											children: "Opening hours"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
											className: "mt-2 space-y-1 text-sm",
											children: DAYS.map((day) => {
												const h = draft.hours.find((x) => x.day === day);
												return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
													className: "flex justify-between gap-4",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: day
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-medium",
														children: h.open ? `${h.from} – ${h.to}` : "Closed"
													})]
												}, day);
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										className: "w-full",
										onClick: () => setStep(0),
										children: "Edit details"
									})
								]
							}),
							error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								role: "alert",
								className: "text-sm font-medium text-destructive",
								children: error
							})
						]
					})
				}, step)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					className: "flex-1",
					onClick: () => step === 0 ? navigate({ to: "/shop-login" }) : setStep((s) => s - 1),
					children: "Back"
				}), step < STEPS.length - 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "flex-1",
					onClick: next,
					children: "Save & Continue"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "flex-1",
					disabled: busy,
					onClick: () => void submit(),
					children: busy ? "Creating…" : "Create Shop"
				})]
			})
		]
	});
}
//#endregion
export { CreateShopPage as component };
