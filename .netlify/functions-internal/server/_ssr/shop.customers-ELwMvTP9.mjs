import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { a as MerchantEmpty, n as Card } from "./MerchantUI-IaaBvX-G.mjs";
import { c as formatMoney, r as useMerchant } from "./router-BGLoriXd.mjs";
import { t as MerchantShell } from "./router-BGLoriXd2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shop.customers-ELwMvTP9.js
var import_jsx_runtime = require_jsx_runtime();
function CustomersPage() {
	const { activeShop } = useMerchant();
	const customers = activeShop?.customers ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MerchantShell, {
		title: "Customers",
		subtitle: "Ordering activity through your shop. No personal contact details are shown.",
		children: customers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MerchantEmpty, {
			title: "No customers yet.",
			description: "Customer activity appears after your first orders."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "p-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "divide-y divide-border",
				children: customers.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.li, {
					initial: {
						opacity: 0,
						y: 6
					},
					animate: {
						opacity: 1,
						y: 0
					},
					transition: {
						duration: .2,
						delay: i * .03
					},
					className: "flex items-center gap-3 px-4 py-3.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-bold text-accent-foreground",
							children: c.initials
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm font-semibold",
								children: c.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: [
									c.orders,
									" orders · last order ",
									c.lastOrder.toLowerCase()
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-bold",
							children: formatMoney(c.spent)
						})
					]
				}, c.id))
			})
		})
	});
}
//#endregion
export { CustomersPage as component };
