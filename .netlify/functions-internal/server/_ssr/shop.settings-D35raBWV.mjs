import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { c as SectionHeading, d as TextArea, f as TextInput, i as Field, l as Select, n as Card, t as Button } from "./MerchantUI-IaaBvX-G.mjs";
import { a as SHOP_CATEGORIES, b as uploadImage, d as cn, o as TIME_OPTIONS, r as useMerchant, y as cloudinaryFolders } from "./router-BGLoriXd.mjs";
import { t as MerchantShell } from "./router-BGLoriXd2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shop.settings-D35raBWV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SettingsPage() {
	const { activeShop, updateShop } = useMerchant();
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [uploadingCover, setUploadingCover] = (0, import_react.useState)(false);
	const [uploadingLogo, setUploadingLogo] = (0, import_react.useState)(false);
	if (!activeShop) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MerchantShell, {
		title: "Settings",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: "No shop selected." })
	});
	const shop = activeShop;
	const save = () => {
		setBusy(true);
		window.setTimeout(() => {
			setBusy(false);
			toast.success("Shop settings updated");
		}, 400);
	};
	const handleCoverUpload = async (file) => {
		setUploadingCover(true);
		try {
			const asset = await uploadImage(file, cloudinaryFolders.shopCover(shop.id));
			updateShop({
				cover: asset.url,
				coverPublicId: asset.publicId
			});
			toast.success("Cover image uploaded and saved");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Upload failed");
		} finally {
			setUploadingCover(false);
		}
	};
	const handleLogoUpload = async (file) => {
		setUploadingLogo(true);
		try {
			const asset = await uploadImage(file, cloudinaryFolders.shopLogo(shop.id));
			updateShop({
				logo: asset.url,
				logoPublicId: asset.publicId
			});
			toast.success("Logo uploaded and saved");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Upload failed");
		} finally {
			setUploadingLogo(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MerchantShell, {
		title: "Settings",
		subtitle: `Managing ${shop.name}`,
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			onClick: save,
			disabled: busy,
			children: busy ? "Saving…" : "Save Changes"
		}),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 lg:grid-cols-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, { title: "Basic information" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Shop name",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								value: shop.name,
								onChange: (e) => updateShop({ name: e.target.value })
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Description",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
								value: shop.description,
								onChange: (e) => updateShop({ description: e.target.value })
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Category",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
								value: shop.category,
								onChange: (e) => updateShop({ category: e.target.value }),
								children: Array.from(/* @__PURE__ */ new Set([shop.category, ...SHOP_CATEGORIES])).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: c }, c))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Average preparation time",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
								value: shop.prepTime,
								onChange: (e) => updateShop({ prepTime: e.target.value }),
								children: Array.from(/* @__PURE__ */ new Set([
									shop.prepTime,
									"5–10 minutes",
									"10–15 minutes",
									"15–20 minutes",
									"20–30 minutes"
								])).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: t }, t))
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, { title: "Branding" }),
						shop.cover && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: shop.cover,
							alt: `${shop.name} cover`,
							className: "aspect-[16/9] w-full rounded-xl object-cover"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Cover image",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: "shop-cover-upload",
										type: "file",
										accept: "image/*",
										className: "sr-only",
										onChange: (e) => {
											const file = e.target.files?.[0];
											e.target.value = "";
											if (file) handleCoverUpload(file);
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										htmlFor: "shop-cover-upload",
										className: cn("inline-flex min-h-[44px] cursor-pointer items-center rounded-xl border border-border px-4 text-sm font-medium", uploadingCover && "pointer-events-none opacity-60"),
										children: uploadingCover ? "Uploading…" : shop.cover ? "Replace cover" : "Upload cover"
									}),
									shop.cover ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => updateShop({
											cover: "",
											coverPublicId: null
										}),
										className: "text-sm font-medium text-muted-foreground underline",
										children: "Remove"
									}) : null
								]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Logo image",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [
									shop.logo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: shop.logo,
										alt: `${shop.name} logo`,
										className: "h-14 w-14 rounded-full object-cover"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grid h-14 w-14 place-items-center rounded-full bg-secondary text-xs text-muted-foreground",
										children: "None"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: "shop-logo-upload",
										type: "file",
										accept: "image/*",
										className: "sr-only",
										onChange: (e) => {
											const file = e.target.files?.[0];
											e.target.value = "";
											if (file) handleLogoUpload(file);
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										htmlFor: "shop-logo-upload",
										className: cn("inline-flex min-h-[44px] cursor-pointer items-center rounded-xl border border-border px-4 text-sm font-medium", uploadingLogo && "pointer-events-none opacity-60"),
										children: uploadingLogo ? "Uploading…" : shop.logo ? "Replace logo" : "Upload logo"
									}),
									shop.logo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => updateShop({
											logo: "",
											logoPublicId: null
										}),
										className: "text-sm font-medium text-muted-foreground underline",
										children: "Remove"
									}) : null
								]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, { title: "Contact information" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Contact number",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								value: shop.phone,
								onChange: (e) => updateShop({ phone: e.target.value })
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Email",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								value: shop.email,
								onChange: (e) => updateShop({ email: e.target.value })
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Campus / location",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								value: shop.campus,
								onChange: (e) => updateShop({ campus: e.target.value })
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "space-y-3 lg:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, { title: "Opening hours" }), shop.hours.map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border p-3 sm:flex sm:items-center sm:justify-between sm:gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3 sm:w-48",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-semibold",
								children: h.day
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => updateShop({ hours: shop.hours.map((d, di) => di === i ? {
									...d,
									open: !d.open
								} : d) }),
								className: cn("rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide", h.open ? "bg-success-soft text-success" : "bg-secondary text-muted-foreground"),
								children: h.open ? "Open" : "Closed"
							})]
						}), h.open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex items-center gap-2 sm:mt-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
									"aria-label": `${h.day} opening time`,
									value: h.from,
									onChange: (e) => updateShop({ hours: shop.hours.map((d, di) => di === i ? {
										...d,
										from: e.target.value
									} : d) }),
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
									onChange: (e) => updateShop({ hours: shop.hours.map((d, di) => di === i ? {
										...d,
										to: e.target.value
									} : d) }),
									className: "mt-0 py-2",
									children: TIME_OPTIONS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: t }, t))
								})
							]
						})]
					}, h.day))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "lg:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, { title: "Shop availability" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							{
								value: "open",
								label: "Open"
							},
							{
								value: "closed",
								label: "Closed"
							},
							{
								value: "unavailable",
								label: "Temporarily unavailable"
							}
						].map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => updateShop({ availability: o.value }),
							className: cn("min-h-[42px] rounded-full px-4 text-sm font-semibold transition-colors", shop.availability === o.value ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"),
							children: o.label
						}, o.value))
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-5",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "w-full sm:w-auto",
				onClick: save,
				disabled: busy,
				children: busy ? "Saving…" : "Save Changes"
			})
		})]
	});
}
//#endregion
export { SettingsPage as component };
