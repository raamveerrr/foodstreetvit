import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { i as Wallet } from "../_libs/lucide-react.mjs";
import { t as BackBar } from "./BackBar-C2z7hzFf.mjs";
import { S as useAuth, v as useStore } from "./router-BGLoriXd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/checkout-GlAOA_eP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STEP_LABEL = {
	idle: "Processing…",
	validating: "Checking your items…",
	creating: "Starting secure payment…",
	paying: "Complete payment in the window…",
	verifying: "Confirming your payment…"
};
function CheckoutPage() {
	const navigate = useNavigate();
	const { cartItems, cartShopName, subtotal, discount, total, placeOrder, checkoutStep } = useStore();
	const { ready, profile, firebaseUser } = useAuth();
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [verifying, setVerifying] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (ready && !firebaseUser) {
			toast.error("Please sign in to checkout");
			navigate({
				to: "/login",
				replace: true
			});
		}
	}, [
		ready,
		firebaseUser,
		navigate
	]);
	(0, import_react.useEffect)(() => {
		const searchParams = new URLSearchParams(window.location.search);
		const cfOrderId = searchParams.get("cf_order_id");
		const cfVerify = searchParams.get("cf_verify");
		if (cfOrderId && cfVerify === "true" && ready && firebaseUser) verifyReturnPayment(cfOrderId);
	}, [ready, firebaseUser]);
	const verifyReturnPayment = async (orderId) => {
		if (verifying) return;
		setVerifying(true);
		setLoading(true);
		let success = false;
		try {
			const { supabase } = await import("../_libs/_.mjs").then((n) => n.r);
			const { data: verRes, error } = await supabase.functions.invoke("verify-cashfree-payment", { body: { cashfreeOrderId: orderId } });
			if (error || !verRes || !verRes.success) {
				toast.error(verRes?.message || "Payment verification failed.");
				return;
			}
			if (verRes.order_status === "PAID" && verRes.receipt_id) {
				toast.success("Payment verified! Receipt ready.");
				success = true;
				navigate({
					to: "/order/$receiptId",
					params: { receiptId: verRes.receipt_id },
					replace: true
				});
			} else toast.error("Payment status is: " + verRes.order_status);
		} catch (e) {
			toast.error("Payment Verification Error");
		} finally {
			setLoading(false);
			if (!success) {
				setVerifying(false);
				navigate({
					to: "/checkout",
					replace: true
				});
			}
		}
	};
	if (!ready || !firebaseUser) return null;
	const pay = async () => {
		if (loading) return;
		setLoading(true);
		try {
			const result = await placeOrder();
			if (result?.receiptId) {
				toast.success("Order confirmed · Receipt ready");
				navigate({
					to: "/order/$receiptId",
					params: { receiptId: result.receiptId }
				});
			}
		} finally {}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pb-40",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BackBar, { title: "Checkout" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 space-y-3 px-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl bg-card p-4 shadow-card",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
								children: "Pickup from"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-base font-semibold",
								children: cartShopName ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: "Campus pickup only · Show your receipt at the counter"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl bg-card p-4 shadow-card",
						children: [cartItems.map(({ item, qty }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between py-1 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted-foreground",
								children: [
									item.name,
									" × ",
									qty
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-medium",
								children: ["₹", item.price * qty]
							})]
						}, item.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 space-y-1.5 border-t border-dashed border-border pt-3 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Subtotal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["₹", subtotal] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Campus discount" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-success",
										children: ["−₹", discount]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between pt-1 text-base font-bold",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["₹", total] })]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-1 text-[11px] leading-relaxed text-muted-foreground",
						children: "Your total is calculated and verified on our servers. Your receipt is issued only after the payment is confirmed by Cashfree."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3 rounded-2xl bg-card p-4 shadow-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-accent-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { size: 18 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold",
							children: "Pay securely with Cashfree"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "UPI · Cards · Netbanking · Wallets"
						})] })]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-x-0 bottom-[72px] z-30 safe-bottom",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "app-shell border-t border-border bg-surface px-5 pb-3 pt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.button, {
						whileTap: { scale: .98 },
						onClick: () => void pay(),
						disabled: loading || verifying || cartItems.length === 0,
						className: "min-h-[52px] w-full rounded-2xl bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-60",
						children: verifying ? "Confirming your payment…" : loading ? STEP_LABEL[checkoutStep] : `Pay ₹${total} securely`
					})
				})
			})
		]
	});
}
//#endregion
export { CheckoutPage as component };
