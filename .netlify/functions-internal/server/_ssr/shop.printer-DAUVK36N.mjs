import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { _ as Printer, c as Trash2, h as RefreshCw, n as Wifi, r as WifiOff, v as Plus } from "../_libs/lucide-react.mjs";
import { c as SectionHeading, n as Card, t as Button } from "./MerchantUI-IaaBvX-G.mjs";
import { T as supabase, d as cn, r as useMerchant } from "./router-BGLoriXd.mjs";
import { t as MerchantShell } from "./router-BGLoriXd2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shop.printer-DAUVK36N.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function StatusBadge({ status }) {
	const isOnline = status === "ONLINE" || status === "PRINTING";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase", isOnline ? "bg-success-soft text-success" : "bg-secondary text-muted-foreground"),
		children: [isOnline ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { size: 10 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WifiOff, { size: 10 }), isOnline ? "Online" : "Offline"]
	});
}
function JobStatusBadge({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", {
			QUEUED: "bg-blue-500/10 text-blue-400",
			PRINTING: "bg-success-soft text-success",
			PRINTED: "bg-secondary text-muted-foreground",
			FAILED: "bg-destructive/10 text-destructive",
			CANCELLED: "bg-secondary text-muted-foreground"
		}[status] || ""),
		children: status
	});
}
function PrinterPage() {
	const { activeShop } = useMerchant();
	const shopId = activeShop?.id;
	const [printers, setPrinters] = (0, import_react.useState)([]);
	const [jobs, setJobs] = (0, import_react.useState)([]);
	const [pairingCode, setPairingCode] = (0, import_react.useState)(null);
	const [newPrinterId, setNewPrinterId] = (0, import_react.useState)(null);
	const [loadingPair, setLoadingPair] = (0, import_react.useState)(false);
	const [loadingTest, setLoadingTest] = (0, import_react.useState)(null);
	const [refreshing, setRefreshing] = (0, import_react.useState)(false);
	const fetchData = (0, import_react.useCallback)(async () => {
		if (!shopId) return;
		setRefreshing(true);
		const { data: p } = await supabase.from("printers").select("id, name, connection_type, status, last_seen_at").eq("shop_id", shopId).order("last_seen_at", { ascending: false });
		const { data: j } = await supabase.from("print_jobs").select(`
        id, status, is_test, created_at,
        orders ( order_number, receipts ( receipt_number ) )
      `).eq("shop_id", shopId).order("created_at", { ascending: false }).limit(20);
		setPrinters(p ?? []);
		setJobs(j ?? []);
		setRefreshing(false);
	}, [shopId]);
	(0, import_react.useEffect)(() => {
		fetchData();
		const channel = supabase.channel(`printer-dashboard-${shopId}`).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "print_jobs",
			filter: `shop_id=eq.${shopId}`
		}, fetchData).on("postgres_changes", {
			event: "UPDATE",
			schema: "public",
			table: "printers",
			filter: `shop_id=eq.${shopId}`
		}, fetchData).subscribe();
		return () => {
			supabase.removeChannel(channel);
		};
	}, [shopId, fetchData]);
	async function handleGeneratePairingCode() {
		if (!shopId) return;
		setLoadingPair(true);
		setPairingCode(null);
		setNewPrinterId(null);
		if (!(await supabase.auth.getSession()).data.session?.access_token) {
			toast.error("Not authenticated");
			setLoadingPair(false);
			return;
		}
		const { data: resp, error } = await supabase.functions.invoke("generate-printer-pairing-code", { body: {
			shop_id: shopId,
			printer_name: "Thermal Printer",
			connection_type: "USB"
		} });
		if (error || !resp?.success) toast.error(resp?.message || "Failed to generate pairing code");
		else {
			setPairingCode(resp.pairing_code);
			setNewPrinterId(resp.printer_id);
			toast.success("Pairing code generated! Valid for 10 minutes.");
			await fetchData();
		}
		setLoadingPair(false);
	}
	async function handleTestPrint(printerId) {
		if (!shopId) return;
		setLoadingTest(printerId ?? "any");
		const { data: resp, error } = await supabase.functions.invoke("create-test-print-job", { body: {
			shop_id: shopId,
			printer_id: printerId
		} });
		if (error || !resp?.success) toast.error(resp?.message || "Failed to queue test print");
		else {
			toast.success("Test print queued! The printer will print shortly.");
			await fetchData();
		}
		setLoadingTest(null);
	}
	async function handleCancelJob(jobId) {
		await supabase.from("print_jobs").update({ status: "CANCELLED" }).eq("id", jobId).in("status", ["QUEUED"]);
		await fetchData();
		toast.success("Job cancelled");
	}
	async function handleDeletePrinter(id) {
		if (!confirm("Are you sure you want to remove this printer? The connected Print Agent will be unlinked automatically.")) return;
		await supabase.from("printers").delete().eq("id", id);
		toast.success("Printer deleted");
		await fetchData();
	}
	if (!shopId) return null;
	const activeJobs = jobs.filter((j) => ["QUEUED", "PRINTING"].includes(j.status));
	const recentJobs = jobs.filter((j) => !["QUEUED", "PRINTING"].includes(j.status)).slice(0, 8);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MerchantShell, {
		title: "Printer Management",
		subtitle: "Pair thermal printers and monitor print queues.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
					title: "Printers",
					description: "USB thermal printers paired to this shop."
				}), printers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "text-center py-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, {
							size: 28,
							className: "mx-auto text-muted-foreground mb-2"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: "No printer paired yet."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground mt-1",
							children: "Generate a pairing code and enter it in the Print Agent."
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-3",
					children: printers.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", p.status === "ONLINE" || p.status === "PRINTING" ? "bg-success-soft" : "bg-secondary"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { size: 16 })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-semibold",
									children: p.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: [
										p.connection_type,
										" ·",
										" ",
										p.last_seen_at ? `Last seen ${new Date(p.last_seen_at).toLocaleTimeString("en-IN")}` : "Never connected"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-0.5 text-[10px] font-mono text-muted-foreground/60",
									children: ["ID: ", p.id]
								})
							] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col items-end gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: p.status }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									className: "h-7 px-3 text-[11px]",
									onClick: () => handleTestPrint(p.id),
									disabled: loadingTest === p.id,
									children: loadingTest === p.id ? "Queuing…" : "Test Print"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => handleDeletePrinter(p.id),
									className: "text-muted-foreground hover:text-destructive transition-colors flex h-7 items-center px-1",
									title: "Delete Printer",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { size: 14 })
								})]
							})]
						})]
					}, p.id))
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
					title: "Pair New Printer",
					description: "Generate a one-time code to pair the Windows Print Agent."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "space-y-4",
					children: pairingCode ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center py-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground mb-1",
								children: "Enter this code in the Print Agent:"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-4xl font-bold tracking-[0.2em] text-primary",
								children: pairingCode
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground mt-2",
								children: "Valid for 10 minutes"
							}),
							newPrinterId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 bg-secondary/40 rounded-lg px-3 py-2 text-left",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-muted-foreground",
									children: "Printer ID (copy to Print Agent):"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-mono text-xs font-semibold mt-0.5 break-all",
									children: newPrinterId
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								className: "mt-4 w-full",
								onClick: () => {
									setPairingCode(null);
									setNewPrinterId(null);
								},
								children: "Done"
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "w-full",
						onClick: handleGeneratePairingCode,
						disabled: loadingPair,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
							size: 15,
							className: "mr-1.5"
						}), loadingPair ? "Generating…" : "Generate Pairing Code"]
					})
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between mb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
						title: "Print Queue",
						description: activeJobs.length ? `${activeJobs.length} job(s) pending` : "Queue is empty."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: fetchData,
						className: "flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground",
						disabled: refreshing,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {
							size: 12,
							className: refreshing ? "animate-spin" : ""
						}), "Refresh"]
					})]
				}), activeJobs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground px-1",
					children: "No jobs in queue."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2",
					children: activeJobs.map((j) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "flex items-center justify-between gap-3 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold",
							children: j.is_test ? "🖨 TEST PRINT" : j.orders?.[0]?.receipts?.[0]?.receipt_number || `Order #${j.orders?.[0]?.order_number}`
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: new Date(j.created_at).toLocaleTimeString("en-IN")
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(JobStatusBadge, { status: j.status }), j.status === "QUEUED" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => handleCancelJob(j.id),
								className: "text-muted-foreground hover:text-destructive transition-colors",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { size: 14 })
							})]
						})]
					}, j.id))
				})] }),
				recentJobs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
					title: "Recent History",
					description: "Last printed receipts."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2",
					children: recentJobs.map((j) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "flex items-center justify-between gap-3 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm",
							children: j.is_test ? "TEST PRINT" : j.orders?.[0]?.receipts?.[0]?.receipt_number || `Order #${j.orders?.[0]?.order_number}`
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: new Date(j.created_at).toLocaleString("en-IN", { hour12: true })
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JobStatusBadge, { status: j.status })]
					}, j.id))
				})] })
			]
		})
	});
}
//#endregion
export { PrinterPage as component };
