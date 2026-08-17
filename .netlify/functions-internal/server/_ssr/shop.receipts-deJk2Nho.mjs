import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { k as CircleCheck, m as ScanLine } from "../_libs/lucide-react.mjs";
import { c as SectionHeading, f as TextInput, i as Field, n as Card, t as Button } from "./MerchantUI-IaaBvX-G.mjs";
import { r as useMerchant } from "./router-BGLoriXd.mjs";
import { t as MerchantShell } from "./router-BGLoriXd2.mjs";
import { a as where, i as query, n as onSnapshot, o as collection, r as orderBy, t as limit } from "../_libs/@firebase/firestore+[...].mjs";
import "../_libs/firebase.mjs";
import { n as httpsCallable } from "../_libs/firebase__functions.mjs";
import { n as getDb, r as getFns, t as friendlyError } from "./errors-Ct_9Ydee.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shop.receipts-deJk2Nho.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var receiptsCol = () => collection(getDb(), "receipts");
function subscribeShopReceipts(shopId, onData, onError) {
	return onSnapshot(query(receiptsCol(), where("shopId", "==", shopId), orderBy("createdAt", "desc"), limit(100)), (snap) => onData(snap.docs.map((d) => d.data())), (err) => onError(friendlyError(err, "Unable to load receipts.")));
}
/**
* One-time redemption.
*
* The swipe is only a gesture — this callable is the security boundary. It runs
* an atomic transaction server-side, so two simultaneous swipes can never both
* succeed and a redeemed receipt can never return to ACTIVE.
*/
async function redeemReceipt(input) {
	const payload = typeof input === "string" ? { receiptId: input } : input;
	try {
		return (await httpsCallable(getFns(), "redeemReceipt")(payload)).data;
	} catch (err) {
		if (String(err?.code ?? "").includes("failed-precondition")) throw new Error("Receipt already used.");
		throw new Error(friendlyError(err, "We couldn't confirm this pickup."));
	}
}
var time = (value) => {
	const t = value;
	const d = t && typeof t.toDate === "function" ? t.toDate() : null;
	return d ? d.toLocaleTimeString([], {
		hour: "numeric",
		minute: "2-digit"
	}) : "—";
};
function ShopReceiptsPage() {
	const { activeShop } = useMerchant();
	const [receipts, setReceipts] = (0, import_react.useState)([]);
	const [code, setCode] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!activeShop) return;
		return subscribeShopReceipts(activeShop.id, setReceipts, (m) => toast.error(m));
	}, [activeShop]);
	const redeem = async (input) => {
		const key = input.receiptId ?? input.receiptNumber ?? "";
		setBusy(key);
		try {
			await redeemReceipt(input);
			toast.success("Pickup confirmed");
			setCode("");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "We couldn't confirm this pickup.");
		} finally {
			setBusy(null);
		}
	};
	const active = receipts.filter((r) => r.status !== "REDEEMED");
	const done = receipts.filter((r) => r.status === "REDEEMED").slice(0, 10);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MerchantShell, {
		title: "Pickup receipts",
		subtitle: "Each receipt can be redeemed exactly once, and only by this shop.",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-accent-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanLine, { size: 20 })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-base font-semibold",
					children: "Redeem by receipt number"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 text-sm text-muted-foreground",
					children: "Type the number shown on the student's phone."
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-4 space-y-3",
				onSubmit: (e) => {
					e.preventDefault();
					const value = code.trim().toUpperCase();
					if (!value) return;
					redeem({ receiptNumber: value });
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Receipt number",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
						value: code,
						onChange: (e) => setCode(e.target.value.toUpperCase()),
						placeholder: "FS-000123",
						autoComplete: "off",
						className: "font-mono tracking-[0.14em]"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					className: "w-full",
					disabled: busy !== null || !code.trim(),
					children: busy ? "Confirming…" : "Confirm pickup"
				})]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
				title: "Awaiting pickup",
				description: `${active.length} paid ${active.length === 1 ? "receipt" : "receipts"} ready to collect.`
			}), active.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "No receipts waiting right now."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: active.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.li, {
					initial: {
						opacity: 0,
						y: 8
					},
					animate: {
						opacity: 1,
						y: 0
					},
					transition: { duration: .2 },
					className: "flex items-center justify-between gap-3 rounded-xl bg-secondary p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-sm font-bold tracking-[0.12em]",
							children: r.receiptNumber
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								r.counter,
								" · ",
								time(r.createdAt)
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						disabled: busy !== null,
						onClick: () => void redeem({ receiptId: r.receiptId }),
						children: busy === r.receiptId ? "Confirming…" : "Redeem"
					})]
				}, r.receiptId))
			})] })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "mt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
				title: "Recently collected",
				description: "Redeemed receipts cannot be reused."
			}), done.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Nothing collected yet today."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: done.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between rounded-xl border border-border p-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono font-semibold tracking-[0.12em]",
						children: r.receiptNumber
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1.5 text-xs font-semibold text-success",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 14 }),
							" Collected ",
							time(r.redeemedAt)
						]
					})]
				}, r.receiptId))
			})]
		})]
	});
}
//#endregion
export { ShopReceiptsPage as component };
