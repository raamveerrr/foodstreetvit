import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { E as CreditCard, d as ShieldCheck } from "../_libs/lucide-react.mjs";
import { c as SectionHeading, n as Card, t as Button } from "./MerchantUI-IaaBvX-G.mjs";
import { c as formatMoney, r as useMerchant } from "./router-BGLoriXd.mjs";
import { t as MerchantShell } from "./router-BGLoriXd2.mjs";
import "../_libs/firebase.mjs";
import { n as httpsCallable } from "../_libs/firebase__functions.mjs";
import { r as getFns, t as friendlyError } from "./errors-Ct_9Ydee.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shop.payments-n928_T3c.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Payout onboarding.
*
* The browser never sees or sends gateway credentials — this callable asks the
* Cloud Function to register the shop as its own payout vendor, so money for
* this shop's orders settles to this shop.
*/
async function connectShopPayouts(shopId) {
	try {
		return (await httpsCallable(getFns(), "connectShopPayouts")({ shopId })).data;
	} catch (err) {
		throw new Error(friendlyError(err, "We couldn't connect your payment account."));
	}
}
function PaymentsPage() {
	const { activeShop } = useMerchant();
	const [busy, setBusy] = (0, import_react.useState)(false);
	const connected = activeShop?.paymentConnected ?? false;
	const vendorId = activeShop?.vendorId ?? null;
	const maskedVendor = vendorId ? `••••${vendorId.slice(-4)}` : "—";
	const earned = (activeShop?.orders ?? []).filter((o) => o.status === "COMPLETED").reduce((n, o) => n + o.total, 0);
	const connect = async () => {
		if (!activeShop) return;
		setBusy(true);
		try {
			await connectShopPayouts(activeShop.id);
			toast.success("Payment account connected");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "We couldn't connect your account.");
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MerchantShell, {
		title: "Payments",
		subtitle: `Each shop has its own payment account. Managing ${activeShop?.name ?? "shop"}.`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-accent-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { size: 20 })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-base font-semibold",
							children: "Payment Account"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 text-sm text-muted-foreground",
							children: connected ? "Connected" : "Not connected"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm text-muted-foreground",
					children: "Connect your payment account to receive payments for orders placed through DigitalFoodStreet. Payouts settle directly to this shop, never to a shared account."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-5 w-full",
					disabled: busy || connected,
					onClick: () => void connect(),
					children: busy ? "Connecting…" : connected ? "Payment Account Connected" : "Connect Payment Account"
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
					title: "Payout summary",
					description: "Settlements are handled by Cashfree Easy Split."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "space-y-2 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted-foreground",
								children: "Collected today"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "font-semibold",
								children: formatMoney(earned)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted-foreground",
								children: "Pending payout"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "font-semibold",
								children: connected ? formatMoney(earned) : "—"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted-foreground",
								children: "Payout schedule"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "font-semibold",
								children: connected ? "Daily" : "Not set"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted-foreground",
								children: "Vendor ID"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "font-mono font-semibold",
								children: maskedVendor
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted-foreground",
								children: "Settlement status"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "font-semibold",
								children: activeShop?.vendorStatus ?? "Not connected"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex items-start gap-2 rounded-xl bg-secondary p-3 text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
						size: 16,
						className: "mt-0.5 shrink-0"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "We never ask for payment secret keys in the app. Merchant credentials will be handled securely on the backend in a later phase." })]
				})
			] })]
		})
	});
}
//#endregion
export { PaymentsPage as component };
