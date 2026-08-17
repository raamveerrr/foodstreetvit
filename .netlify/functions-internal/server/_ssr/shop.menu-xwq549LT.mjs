import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as AnimatePresence } from "../_libs/framer-motion+[...].mjs";
import { t as motion } from "../_libs/motion.mjs";
import { c as Trash2, v as Plus, y as Pencil } from "../_libs/lucide-react.mjs";
import { a as MerchantEmpty, c as SectionHeading, d as TextArea, f as TextInput, i as Field, l as Select, n as Card, o as Modal, r as ConfirmDialog, t as Button } from "./MerchantUI-IaaBvX-G.mjs";
import { b as uploadImage, c as formatMoney, d as cn, r as useMerchant, y as cloudinaryFolders } from "./router-BGLoriXd.mjs";
import { t as MerchantShell } from "./router-BGLoriXd2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shop.menu-xwq549LT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var emptyItem = (category) => ({
	id: "",
	name: "",
	description: "",
	price: 0,
	category,
	image: "",
	available: true,
	veg: true,
	popular: false,
	ingredients: "",
	prepTime: "10–15 minutes"
});
function MenuPage() {
	const { activeShop, addMenuItem, updateMenuItem, deleteMenuItem, addCategory, renameCategory, deleteCategory } = useMerchant();
	const categories = activeShop?.categories ?? [];
	const menu = activeShop?.menu ?? [];
	const [filter, setFilter] = (0, import_react.useState)("All");
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [isNew, setIsNew] = (0, import_react.useState)(false);
	const [deleting, setDeleting] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [catOpen, setCatOpen] = (0, import_react.useState)(false);
	const [newCat, setNewCat] = (0, import_react.useState)("");
	const [catToDelete, setCatToDelete] = (0, import_react.useState)(null);
	const visible = (0, import_react.useMemo)(() => filter === "All" ? menu : menu.filter((m) => m.category === filter), [menu, filter]);
	const [uploading, setUploading] = (0, import_react.useState)(false);
	const handleUpload = async (file) => {
		setUploading(true);
		try {
			const asset = await uploadImage(file, cloudinaryFolders.menuItem(activeShop?.id ?? "pending", editing?.id || "new"));
			setEditing((prev) => prev ? {
				...prev,
				image: asset.url,
				imagePublicId: asset.publicId
			} : prev);
			toast.success("Photo uploaded");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Upload failed");
		} finally {
			setUploading(false);
		}
	};
	const openNew = () => {
		setIsNew(true);
		setEditing(emptyItem(categories[0] ?? "Snacks"));
	};
	const save = () => {
		if (!editing) return;
		if (!editing.name.trim()) {
			toast.error("Food name is required");
			return;
		}
		setBusy(true);
		window.setTimeout(() => {
			if (isNew) {
				addMenuItem({
					...editing,
					id: `m_${Date.now().toString(36)}`
				});
				toast.success(`${editing.name} added`);
			} else {
				updateMenuItem(editing.id, editing);
				toast.success(`${editing.name} updated`);
			}
			setBusy(false);
			setEditing(null);
		}, 350);
	};
	const confirmDelete = () => {
		if (!deleting) return;
		setBusy(true);
		window.setTimeout(() => {
			deleteMenuItem(deleting.id);
			toast.success(`${deleting.name} deleted`);
			setBusy(false);
			setDeleting(null);
		}, 300);
	};
	const patch = (k, v) => setEditing((e) => e ? {
		...e,
		[k]: v
	} : e);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MerchantShell, {
		title: "Menu",
		subtitle: `${menu.length} items · ${categories.length} categories`,
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: () => setCatOpen(true),
				children: "Categories"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: openNew,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 16 }), " Add food"]
			})]
		}),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "no-scrollbar -mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1",
				children: ["All", ...categories].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setFilter(c),
					className: cn("min-h-[40px] shrink-0 rounded-full px-4 text-[13px] font-semibold transition-colors", filter === c ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"),
					children: c
				}, c))
			}),
			visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MerchantEmpty, {
				title: "Your menu is empty.",
				description: "Add your first item so students can start ordering.",
				actionLabel: "Add your first item",
				onAction: openNew
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 lg:grid-cols-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
					initial: false,
					children: visible.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
						layout: true,
						initial: {
							opacity: 0,
							y: 8
						},
						animate: {
							opacity: 1,
							y: 0
						},
						exit: {
							opacity: 0,
							scale: .98
						},
						transition: {
							duration: .2,
							delay: i * .02
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "flex gap-3",
							children: [item.image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: item.image,
								alt: item.name,
								className: "h-20 w-20 shrink-0 rounded-xl object-cover"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-secondary text-xs text-muted-foreground",
								children: "No image"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "truncate text-sm font-semibold",
											children: item.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "line-clamp-2 text-xs text-muted-foreground",
											children: item.description
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "shrink-0 text-sm font-bold",
										children: formatMoney(item.price)
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex flex-wrap items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground",
											children: item.category
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => {
												updateMenuItem(item.id, { available: !item.available });
												toast(`${item.name} ${item.available ? "unavailable" : "available"}`);
											},
											className: cn("rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide transition-colors", item.available ? "bg-success-soft text-success" : "bg-secondary text-muted-foreground"),
											children: item.available ? "Available" : "Unavailable"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "ml-auto flex gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												"aria-label": `Edit ${item.name}`,
												onClick: () => {
													setIsNew(false);
													setEditing(item);
												},
												className: "grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground hover:text-foreground",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { size: 15 })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												"aria-label": `Delete ${item.name}`,
												onClick: () => setDeleting(item),
												className: "grid h-9 w-9 place-items-center rounded-lg border border-border text-destructive",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { size: 15 })
											})]
										})
									]
								})]
							})]
						})
					}, item.id))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: Boolean(editing),
				onClose: () => setEditing(null),
				title: isNew ? "Add food" : "Edit food",
				footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						className: "flex-1",
						onClick: () => setEditing(null),
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "flex-1",
						disabled: busy,
						onClick: save,
						children: busy ? isNew ? "Adding…" : "Saving…" : isNew ? "Add item" : "Save changes"
					})]
				}),
				children: editing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Food name",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								value: editing.name,
								onChange: (e) => patch("name", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Description",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
								value: editing.description,
								onChange: (e) => patch("description", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Price (₹)",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									type: "number",
									min: 0,
									value: editing.price,
									onChange: (e) => patch("price", Number(e.target.value))
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Category",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
									value: editing.category,
									onChange: (e) => patch("category", e.target.value),
									children: (categories.length ? categories : ["Snacks"]).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: c }, c))
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Item photo",
							hint: "Uploaded to Cloudinary and delivered through their CDN. JPG or PNG, under 8 MB.",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-secondary text-[11px] text-muted-foreground",
									children: editing.image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: editing.image,
										alt: editing.name || "Menu item",
										className: "h-full w-full object-cover"
									}) : "No image"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											id: "menu-item-photo",
											type: "file",
											accept: "image/*",
											className: "sr-only",
											onChange: (e) => {
												const file = e.target.files?.[0];
												e.target.value = "";
												if (file) handleUpload(file);
											}
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											htmlFor: "menu-item-photo",
											className: cn("inline-flex min-h-[44px] cursor-pointer items-center rounded-xl border border-border px-4 text-sm font-medium", uploading && "pointer-events-none opacity-60"),
											children: uploading ? "Uploading…" : editing.image ? "Replace photo" : "Upload photo"
										}),
										editing.image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => {
												patch("image", "");
												patch("imagePublicId", null);
											},
											className: "ml-2 text-sm font-medium text-muted-foreground underline",
											children: "Remove"
										}) : null
									]
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Ingredients (optional)",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								value: editing.ingredients ?? "",
								onChange: (e) => patch("ingredients", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Preparation time (optional)",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								value: editing.prepTime ?? "",
								onChange: (e) => patch("prepTime", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2",
							children: [
								{
									key: "available",
									label: "Available to order"
								},
								{
									key: "veg",
									label: "Vegetarian"
								},
								{
									key: "popular",
									label: "Popular item"
								}
							].map(({ key, label }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => patch(key, !editing[key]),
								className: "flex w-full items-center justify-between rounded-xl border border-border px-3.5 py-3 text-sm font-medium",
								children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("relative h-6 w-11 rounded-full transition-colors", editing[key] ? "bg-primary" : "bg-secondary"),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
										layout: true,
										transition: {
											type: "spring",
											stiffness: 500,
											damping: 34
										},
										className: cn("absolute top-0.5 h-5 w-5 rounded-full bg-surface shadow-card", editing[key] ? "right-0.5" : "left-0.5")
									})
								})]
							}, key))
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: Boolean(deleting),
				title: `Delete "${deleting?.name ?? ""}"?`,
				description: "This item will be removed from your menu.",
				busy,
				onCancel: () => setDeleting(null),
				onConfirm: confirmDelete
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: catOpen,
				onClose: () => setCatOpen(false),
				title: "Menu categories",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
							title: "Categories",
							description: "Deleting a category moves its items to Uncategorised — nothing is removed."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									defaultValue: c,
									"aria-label": `Rename ${c}`,
									onBlur: (e) => {
										const v = e.target.value.trim();
										if (v && v !== c) {
											renameCategory(c, v);
											toast.success(`Category renamed to ${v}`);
										}
									},
									className: "mt-0"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									onClick: () => setCatToDelete(c),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { size: 15 })
								})]
							}, c)), categories.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "No categories yet."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								value: newCat,
								placeholder: "New category",
								onChange: (e) => setNewCat(e.target.value),
								className: "mt-0"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: () => {
									if (!newCat.trim()) return;
									addCategory(newCat.trim());
									toast.success(`${newCat.trim()} added`);
									setNewCat("");
								},
								children: "Add"
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: Boolean(catToDelete),
				title: `Delete category "${catToDelete ?? ""}"?`,
				description: "Items in this category will move to Uncategorised, not be deleted.",
				confirmLabel: "Delete category",
				onCancel: () => setCatToDelete(null),
				onConfirm: () => {
					if (catToDelete) {
						deleteCategory(catToDelete);
						toast.success("Category deleted");
						if (filter === catToDelete) setFilter("All");
					}
					setCatToDelete(null);
				}
			})
		]
	});
}
//#endregion
export { MenuPage as component };
