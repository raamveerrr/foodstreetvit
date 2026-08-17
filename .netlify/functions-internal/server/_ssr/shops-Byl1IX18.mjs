import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link, l as useLocation, p as Outlet } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Card, t as Button } from "./MerchantUI-IaaBvX-G.mjs";
import { S as useAuth, T as supabase } from "./router-BGLoriXd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shops-Byl1IX18.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminShopsPage() {
	const { profile, ready, firebaseUser } = useAuth();
	const [shops, setShops] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const location = useLocation();
	const debug = { timestamp: "hydration-safe" };
	(0, import_react.useEffect)(() => {
		if (!ready || !profile || profile.role !== "SUPER_ADMIN") {
			setLoading(false);
			return;
		}
		(async () => {
			try {
				const { data, error } = await supabase.from("shops").select("*").order("created_at", { ascending: false });
				if (error) console.error("Failed to fetch shops:", error);
				else setShops(data ?? []);
			} catch (err) {
				console.error("Error fetching shops:", err);
			} finally {
				setLoading(false);
			}
		})();
	}, [profile, ready]);
	async function handleDeleteShop(shopId, shopName) {
		if (!confirm(`Are you sure you want to permanently delete "${shopName}" and all of its associated data?`)) return;
		try {
			const { error } = await supabase.from("shops").delete().eq("id", shopId);
			if (error) throw error;
			setShops(shops.filter((s) => s.id !== shopId));
			alert("Shop deleted successfully.");
		} catch (error) {
			console.error("Failed to delete shop:", error);
			alert(`Failed to delete shop: ${error.message}`);
		}
	}
	if (location.pathname !== "/admin/shops") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-4xl px-4 pb-16 pt-6 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					padding: "20px",
					backgroundColor: "#f0f0f0",
					borderRadius: "8px",
					marginBottom: "20px"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						style: {
							marginBottom: "10px",
							fontWeight: "bold",
							color: "#333"
						},
						children: "DEBUG INFO"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						style: {
							fontSize: "14px",
							color: "#666",
							marginBottom: "5px"
						},
						children: ["Timestamp: ", debug.timestamp]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						style: {
							fontSize: "14px",
							color: "#666",
							marginBottom: "5px"
						},
						children: ["Ready: ", String(ready)]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						style: {
							fontSize: "14px",
							color: "#666",
							marginBottom: "5px"
						},
						children: ["Has FirebaseUser: ", Boolean(firebaseUser)]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						style: {
							fontSize: "14px",
							color: "#666",
							marginBottom: "5px"
						},
						children: ["Has Profile: ", Boolean(profile)]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						style: {
							fontSize: "14px",
							color: "#666",
							marginBottom: "5px"
						},
						children: ["Role: ", profile?.role || "undefined"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
						style: {
							marginTop: "10px",
							padding: "10px",
							backgroundColor: "white",
							borderRadius: "4px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
							style: {
								cursor: "pointer",
								fontWeight: "bold"
							},
							children: "Full Profile JSON"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
							style: {
								marginTop: "10px",
								fontSize: "12px",
								overflow: "auto"
							},
							children: JSON.stringify(profile, null, 2)
						})]
					})
				]
			}),
			!ready && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				style: {
					padding: "20px",
					color: "#666"
				},
				children: "⏳ Loading authentication..."
			}),
			ready && !firebaseUser && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				style: {
					padding: "20px",
					color: "#d32f2f"
				},
				children: "❌ Not signed in"
			}),
			ready && firebaseUser && !profile && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				style: {
					padding: "20px",
					color: "#ff9800"
				},
				children: "⏳ Loading profile..."
			}),
			ready && profile && profile.role !== "SUPER_ADMIN" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				style: {
					padding: "20px",
					color: "#d32f2f"
				},
				children: ["❌ Access denied. Your role is: ", profile.role]
			}),
			ready && profile && profile.role === "SUPER_ADMIN" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					marginBottom: "20px",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					style: {
						fontSize: "24px",
						fontWeight: "bold",
						margin: 0
					},
					children: "Shops"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/admin/shops/create",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { children: "Create Shop & Owner" })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "grid",
					gap: "12px"
				},
				children: [
					loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						style: { color: "#999" },
						children: "Loading shops..."
					}),
					!loading && shops.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						style: { color: "#999" },
						children: "No shops yet. Create your first shop."
					}),
					shops.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "p-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								style: {
									fontWeight: "bold",
									margin: "0 0 5px 0"
								},
								children: s.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								style: {
									fontSize: "14px",
									color: "#999",
									margin: 0
								},
								children: ["Owner UID: ", s.owner_uid]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									flexDirection: "column",
									alignItems: "flex-end",
									gap: "8px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: "14px",
										color: "#999"
									},
									children: new Date(s.created_at).toLocaleString()
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									onClick: () => handleDeleteShop(s.id, s.name),
									className: "h-8 border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground px-3 text-xs",
									children: "Delete Shop"
								})]
							})]
						})
					}, s.id))
				]
			})] })
		]
	});
}
//#endregion
export { AdminShopsPage as component };
