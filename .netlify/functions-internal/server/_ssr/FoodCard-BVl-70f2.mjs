import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { N as Check, T as Heart, b as Minus, v as Plus } from "../_libs/lucide-react.mjs";
import { t as BottomSheet } from "./BottomSheet-CYaUI7P7.mjs";
import { d as cn, g as getShop, h as formatPrice, v as useStore } from "./router-BGLoriXd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/FoodCard-BVl-70f2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function FavouriteButton({ item, className }) {
	const { isFavourite, toggleFavourite } = useStore();
	const active = isFavourite(item.id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.button, {
		whileTap: { scale: .82 },
		animate: active ? { scale: [
			1,
			1.25,
			1
		] } : { scale: 1 },
		transition: { duration: .22 },
		onClick: (e) => {
			e.preventDefault();
			e.stopPropagation();
			toggleFavourite(item);
		},
		"aria-pressed": active,
		"aria-label": active ? `Remove ${item.name} from favourites` : `Add ${item.name} to favourites`,
		className: cn("grid h-9 w-9 place-items-center rounded-full border border-border bg-surface/90 backdrop-blur", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {
			size: 17,
			className: active ? "text-primary" : "text-muted-foreground",
			fill: active ? "currentColor" : "none",
			strokeWidth: 2
		})
	});
}
function AddToCartButton({ item, variant = "icon", qty = 1, onAdded }) {
	const { addToCart } = useStore();
	const [added, setAdded] = (0, import_react.useState)(false);
	const handle = (e) => {
		e.preventDefault();
		e.stopPropagation();
		if (!item.available) return;
		addToCart(item, qty);
		setAdded(true);
		onAdded?.();
		setTimeout(() => setAdded(false), 1200);
	};
	if (variant === "wide") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.button, {
		whileTap: { scale: .97 },
		onClick: handle,
		disabled: !item.available,
		className: "min-h-[52px] w-full rounded-2xl bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-50",
		children: added ? "✓ Added" : item.available ? `Add · ₹${item.price * qty}` : "Unavailable"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.button, {
		whileTap: { scale: .86 },
		onClick: handle,
		disabled: !item.available,
		"aria-label": `Add ${item.name} to cart`,
		className: cn("grid h-9 min-w-[36px] place-items-center rounded-xl px-2 text-xs font-semibold transition-colors", added ? "bg-success text-success-foreground" : "bg-primary text-primary-foreground disabled:bg-secondary disabled:text-muted-foreground"),
		children: added ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 16 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 16 })
	});
}
function FoodDetailsSheet({ item, onClose }) {
	const [qty, setQty] = (0, import_react.useState)(1);
	const shop = item ? getShop(item.shopId) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BottomSheet, {
		open: !!item,
		onClose: () => {
			setQty(1);
			onClose();
		},
		title: item?.name,
		children: item && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: item.image,
					alt: item.name,
					loading: "lazy",
					width: 640,
					height: 640,
					className: "aspect-[4/3] w-full rounded-2xl object-cover"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-xl font-bold tracking-tight",
							children: item.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: shop?.name
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FavouriteButton, {
						item,
						className: "h-10 w-10"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted-foreground",
					children: item.description
				}),
				item.ingredients && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold text-foreground",
						children: "Ingredients · "
					}), item.ingredients]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xl font-bold",
						children: formatPrice(item.price * qty)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-4 rounded-2xl bg-secondary px-3 py-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setQty((q) => Math.max(1, q - 1)),
								"aria-label": "Decrease quantity",
								className: "grid h-8 w-8 place-items-center rounded-full bg-surface",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { size: 15 })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-4 text-center text-sm font-semibold",
								children: qty
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setQty((q) => q + 1),
								"aria-label": "Increase quantity",
								className: "grid h-8 w-8 place-items-center rounded-full bg-surface",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 15 })
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddToCartButton, {
						item,
						variant: "wide",
						qty,
						onAdded: () => {
							setQty(1);
							onClose();
						}
					})
				})
			]
		})
	});
}
function FoodCard({ item, index = 0, onOpen }) {
	const shop = getShop(item.shopId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.article, {
		initial: {
			opacity: 0,
			y: 12
		},
		animate: {
			opacity: 1,
			y: 0
		},
		transition: {
			duration: .25,
			delay: index * .04
		},
		className: "w-[160px] shrink-0",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "button",
			tabIndex: 0,
			onClick: () => onOpen?.(item),
			onKeyDown: (e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onOpen?.(item);
				}
			},
			className: "block w-full cursor-pointer text-left",
			"aria-label": `View ${item.name}`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: item.image,
						alt: item.name,
						loading: "lazy",
						width: 640,
						height: 640,
						className: "aspect-square w-full rounded-2xl object-cover"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FavouriteButton, {
						item,
						className: "absolute right-2 top-2"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mt-2 truncate text-sm font-semibold",
					children: item.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate text-xs text-muted-foreground",
					children: shop?.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-1.5 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-bold",
						children: formatPrice(item.price)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddToCartButton, { item })]
				})
			]
		})
	});
}
function FoodRow({ item, index = 0, showShop = false, onOpen }) {
	const shop = getShop(item.shopId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.article, {
		initial: {
			opacity: 0,
			y: 10
		},
		animate: {
			opacity: 1,
			y: 0
		},
		transition: {
			duration: .22,
			delay: index * .03
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "button",
			tabIndex: 0,
			onClick: () => onOpen?.(item),
			onKeyDown: (e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onOpen?.(item);
				}
			},
			className: "flex w-full cursor-pointer gap-3 rounded-2xl bg-card p-3 text-left shadow-card active:scale-[0.99] transition-transform",
			"aria-label": `View ${item.name}`,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative shrink-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: item.image,
					alt: item.name,
					loading: "lazy",
					width: 640,
					height: 640,
					className: "h-[84px] w-[84px] rounded-xl object-cover"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FavouriteButton, {
					item,
					className: "absolute -right-2 -top-2 h-8 w-8"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 flex-col",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "truncate text-sm font-semibold",
						children: item.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 line-clamp-2 text-xs text-muted-foreground",
						children: showShop ? shop?.name : item.description
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-auto flex items-end justify-between pt-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm font-bold",
							children: formatPrice(item.price)
						}), item.available ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddToCartButton, { item }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px] font-semibold uppercase text-muted-foreground",
							children: "Sold out"
						})]
					})
				]
			})]
		})
	});
}
//#endregion
export { FoodDetailsSheet as n, FoodRow as r, FoodCard as t };
