import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react, t as QueryClientProvider } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link, b as useRouter, c as HeadContent, f as createRouter, g as createRootRouteWithContext, h as createFileRoute, m as lazyRouteComponent, p as Outlet, s as Scripts, u as useRouterState, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { i as AnimatePresence } from "../_libs/framer-motion+[...].mjs";
import { t as motion } from "../_libs/motion.mjs";
import { E as CreditCard, P as ChartColumn, S as LayoutDashboard, T as Heart, _ as Printer, a as UtensilsCrossed, f as Settings, g as ReceiptText, m as ScanLine, o as UsersRound, u as ShoppingBag, w as House, x as LogOut } from "../_libs/lucide-react.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { C as __exportAll, S as useAuth, _ as useCatalog, d as cn, m as StoreProvider, n as MerchantProvider, p as CatalogProvider, r as useMerchant, v as useStore, x as AuthProvider } from "./router-BGLoriXd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-BGLoriXd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-DHei95EW.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : void 0;
	window.__lovableReportRuntimeError?.({
		message,
		...stack !== void 0 && { stack },
		filename: window.location.pathname
	});
}
var ITEMS = [
	{
		to: "/",
		label: "Home",
		icon: House
	},
	{
		to: "/cart",
		label: "Cart",
		icon: ShoppingBag
	},
	{
		to: "/favourites",
		label: "Favourite",
		icon: Heart
	},
	{
		to: "/receipts",
		label: "Receipts",
		icon: ReceiptText
	}
];
function BottomNavigation() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const { cartCount } = useStore();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		"aria-label": "Primary",
		className: "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur-lg shadow-nav safe-bottom",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "app-shell flex items-stretch justify-between px-2",
			children: ITEMS.map(({ to, label, icon: Icon }) => {
				const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "flex-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to,
						"aria-label": label,
						"aria-current": active ? "page" : void 0,
						className: "relative flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-xl py-2",
						children: [
							active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
								layoutId: "nav-indicator",
								transition: {
									type: "spring",
									stiffness: 500,
									damping: 34
								},
								className: "absolute inset-x-4 top-0 h-[3px] rounded-full bg-primary"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.span, {
								whileTap: { scale: .86 },
								animate: { scale: active ? 1.06 : 1 },
								transition: { duration: .18 },
								className: "relative",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
									size: 22,
									strokeWidth: active ? 2.4 : 1.9,
									className: cn("transition-colors", active ? "text-primary" : "text-muted-foreground"),
									fill: active && label === "Favourite" ? "currentColor" : "none"
								}), label === "Cart" && cartCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
									initial: {
										scale: .5,
										opacity: 0
									},
									animate: {
										scale: 1,
										opacity: 1
									},
									transition: {
										type: "spring",
										stiffness: 600,
										damping: 22
									},
									className: "absolute -right-2.5 -top-1.5 min-w-[18px] rounded-full bg-primary px-1 text-[10px] font-bold leading-[18px] text-primary-foreground",
									children: cartCount
								}, cartCount)]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("text-[11px] font-medium transition-colors", active ? "text-primary" : "text-muted-foreground"),
								children: label
							})
						]
					})
				}, to);
			})
		})
	});
}
var MERCHANT_NAV = [
	{
		to: "/shop",
		label: "Dashboard",
		icon: LayoutDashboard
	},
	{
		to: "/shop/orders",
		label: "Orders",
		icon: ReceiptText
	},
	{
		to: "/shop/menu",
		label: "Menu",
		icon: UtensilsCrossed
	},
	{
		to: "/shop/receipts",
		label: "Receipts",
		icon: ScanLine
	},
	{
		to: "/shop/analytics",
		label: "Analytics",
		icon: ChartColumn
	},
	{
		to: "/shop/customers",
		label: "Customers",
		icon: UsersRound
	},
	{
		to: "/shop/settings",
		label: "Settings",
		icon: Settings
	},
	{
		to: "/shop/payments",
		label: "Payments",
		icon: CreditCard
	},
	{
		to: "/shop/printer",
		label: "Printer",
		icon: Printer
	}
];
var MERCHANT_PATHS = /* @__PURE__ */ new Set([
	"/shop-login",
	"/create-shop",
	"/login",
	"/signup",
	"/forgot-password",
	"/admin",
	...MERCHANT_NAV.map((n) => n.to)
]);
/** Student `/shop/$shopId` pages must never be treated as merchant routes. */
var isMerchantPath = (pathname) => {
	const cleanPath = pathname.replace(/\/$/, "") || "/";
	if (cleanPath.startsWith("/admin")) return true;
	return MERCHANT_PATHS.has(cleanPath) || cleanPath === "/shop/change-password";
};
var AVAILABILITY = {
	open: {
		label: "Open",
		dot: "bg-success",
		chip: "bg-success-soft text-success"
	},
	closed: {
		label: "Closed",
		dot: "bg-muted-foreground",
		chip: "bg-secondary text-muted-foreground"
	},
	unavailable: {
		label: "Temporarily unavailable",
		dot: "bg-warning",
		chip: "bg-primary-soft text-accent-foreground"
	}
};
function ShopSwitcher() {
	const { shops, activeShop, setActiveShop } = useMerchant();
	if (!activeShop) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "truncate text-[15px] font-bold leading-tight",
			children: activeShop.name
		}), shops.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
			"aria-label": "Switch shop",
			value: activeShop.id,
			onChange: (e) => setActiveShop(e.target.value),
			className: "-ml-1 mt-0.5 max-w-full rounded-md bg-transparent px-1 text-xs text-muted-foreground outline-none",
			children: shops.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
				value: s.id,
				children: ["Managing: ", s.name]
			}, s.id))
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted-foreground",
			children: "Shop Dashboard"
		})]
	});
}
function StatusChip() {
	const { activeShop } = useMerchant();
	if (!activeShop) return null;
	const a = AVAILABILITY[activeShop.availability];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide", a.chip),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("h-1.5 w-1.5 rounded-full", a.dot) }), a.label]
	});
}
function MerchantShell({ title, subtitle, actions, children }) {
	const navigate = useNavigate();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const { hydrated, authed, signOut } = useMerchant();
	(0, import_react.useEffect)(() => {
		if (hydrated && !authed) navigate({
			to: "/shop-login",
			replace: true
		});
	}, [
		hydrated,
		authed,
		navigate
	]);
	if (!hydrated || !authed) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar px-3 py-5 lg:flex",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] font-bold uppercase tracking-[0.14em] text-primary",
							children: "DigitalFoodStreet"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShopSwitcher, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusChip, {})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "mt-6 flex-1 space-y-1",
					children: MERCHANT_NAV.map(({ to, label, icon: Icon }) => {
						const active = pathname === to;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to,
							className: cn("relative flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors", active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"),
							children: [
								active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
									layoutId: "merchant-nav",
									transition: {
										type: "spring",
										stiffness: 500,
										damping: 36
									},
									className: "absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-primary"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
									size: 18,
									strokeWidth: active ? 2.3 : 1.9
								}),
								label
							]
						}, to);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => {
						signOut();
						navigate({
							to: "/shop-login",
							replace: true
						});
					},
					className: "flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { size: 18 }), "Sign out"]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 flex-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur lg:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3 px-4 pt-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShopSwitcher, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusChip, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							"aria-label": "Sign out",
							onClick: () => {
								signOut();
								navigate({
									to: "/shop-login",
									replace: true
								});
							},
							className: "grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { size: 16 })
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "no-scrollbar mt-2 flex gap-1 overflow-x-auto px-3 pb-2",
					children: MERCHANT_NAV.map(({ to, label, icon: Icon }) => {
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to,
							className: cn("flex min-h-[40px] shrink-0 items-center gap-2 rounded-full px-3.5 text-[13px] font-semibold transition-colors", pathname === to ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { size: 15 }), label]
						}, to);
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.main, {
				initial: {
					opacity: 0,
					y: 8
				},
				animate: {
					opacity: 1,
					y: 0
				},
				transition: { duration: .22 },
				className: "mx-auto w-full max-w-6xl px-4 pb-16 pt-5 sm:px-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "mb-5 flex flex-wrap items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-[22px] font-bold tracking-tight sm:text-2xl",
							children: title
						}), subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: subtitle
						})]
					}), actions]
				}), children]
			}, pathname)]
		})]
	});
}
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
function SplashScreen() {
	const { loading: catalogLoading } = useCatalog();
	const { ready: authReady } = useAuth();
	const [minTimeElapsed, setMinTimeElapsed] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const timer = setTimeout(() => {
			setMinTimeElapsed(true);
		}, 1500);
		return () => clearTimeout(timer);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: (!minTimeElapsed || catalogLoading || !authReady) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		initial: { opacity: 1 },
		exit: {
			opacity: 0,
			scale: .98
		},
		transition: {
			duration: .35,
			ease: "easeInOut"
		},
		className: "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-[#fff7f0] via-white to-[#ffe5cf]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			initial: {
				scale: .85,
				opacity: 0
			},
			animate: {
				scale: 1,
				opacity: 1
			},
			transition: {
				type: "spring",
				bounce: .5,
				duration: .8
			},
			className: "flex flex-col items-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-24 w-24 items-center justify-center rounded-[2rem] bg-primary/10 shadow-sm border border-primary/20",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UtensilsCrossed, {
						size: 45,
						className: "text-primary",
						strokeWidth: 2.5
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-6 text-xl font-medium tracking-tight text-foreground/90",
					children: "DigitalFoodStreet"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.p, {
						initial: {
							scale: .5,
							y: 30,
							opacity: 0
						},
						animate: {
							scale: 1,
							y: 0,
							opacity: 1
						},
						transition: {
							type: "spring",
							bounce: .65,
							duration: 1,
							delay: .3
						},
						className: "text-4xl font-black italic tracking-tighter text-primary",
						style: { fontFamily: "Georgia, 'Times New Roman', serif" },
						children: "Welcome Foodie's"
					})
				})
			]
		})
	}, "splash") });
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$27 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover"
			},
			{ title: "DigitalFoodStreet — Pre-order campus food" },
			{
				name: "description",
				content: "Pre-order food from campus shops, pay online and collect with a digital receipt. Fast, simple, no queues."
			},
			{
				name: "theme-color",
				content: "#fbfaf7"
			},
			{
				property: "og:site_name",
				content: "DigitalFoodStreet"
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				property: "og:title",
				content: "DigitalFoodStreet — Pre-order campus food"
			},
			{
				name: "twitter:title",
				content: "DigitalFoodStreet — Pre-order campus food"
			},
			{
				property: "og:description",
				content: "Pre-order food from campus shops, pay online and collect with a digital receipt. Fast, simple, no queues."
			},
			{
				name: "twitter:description",
				content: "Pre-order food from campus shops, pay online and collect with a digital receipt. Fast, simple, no queues."
			},
			{
				property: "og:image",
				content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/6f99e796cd5ae7babf606e423d947b55/id-preview-56dde7fd--1ddfe1de-0ca1-41bf-ad82-a019125cde64.lovable.app-1786403406734.png"
			},
			{
				name: "twitter:image",
				content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/6f99e796cd5ae7babf606e423d947b55/id-preview-56dde7fd--1ddfe1de-0ca1-41bf-ad82-a019125cde64.lovable.app-1786403406734.png"
			}
		],
		links: [
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				type: "image/x-icon"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$27.useRouteContext();
	const merchant = isMerchantPath(useRouterState({ select: (s) => s.location.pathname }));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CatalogProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoreProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MerchantProvider, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-h-screen bg-background",
				children: merchant ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "min-h-screen bg-background",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "app-shell min-h-screen bg-background pb-[92px]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BottomNavigation, {})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {
				position: "top-center",
				richColors: true,
				closeButton: false
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SplashScreen, {})
		] }) }) }) })
	});
}
var $$splitComponentImporter$26 = () => import("./routes-CwJe5POe.mjs");
var Route$26 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "DigitalFoodStreet — Pre-order campus food" },
		{
			name: "description",
			content: "Pre-order food from campus shops, pay online and collect with a digital receipt. Fast, simple, no queues."
		},
		{
			property: "og:title",
			content: "DigitalFoodStreet — Pre-order campus food"
		},
		{
			property: "og:description",
			content: "Pre-order food from campus shops, pay online and collect with a digital receipt. Fast, simple, no queues."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$26, "component")
});
var $$splitComponentImporter$25 = () => import("./admin-DeyDWy5f.mjs");
var Route$25 = createFileRoute("/admin")({
	head: () => ({ meta: [{ title: "Admin — DigitalFoodStreet" }] }),
	component: lazyRouteComponent($$splitComponentImporter$25, "component")
});
var $$splitComponentImporter$24 = () => import("./cart-CeMqtKFH.mjs");
var Route$24 = createFileRoute("/cart")({
	head: () => ({ meta: [
		{ title: "Your Cart — DigitalFoodStreet" },
		{
			name: "description",
			content: "Review your campus food order and continue to checkout."
		},
		{
			property: "og:title",
			content: "Your Cart — DigitalFoodStreet"
		},
		{
			property: "og:description",
			content: "Review your order and check out in seconds."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$24, "component")
});
var $$splitComponentImporter$23 = () => import("./checkout-GlAOA_eP.mjs");
var Route$23 = createFileRoute("/checkout")({
	head: () => ({ meta: [
		{ title: "Checkout — DigitalFoodStreet" },
		{
			name: "description",
			content: "Pay and get your digital pickup receipt instantly."
		},
		{
			property: "og:title",
			content: "Checkout — DigitalFoodStreet"
		},
		{
			property: "og:description",
			content: "Pay and get your digital pickup receipt instantly."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$23, "component")
});
var $$splitComponentImporter$22 = () => import("./create-shop-BGOYykTB.mjs");
var Route$22 = createFileRoute("/create-shop")({
	head: () => ({ meta: [
		{ title: "Create a Shop — DigitalFoodStreet" },
		{
			name: "description",
			content: "Set up your campus shop on DigitalFoodStreet: branding, business details, opening hours and menu."
		},
		{
			property: "og:title",
			content: "Create a Shop — DigitalFoodStreet"
		},
		{
			property: "og:description",
			content: "Set up your campus shop on DigitalFoodStreet in a few guided steps."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$22, "component")
});
var $$splitComponentImporter$21 = () => import("./favourites-Bkyop8iT.mjs");
var Route$21 = createFileRoute("/favourites")({
	head: () => ({ meta: [
		{ title: "Your Favourites — DigitalFoodStreet" },
		{
			name: "description",
			content: "Your go-to campus food, saved for one-tap reordering."
		},
		{
			property: "og:title",
			content: "Your Favourites — DigitalFoodStreet"
		},
		{
			property: "og:description",
			content: "Reorder your go-to campus food in one tap."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$21, "component")
});
var $$splitComponentImporter$20 = () => import("./forgot-password-C4XdfwZJ.mjs");
var Route$20 = createFileRoute("/forgot-password")({
	head: () => ({ meta: [
		{ title: "Reset Password — DigitalFoodStreet" },
		{
			name: "description",
			content: "Reset the password for your DigitalFoodStreet campus food account."
		},
		{
			property: "og:title",
			content: "Reset Password — DigitalFoodStreet"
		},
		{
			property: "og:description",
			content: "Send yourself a password reset link."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$20, "component")
});
var $$splitComponentImporter$19 = () => import("./login-DBNYQK6r.mjs");
var Route$19 = createFileRoute("/login")({
	head: () => ({ meta: [
		{ title: "Sign In — DigitalFoodStreet" },
		{
			name: "description",
			content: "Sign in to DigitalFoodStreet to pre-order campus food and collect it with a digital receipt."
		},
		{
			property: "og:title",
			content: "Sign In — DigitalFoodStreet"
		},
		{
			property: "og:description",
			content: "Pre-order campus food and skip the queue."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$19, "component")
});
var $$splitComponentImporter$18 = () => import("./profile-Ci8YOkZM.mjs");
var Route$18 = createFileRoute("/profile")({
	head: () => ({ meta: [
		{ title: "Your Account — DigitalFoodStreet" },
		{
			name: "description",
			content: "Manage your DigitalFoodStreet account, orders and settings."
		},
		{
			property: "og:title",
			content: "Your Account — DigitalFoodStreet"
		},
		{
			property: "og:description",
			content: "Manage your account, orders and settings."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$18, "component")
});
var $$splitComponentImporter$17 = () => import("./shop-login-a8dIBvPz.mjs");
var Route$17 = createFileRoute("/shop-login")({
	head: () => ({ meta: [
		{ title: "Shop Owner Login — DigitalFoodStreet" },
		{
			name: "description",
			content: "Sign in to the DigitalFoodStreet merchant app to manage your campus shop, menu and orders."
		},
		{
			property: "og:title",
			content: "Shop Owner Login — DigitalFoodStreet"
		},
		{
			property: "og:description",
			content: "Manage your campus shop, menu, orders and payments on DigitalFoodStreet."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$17, "component")
});
var $$splitComponentImporter$16 = () => import("./signup-C1aCXLSU.mjs");
var Route$16 = createFileRoute("/signup")({
	head: () => ({ meta: [
		{ title: "Create Account — DigitalFoodStreet" },
		{
			name: "description",
			content: "Create a DigitalFoodStreet account to pre-order campus food, or register as a campus shop owner."
		},
		{
			property: "og:title",
			content: "Create Account — DigitalFoodStreet"
		},
		{
			property: "og:description",
			content: "Join DigitalFoodStreet as a student or shop owner."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
var $$splitComponentImporter$15 = () => import("./shops-Byl1IX18.mjs");
var Route$15 = createFileRoute("/admin/shops")({
	head: () => ({ meta: [{ title: "Admin — Shops" }] }),
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
var $$splitComponentImporter$14 = () => import("./order._receiptId-Ck8lpY_z.mjs");
var Route$14 = createFileRoute("/order/$receiptId")({
	head: () => ({ meta: [
		{ title: "Order Confirmed — DigitalFoodStreet" },
		{
			name: "description",
			content: "Your campus food order is confirmed and being prepared."
		},
		{
			property: "og:title",
			content: "Order Confirmed — DigitalFoodStreet"
		},
		{
			property: "og:description",
			content: "Your order is confirmed and being prepared."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var $$splitComponentImporter$13 = () => import("./receipts.index-cZH-MSyK.mjs");
var Route$13 = createFileRoute("/receipts/")({
	head: () => ({ meta: [
		{ title: "Receipts — DigitalFoodStreet" },
		{
			name: "description",
			content: "Your active and past pickup receipts. Show a receipt at the counter to collect."
		},
		{
			property: "og:title",
			content: "Receipts — DigitalFoodStreet"
		},
		{
			property: "og:description",
			content: "Show your digital receipt at the counter."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = () => import("./receipts._receiptId-jLUGOdQI.mjs");
var Route$12 = createFileRoute("/receipts/$receiptId")({
	head: () => ({ meta: [
		{ title: "Pickup Receipt — DigitalFoodStreet" },
		{
			name: "description",
			content: "Your one-time digital pickup receipt. Counter staff confirm collection."
		},
		{
			property: "og:title",
			content: "Pickup Receipt — DigitalFoodStreet"
		},
		{
			property: "og:description",
			content: "Show this receipt at the counter to collect."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./shop.index-juy0v6N0.mjs");
var Route$11 = createFileRoute("/shop/")({
	head: () => ({ meta: [
		{ title: "Shop Dashboard — DigitalFoodStreet" },
		{
			name: "description",
			content: "Track today's orders, revenue and incoming order queue for your campus shop on DigitalFoodStreet."
		},
		{
			property: "og:title",
			content: "Shop Dashboard — DigitalFoodStreet"
		},
		{
			property: "og:description",
			content: "Track today's orders, revenue and the live order queue for your campus shop."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("./shop._shopId-DmcnKl9y.mjs");
var Route$10 = createFileRoute("/shop/$shopId")({
	head: () => {
		const name = "Shop";
		return { meta: [
			{ title: `${name} — DigitalFoodStreet` },
			{
				name: "description",
				content: `Browse the ${name} menu and pre-order for campus pickup on DigitalFoodStreet.`
			},
			{
				property: "og:title",
				content: `${name} — DigitalFoodStreet`
			},
			{
				property: "og:description",
				content: `Pre-order from ${name} and skip the queue.`
			}
		] };
	},
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./shop.analytics-DdIQywlF.mjs");
var Route$9 = createFileRoute("/shop/analytics")({
	head: () => ({ meta: [
		{ title: "Analytics — DigitalFoodStreet Shop" },
		{
			name: "description",
			content: "See daily and weekly orders, revenue and your most popular items on DigitalFoodStreet."
		},
		{
			property: "og:title",
			content: "Analytics — DigitalFoodStreet Shop"
		},
		{
			property: "og:description",
			content: "Daily and weekly orders, revenue and your most popular items."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./shop.change-password-Nuhon3WM.mjs");
var Route$8 = createFileRoute("/shop/change-password")({
	head: () => ({ meta: [{ title: "Secure Your Account — DigitalFoodStreet" }, {
		name: "robots",
		content: "noindex"
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./shop.customers-ELwMvTP9.mjs");
var Route$7 = createFileRoute("/shop/customers")({
	head: () => ({ meta: [
		{ title: "Customers — DigitalFoodStreet Shop" },
		{
			name: "description",
			content: "See how students order from your shop: order counts, total spend and most recent order."
		},
		{
			property: "og:title",
			content: "Customers — DigitalFoodStreet Shop"
		},
		{
			property: "og:description",
			content: "Order counts, total spend and recent activity for your shop's customers."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./shop.menu-xwq549LT.mjs");
var Route$6 = createFileRoute("/shop/menu")({
	head: () => ({ meta: [
		{ title: "Menu Management — DigitalFoodStreet Shop" },
		{
			name: "description",
			content: "Add, edit, price and organise the food items and categories on your DigitalFoodStreet shop menu."
		},
		{
			property: "og:title",
			content: "Menu Management — DigitalFoodStreet Shop"
		},
		{
			property: "og:description",
			content: "Add, edit and organise the items and categories on your shop menu."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./shop.orders-COkc-T1E.mjs");
var Route$5 = createFileRoute("/shop/orders")({
	head: () => ({ meta: [
		{ title: "Orders — DigitalFoodStreet Shop" },
		{
			name: "description",
			content: "Manage new, preparing, ready and completed orders for your campus shop on DigitalFoodStreet."
		},
		{
			property: "og:title",
			content: "Orders — DigitalFoodStreet Shop"
		},
		{
			property: "og:description",
			content: "Manage the full order queue for your campus shop."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./shop.payments-n928_T3c.mjs");
var Route$4 = createFileRoute("/shop/payments")({
	head: () => ({ meta: [
		{ title: "Payment Account — DigitalFoodStreet Shop" },
		{
			name: "description",
			content: "Connect your shop's own payment account to receive payouts for orders placed through DigitalFoodStreet."
		},
		{
			property: "og:title",
			content: "Payment Account — DigitalFoodStreet Shop"
		},
		{
			property: "og:description",
			content: "Connect your shop's own payment account to receive order payouts."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./shop.printer-DAUVK36N.mjs");
var Route$3 = createFileRoute("/shop/printer")({
	head: () => ({ meta: [{ title: "Printer Management — DigitalFoodStreet Shop" }, {
		name: "robots",
		content: "noindex"
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./shop.receipts-deJk2Nho.mjs");
var Route$2 = createFileRoute("/shop/receipts")({
	head: () => ({ meta: [
		{ title: "Pickup Receipts — DigitalFoodStreet Shop" },
		{
			name: "description",
			content: "Confirm student pickups by redeeming their one-time digital receipt at your counter."
		},
		{
			property: "og:title",
			content: "Pickup Receipts — DigitalFoodStreet Shop"
		},
		{
			property: "og:description",
			content: "Redeem one-time pickup receipts securely at the counter."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./shop.settings-D35raBWV.mjs");
var Route$1 = createFileRoute("/shop/settings")({
	head: () => ({ meta: [
		{ title: "Shop Settings — DigitalFoodStreet" },
		{
			name: "description",
			content: "Update your shop's basic information, branding, opening hours, contact details and availability."
		},
		{
			property: "og:title",
			content: "Shop Settings — DigitalFoodStreet"
		},
		{
			property: "og:description",
			content: "Update basic information, branding, hours, contact details and availability."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./shops.create-C55F6z69.mjs");
var Route = createFileRoute("/admin/shops/create")({
	head: () => ({ meta: [{ title: "Create Shop & Owner — Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var IndexRoute = Route$26.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$27
});
var AdminRoute = Route$25.update({
	id: "/admin",
	path: "/admin",
	getParentRoute: () => Route$27
});
var CartRoute = Route$24.update({
	id: "/cart",
	path: "/cart",
	getParentRoute: () => Route$27
});
var CheckoutRoute = Route$23.update({
	id: "/checkout",
	path: "/checkout",
	getParentRoute: () => Route$27
});
var CreateShopRoute = Route$22.update({
	id: "/create-shop",
	path: "/create-shop",
	getParentRoute: () => Route$27
});
var FavouritesRoute = Route$21.update({
	id: "/favourites",
	path: "/favourites",
	getParentRoute: () => Route$27
});
var ForgotPasswordRoute = Route$20.update({
	id: "/forgot-password",
	path: "/forgot-password",
	getParentRoute: () => Route$27
});
var LoginRoute = Route$19.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => Route$27
});
var ProfileRoute = Route$18.update({
	id: "/profile",
	path: "/profile",
	getParentRoute: () => Route$27
});
var ShopLoginRoute = Route$17.update({
	id: "/shop-login",
	path: "/shop-login",
	getParentRoute: () => Route$27
});
var SignupRoute = Route$16.update({
	id: "/signup",
	path: "/signup",
	getParentRoute: () => Route$27
});
var AdminShopsRoute = Route$15.update({
	id: "/shops",
	path: "/shops",
	getParentRoute: () => AdminRoute
});
var OrderReceiptIdRoute = Route$14.update({
	id: "/order/$receiptId",
	path: "/order/$receiptId",
	getParentRoute: () => Route$27
});
var ReceiptsIndexRoute = Route$13.update({
	id: "/receipts/",
	path: "/receipts/",
	getParentRoute: () => Route$27
});
var ReceiptsReceiptIdRoute = Route$12.update({
	id: "/receipts/$receiptId",
	path: "/receipts/$receiptId",
	getParentRoute: () => Route$27
});
var ShopIndexRoute = Route$11.update({
	id: "/shop/",
	path: "/shop/",
	getParentRoute: () => Route$27
});
var ShopShopIdRoute = Route$10.update({
	id: "/shop/$shopId",
	path: "/shop/$shopId",
	getParentRoute: () => Route$27
});
var ShopAnalyticsRoute = Route$9.update({
	id: "/shop/analytics",
	path: "/shop/analytics",
	getParentRoute: () => Route$27
});
var ShopChangePasswordRoute = Route$8.update({
	id: "/shop/change-password",
	path: "/shop/change-password",
	getParentRoute: () => Route$27
});
var ShopCustomersRoute = Route$7.update({
	id: "/shop/customers",
	path: "/shop/customers",
	getParentRoute: () => Route$27
});
var ShopMenuRoute = Route$6.update({
	id: "/shop/menu",
	path: "/shop/menu",
	getParentRoute: () => Route$27
});
var ShopOrdersRoute = Route$5.update({
	id: "/shop/orders",
	path: "/shop/orders",
	getParentRoute: () => Route$27
});
var ShopPaymentsRoute = Route$4.update({
	id: "/shop/payments",
	path: "/shop/payments",
	getParentRoute: () => Route$27
});
var ShopPrinterRoute = Route$3.update({
	id: "/shop/printer",
	path: "/shop/printer",
	getParentRoute: () => Route$27
});
var ShopReceiptsRoute = Route$2.update({
	id: "/shop/receipts",
	path: "/shop/receipts",
	getParentRoute: () => Route$27
});
var ShopSettingsRoute = Route$1.update({
	id: "/shop/settings",
	path: "/shop/settings",
	getParentRoute: () => Route$27
});
var AdminShopsRouteChildren = { AdminShopsCreateRoute: Route.update({
	id: "/create",
	path: "/create",
	getParentRoute: () => AdminShopsRoute
}) };
var AdminRouteChildren = { AdminShopsRoute: AdminShopsRoute._addFileChildren(AdminShopsRouteChildren) };
var rootRouteChildren = {
	IndexRoute,
	AdminRoute: AdminRoute._addFileChildren(AdminRouteChildren),
	CartRoute,
	CheckoutRoute,
	CreateShopRoute,
	FavouritesRoute,
	ForgotPasswordRoute,
	LoginRoute,
	ProfileRoute,
	ShopLoginRoute,
	SignupRoute,
	OrderReceiptIdRoute,
	ReceiptsReceiptIdRoute,
	ShopShopIdRoute,
	ShopAnalyticsRoute,
	ShopChangePasswordRoute,
	ShopCustomersRoute,
	ShopMenuRoute,
	ShopOrdersRoute,
	ShopPaymentsRoute,
	ShopPrinterRoute,
	ShopReceiptsRoute,
	ShopSettingsRoute,
	ReceiptsIndexRoute,
	ShopIndexRoute
};
var routeTree = Route$27._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter as a, Route$14 as i, Route$10 as n, router_exports as o, Route$12 as r, MerchantShell as t };
