import { o as __toESM } from "../_runtime.mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { o as router_exports } from "./router-BGLoriXd2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/supabase-oi7IFhKw.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var supabase_exports = /* @__PURE__ */ __exportAll({
	createShopOwnerAndShop: () => createShopOwnerAndShop,
	supabase: () => supabase
});
var supabase = createClient("https://gnkuiljuevvexulwyion.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdua3VpbGp1ZXZ2ZXh1bHd5aW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4OTI0NzUsImV4cCI6MjEwMjQ2ODQ3NX0.DHHcl-7EhpL7ZylhO64p0bf84sTrh7IVAVhKW7gEsF0", { auth: {
	persistSession: true,
	autoRefreshToken: true,
	detectSessionInUrl: true
} });
async function createShopOwnerAndShop(payload) {
	const { data, error } = await supabase.functions.invoke("create-shop-owner-and-shop", { body: payload });
	if (error) {
		if (error) console.dir(error);
		let specificError = "We couldn't create that shop and owner.";
		try {
			if (error && typeof error.context?.text === "function") {
				const bodyText = await error.context.text();
				const bodyJson = JSON.parse(bodyText);
				if (bodyJson.message) specificError = bodyJson.message;
			}
		} catch (e) {}
		throw new Error(specificError);
	}
	const normalised = data ?? {};
	if (normalised.success === false) throw new Error(normalised.message || "We couldn't create that shop and owner.");
	if (normalised.success === true || normalised.shopId || normalised.ownerId || normalised.ownerEmail) return {
		success: true,
		message: normalised.message || "Shop and owner created successfully.",
		shopId: normalised.shopId,
		ownerId: normalised.ownerId,
		shopName: normalised.shopName,
		ownerName: normalised.ownerName,
		ownerEmail: normalised.ownerEmail,
		temporaryPassword: normalised.temporaryPassword
	};
	throw new Error("We couldn't create that shop and owner.");
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/auth-store-CQwxpFwQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var AuthContext = (0, import_react.createContext)(null);
function AuthProvider({ children }) {
	const [ready, setReady] = (0, import_react.useState)(false);
	const [firebaseUser, setFirebaseUser] = (0, import_react.useState)(null);
	const [profile, setProfile] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const loadSession = async () => {
			const { data } = await supabase.auth.getSession();
			const user = data.session?.user ?? null;
			setFirebaseUser(user ? {
				uid: user.id,
				email: user.email ?? null
			} : null);
			if (user) {
				const { data: profileData, error: profileError } = await supabase.from("users").select("*").eq("uid", user.id).single();
				if (profileError && profileError.code !== "PGRST116") console.error("Profile fetch error:", profileError);
				setProfile(profileData ?? null);
			} else setProfile(null);
			setReady(true);
		};
		loadSession();
		const { data: sub } = supabase.auth.onAuthStateChange(async (_, session) => {
			const user = session?.user ?? null;
			setFirebaseUser(user ? {
				uid: user.id,
				email: user.email ?? null
			} : null);
			if (user) {
				const { data: profileData, error: profileError } = await supabase.from("users").select("*").eq("uid", user.id).single();
				if (profileError && profileError.code !== "PGRST116") console.error("Profile fetch error:", profileError);
				setProfile(profileData ?? null);
			} else setProfile(null);
			setReady(true);
		});
		return () => sub.subscription.unsubscribe();
	}, []);
	const signUp = (0, import_react.useCallback)(async ({ name, email, password, phone }) => {
		const { error } = await supabase.auth.signUp({
			email,
			password
		});
		if (error) throw new Error(error.message);
		const { data: userData } = await supabase.auth.getUser();
		const uid = userData.user?.id;
		if (!uid) throw new Error("Account created but user record is unavailable.");
		const { error: insertError } = await supabase.from("users").insert({
			uid,
			name,
			email: email.trim().toLowerCase(),
			phone: phone?.trim() ?? "",
			role: "STUDENT",
			created_at: (/* @__PURE__ */ new Date()).toISOString(),
			updated_at: (/* @__PURE__ */ new Date()).toISOString()
		});
		if (insertError) throw new Error(insertError.message);
	}, []);
	const signIn = (0, import_react.useCallback)(async (emailOrPhone, password) => {
		let response;
		const cleanInput = emailOrPhone.trim();
		if (/^\+?[0-9\s-]{10,15}$/.test(cleanInput.replace(/[\s-]/g, ""))) response = await supabase.auth.signInWithPassword({
			phone: cleanInput,
			password
		});
		else response = await supabase.auth.signInWithPassword({
			email: cleanInput,
			password
		});
		const { data, error } = response;
		if (error) throw new Error(error.message);
		const uid = data.user.id;
		const userEmail = data.user.email;
		console.log("signIn: authenticated user email:", userEmail, "uid:", uid);
		const { data: row, error: rowError } = await supabase.from("users").select("*").eq("uid", uid).single();
		if (rowError && rowError.code === "PGRST116") {
			console.log("signIn: uid not found, trying to fetch by email");
			const { data: emailRow, error: emailError } = await supabase.from("users").select("*").eq("email", userEmail).single();
			if (!emailError && emailRow) {
				console.log("signIn: found existing user with email but different uid, updating uid from", emailRow.uid, "to", uid);
				const { data: updatedRow, error: updateError } = await supabase.from("users").update({ uid }).eq("email", userEmail).select().single();
				if (updateError) {
					console.error("signIn: failed to update uid:", updateError);
					throw new Error("Failed to update user record: " + updateError.message);
				}
				console.log("signIn: updated user profile:", updatedRow);
				return updatedRow ?? null;
			} else if (emailError && emailError.code === "PGRST116") {
				console.log("signIn: user not found, inserting new record");
				const { data: insertData, error: insertError } = await supabase.from("users").insert({
					uid,
					name: userEmail?.split("@")[0] ?? "Unknown",
					email: userEmail ?? "",
					phone: "",
					role: "STUDENT",
					created_at: (/* @__PURE__ */ new Date()).toISOString(),
					updated_at: (/* @__PURE__ */ new Date()).toISOString()
				}).select().single();
				if (insertError) {
					console.error("signIn: failed to insert user:", insertError);
					throw new Error("Failed to create user profile: " + insertError.message);
				}
				console.log("signIn: inserted new user profile:", insertData);
				return insertData ?? null;
			} else {
				console.error("signIn: error fetching by email:", emailError);
				throw new Error("Failed to fetch user profile: " + emailError?.message);
			}
		} else if (rowError) {
			console.error("signIn: error fetching by uid:", rowError);
			throw new Error("Failed to fetch user profile: " + rowError.message);
		}
		console.log("signIn: profile data returned:", row);
		return row ?? null;
	}, []);
	const resetPassword = (0, import_react.useCallback)(async (email) => {
		const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
		if (error) throw new Error(error.message);
	}, []);
	const logout = (0, import_react.useCallback)(async () => {
		const { error } = await supabase.auth.signOut();
		if (error) throw new Error(error.message);
	}, []);
	const signInWithGoogle = (0, import_react.useCallback)(async () => {
		const { error } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: { redirectTo: window.location.origin }
		});
		if (error) throw new Error(error.message);
	}, []);
	const changePassword = (0, import_react.useCallback)(async (newPassword) => {
		if (!firebaseUser) throw new Error("Please sign in and try again.");
		const { error } = await supabase.auth.updateUser({ password: newPassword });
		if (error) throw new Error(error.message);
		const { error: updateError } = await supabase.from("users").update({
			must_change_password: false,
			updated_at: (/* @__PURE__ */ new Date()).toISOString()
		}).eq("uid", firebaseUser.uid);
		if (updateError) throw new Error(updateError.message);
	}, [firebaseUser]);
	const updateOwnProfile = (0, import_react.useCallback)(async (patch) => {
		if (!firebaseUser) throw new Error("Please sign in and try again.");
		const { error } = await supabase.from("users").update({
			...patch,
			updated_at: (/* @__PURE__ */ new Date()).toISOString()
		}).eq("uid", firebaseUser.uid);
		if (error) throw new Error(error.message);
	}, [firebaseUser]);
	const value = (0, import_react.useMemo)(() => ({
		ready,
		firebaseUser,
		profile,
		role: profile?.role ?? null,
		isStudent: profile?.role === "STUDENT",
		isOwner: profile?.role === "SHOP_OWNER" || profile?.role === "SUPER_ADMIN",
		signUp,
		signIn,
		signInWithGoogle,
		resetPassword,
		changePassword,
		logout,
		updateOwnProfile
	}), [
		ready,
		firebaseUser,
		profile,
		signUp,
		signIn,
		signInWithGoogle,
		resetPassword,
		changePassword,
		logout,
		updateOwnProfile
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, {
		value,
		children
	});
}
function useAuth() {
	const ctx = (0, import_react.useContext)(AuthContext);
	if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
	return ctx;
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/supabase-orders-DWcV1dsq.js
/**
* Supabase-backed shop, menu-item and category CRUD + realtime subscriptions.
* Drop-in replacement for firebase/shops.ts.
*/
function rowToShopDoc(r) {
	return {
		shopId: r.shop_id,
		ownerId: r.owner_uid,
		name: r.name,
		description: r.description ?? "",
		category: r.category ?? "",
		logoUrl: r.logo_url ?? null,
		logoPublicId: r.logo_public_id ?? null,
		coverImageUrl: r.cover_image_url ?? null,
		coverPublicId: r.cover_public_id ?? null,
		location: r.location ?? r.campus ?? "",
		contactNumber: r.contact_number ?? r.phone ?? "",
		contactEmail: r.contact_email ?? r.email ?? "",
		preparationTime: r.prep_time ?? "",
		rating: r.rating ?? 4.5,
		status: r.status ?? "CLOSED",
		openingHours: r.opening_hours ?? r.hours ?? [],
		vendorId: r.vendor_id ?? null,
		payoutConfigured: r.payout_configured ?? false
	};
}
function rowToMenuItemDoc(r) {
	return {
		itemId: r.item_id,
		shopId: r.shop_id,
		name: r.name,
		description: r.description ?? "",
		price: Number(r.price),
		imageUrl: r.image_url ?? null,
		cloudinaryPublicId: r.cloudinary_public_id ?? null,
		categoryId: r.category_id ?? "",
		categoryName: r.category_name ?? "Uncategorised",
		available: r.available !== false,
		popular: Boolean(r.popular),
		veg: r.veg !== false,
		ingredients: r.ingredients ?? "",
		preparationTime: r.preparation_time ?? ""
	};
}
function rowToCategoryDoc(r) {
	return {
		categoryId: r.category_id,
		shopId: r.shop_id,
		name: r.name,
		imageUrl: r.image_url ?? null,
		sortOrder: r.sort_order ?? 0
	};
}
var slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "shop";
async function reserveShopId(name) {
	const base = slugify(name);
	for (let i = 0; i < 20; i++) {
		const candidate = i === 0 ? base : `${base}-${i + 1}`;
		const { data } = await supabase.from("shops").select("shop_id").eq("shop_id", candidate).limit(1);
		if (!data || data.length === 0) return candidate;
	}
	return `${base}-${Date.now().toString(36)}`;
}
async function createShopDoc(input) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const { error } = await supabase.from("shops").insert({
		shop_id: input.shopId,
		owner_uid: input.ownerId,
		name: input.name,
		description: input.description,
		category: input.category,
		phone: input.contactNumber ?? "",
		email: input.contactEmail ?? "",
		campus: input.location ?? "",
		prep_time: input.preparationTime ?? "",
		hours: input.openingHours ?? [],
		status: input.status ?? "CLOSED",
		logo_url: input.logoUrl,
		logo_public_id: input.logoPublicId,
		cover_image_url: input.coverImageUrl,
		cover_public_id: input.coverPublicId,
		location: input.location,
		contact_number: input.contactNumber,
		contact_email: input.contactEmail,
		opening_hours: input.openingHours,
		rating: input.rating ?? 4.5,
		vendor_id: input.vendorId,
		payout_configured: input.payoutConfigured ?? false,
		created_at: now,
		updated_at: now
	});
	if (error) throw new Error(error.message || "Couldn't create your shop.");
}
async function updateShopDoc(shopId, patch) {
	const row = { updated_at: (/* @__PURE__ */ new Date()).toISOString() };
	if (patch.name !== void 0) row["name"] = patch.name;
	if (patch.description !== void 0) row["description"] = patch.description;
	if (patch.category !== void 0) row["category"] = patch.category;
	if (patch.contactNumber !== void 0) {
		row["contact_number"] = patch.contactNumber;
		row["phone"] = patch.contactNumber;
	}
	if (patch.contactEmail !== void 0) {
		row["contact_email"] = patch.contactEmail;
		row["email"] = patch.contactEmail;
	}
	if (patch.location !== void 0) {
		row["location"] = patch.location;
		row["campus"] = patch.location;
	}
	if (patch.preparationTime !== void 0) row["prep_time"] = patch.preparationTime;
	if (patch.openingHours !== void 0) {
		row["opening_hours"] = patch.openingHours;
		row["hours"] = patch.openingHours;
	}
	if (patch.logoUrl !== void 0) row["logo_url"] = patch.logoUrl;
	if (patch.logoPublicId !== void 0) row["logo_public_id"] = patch.logoPublicId;
	if (patch.coverImageUrl !== void 0) row["cover_image_url"] = patch.coverImageUrl;
	if (patch.coverPublicId !== void 0) row["cover_public_id"] = patch.coverPublicId;
	if (patch.status !== void 0) row["status"] = patch.status;
	if (patch.vendorId !== void 0) row["vendor_id"] = patch.vendorId;
	if (patch.payoutConfigured !== void 0) row["payout_configured"] = patch.payoutConfigured;
	if (patch.rating !== void 0) row["rating"] = patch.rating;
	const { error } = await supabase.from("shops").update(row).eq("shop_id", shopId);
	if (error) throw new Error(error.message || "Unable to save your changes.");
}
var setShopStatus = (shopId, status) => updateShopDoc(shopId, { status });
function subscribeOwnerShops(ownerId, onData, onError) {
	supabase.from("shops").select("*").eq("owner_uid", ownerId).then(({ data, error }) => {
		if (error) {
			onError(error.message);
			return;
		}
		onData((data ?? []).map((r) => rowToShopDoc(r)));
	});
	const uid = Math.random().toString(36).substring(7);
	const channel = supabase.channel(`shops-owner-${ownerId}-${uid}`).on("postgres_changes", {
		event: "*",
		schema: "public",
		table: "shops",
		filter: `owner_uid=eq.${ownerId}`
	}, () => {
		supabase.from("shops").select("*").eq("owner_uid", ownerId).then(({ data, error }) => {
			if (error) return;
			onData((data ?? []).map((r) => rowToShopDoc(r)));
		});
	}).subscribe();
	return () => {
		supabase.removeChannel(channel);
	};
}
function subscribeMenu(shopId, onData, onError) {
	supabase.from("menu_items").select("*").eq("shop_id", shopId).then(({ data, error }) => {
		if (error) {
			onError(error.message);
			return;
		}
		onData((data ?? []).map((r) => rowToMenuItemDoc(r)));
	});
	const uid = Math.random().toString(36).substring(7);
	const channel = supabase.channel(`menu-${shopId}-${uid}`).on("postgres_changes", {
		event: "*",
		schema: "public",
		table: "menu_items",
		filter: `shop_id=eq.${shopId}`
	}, (payload) => {
		console.log("Realtime event for menu items!", payload);
		supabase.from("menu_items").select("*").eq("shop_id", shopId).then(({ data, error }) => {
			if (error) {
				console.error("Realtime re-fetch error:", error);
				return;
			}
			onData((data ?? []).map((r) => rowToMenuItemDoc(r)));
		});
	}).subscribe((status) => {
		console.log(`Menu channel status: ${status}`);
	});
	return () => {
		supabase.removeChannel(channel);
	};
}
function subscribeCategories(shopId, onData, onError) {
	supabase.from("categories").select("*").eq("shop_id", shopId).then(({ data, error }) => {
		if (error) {
			onError(error.message);
			return;
		}
		onData((data ?? []).map((r) => rowToCategoryDoc(r)));
	});
	const uid = Math.random().toString(36).substring(7);
	const channel = supabase.channel(`categories-${shopId}-${uid}`).on("postgres_changes", {
		event: "*",
		schema: "public",
		table: "categories",
		filter: `shop_id=eq.${shopId}`
	}, () => {
		supabase.from("categories").select("*").eq("shop_id", shopId).then(({ data, error }) => {
			if (error) return;
			onData((data ?? []).map((r) => rowToCategoryDoc(r)));
		});
	}).subscribe();
	return () => {
		supabase.removeChannel(channel);
	};
}
async function createMenuItem(shopId, input) {
	const itemId = input.itemId || `m_${Date.now().toString(36)}`;
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const { error } = await supabase.from("menu_items").insert({
		item_id: itemId,
		shop_id: shopId,
		name: input.name,
		description: input.description ?? "",
		price: input.price,
		image_url: input.imageUrl ?? null,
		cloudinary_public_id: input.cloudinaryPublicId ?? null,
		category_id: input.categoryId ?? "",
		category_name: input.categoryName ?? "Uncategorised",
		available: input.available !== false,
		popular: Boolean(input.popular),
		veg: input.veg !== false,
		ingredients: input.ingredients ?? "",
		preparation_time: input.preparationTime ?? "",
		created_at: now,
		updated_at: now
	});
	if (error) throw new Error(error.message || "Unable to save this item.");
	return itemId;
}
async function updateMenuItem(shopId, itemId, patch) {
	const row = { updated_at: (/* @__PURE__ */ new Date()).toISOString() };
	if (patch.name !== void 0) row["name"] = patch.name;
	if (patch.description !== void 0) row["description"] = patch.description;
	if (patch.price !== void 0) row["price"] = patch.price;
	if (patch.imageUrl !== void 0) row["image_url"] = patch.imageUrl;
	if (patch.cloudinaryPublicId !== void 0) row["cloudinary_public_id"] = patch.cloudinaryPublicId;
	if (patch.available !== void 0) row["available"] = patch.available;
	if (patch.popular !== void 0) row["popular"] = patch.popular;
	if (patch.veg !== void 0) row["veg"] = patch.veg;
	if (patch.ingredients !== void 0) row["ingredients"] = patch.ingredients;
	if (patch.preparationTime !== void 0) row["preparation_time"] = patch.preparationTime;
	if (patch.categoryId !== void 0) row["category_id"] = patch.categoryId;
	if (patch.categoryName !== void 0) row["category_name"] = patch.categoryName;
	const { error } = await supabase.from("menu_items").update(row).eq("shop_id", shopId).eq("item_id", itemId);
	if (error) throw new Error(error.message || "Unable to save this item.");
}
async function deleteMenuItem(shopId, itemId) {
	const { error } = await supabase.from("menu_items").delete().eq("shop_id", shopId).eq("item_id", itemId);
	if (error) throw new Error(error.message || "Unable to delete this item.");
}
async function createCategory(shopId, name) {
	const categoryId = `cat_${Date.now().toString(36)}`;
	const { error } = await supabase.from("categories").insert({
		category_id: categoryId,
		shop_id: shopId,
		name,
		sort_order: Date.now()
	});
	if (error) throw new Error(error.message || "Unable to add this category.");
	return categoryId;
}
async function renameCategory(shopId, categoryId, name, items) {
	const { error } = await supabase.from("categories").update({ name }).eq("shop_id", shopId).eq("category_id", categoryId);
	if (error) throw new Error(error.message || "Unable to rename this category.");
	await Promise.all(items.filter((i) => i.categoryId === categoryId).map((i) => updateMenuItem(shopId, i.itemId, { categoryName: name })));
}
async function deleteCategory(shopId, categoryId, items) {
	await Promise.all(items.filter((i) => i.categoryId === categoryId).map((i) => updateMenuItem(shopId, i.itemId, {
		categoryId: "",
		categoryName: "Uncategorised"
	})));
	const { error } = await supabase.from("categories").delete().eq("shop_id", shopId).eq("category_id", categoryId);
	if (error) throw new Error(error.message || "Unable to delete this category.");
}
function subscribeAllShops(onData, onError) {
	supabase.from("shops").select("*").then(({ data, error }) => {
		if (error) {
			onError(error.message);
			return;
		}
		onData((data ?? []).map((r) => rowToShopDoc(r)));
	});
	const uid = Math.random().toString(36).substring(7);
	const channel = supabase.channel(`all-shops-${uid}`).on("postgres_changes", {
		event: "*",
		schema: "public",
		table: "shops"
	}, () => {
		supabase.from("shops").select("*").then(({ data, error }) => {
			if (error) return;
			onData((data ?? []).map((r) => rowToShopDoc(r)));
		});
	}).subscribe();
	return () => {
		supabase.removeChannel(channel);
	};
}
function subscribeAllMenuItems(onData, onError) {
	supabase.from("menu_items").select("*").then(({ data, error }) => {
		if (error) {
			onError(error.message);
			return;
		}
		onData((data ?? []).map((r) => rowToMenuItemDoc(r)));
	});
	const uid = Math.random().toString(36).substring(7);
	const channel = supabase.channel(`all-menu-items-${uid}`).on("postgres_changes", {
		event: "*",
		schema: "public",
		table: "menu_items"
	}, () => {
		supabase.from("menu_items").select("*").then(({ data, error }) => {
			if (error) return;
			onData((data ?? []).map((r) => rowToMenuItemDoc(r)));
		});
	}).subscribe();
	return () => {
		supabase.removeChannel(channel);
	};
}
/**
* Supabase-backed order CRUD + realtime subscriptions.
* Drop-in replacement for firebase/orders.ts.
*/
function rowToOrderDoc(r) {
	return {
		orderId: r.order_id,
		orderNumber: r.order_number,
		studentId: r.student_id,
		studentName: r.student_name ?? "Student",
		shopId: r.shop_id,
		shopName: r.shop_name ?? "",
		items: r.items ?? [],
		subtotal: Number(r.subtotal),
		discount: Number(r.discount),
		platformCommission: Number(r.platform_commission),
		paymentGatewayCharges: Number(r.payment_gateway_charges),
		shopAmount: Number(r.shop_amount),
		totalAmount: Number(r.total_amount),
		currency: r.currency ?? "INR",
		paymentStatus: r.payment_status,
		orderStatus: r.order_status,
		receiptId: r.receipt_id ?? null,
		idempotencyKey: r.idempotency_key ?? "",
		createdAt: r.created_at,
		updatedAt: r.updated_at
	};
}
function subscribeStudentOrders(studentId, onData, onError) {
	supabase.from("orders").select("*").eq("student_id", studentId).order("created_at", { ascending: false }).limit(50).then(({ data, error }) => {
		if (error) {
			onError(error.message);
			return;
		}
		onData((data ?? []).map(rowToOrderDoc));
	});
	const uid = Math.random().toString(36).substring(7);
	const channel = supabase.channel(`student-orders-${studentId}-${uid}`).on("postgres_changes", {
		event: "*",
		schema: "public",
		table: "orders",
		filter: `student_id=eq.${studentId}`
	}, () => {
		supabase.from("orders").select("*").eq("student_id", studentId).order("created_at", { ascending: false }).limit(50).then(({ data, error }) => {
			if (error) return;
			onData((data ?? []).map(rowToOrderDoc));
		});
	}).subscribe();
	return () => {
		supabase.removeChannel(channel);
	};
}
function subscribeShopOrders(shopId, onData, onError) {
	supabase.from("orders").select("*").eq("shop_id", shopId).order("created_at", { ascending: false }).limit(100).then(({ data, error }) => {
		if (error) {
			onError(error.message);
			return;
		}
		onData((data ?? []).map(rowToOrderDoc));
	});
	const uid = Math.random().toString(36).substring(7);
	const channel = supabase.channel(`shop-orders-${shopId}-${uid}`).on("postgres_changes", {
		event: "*",
		schema: "public",
		table: "orders",
		filter: `shop_id=eq.${shopId}`
	}, () => {
		supabase.from("orders").select("*").eq("shop_id", shopId).order("created_at", { ascending: false }).limit(100).then(({ data, error }) => {
			if (error) return;
			onData((data ?? []).map(rowToOrderDoc));
		});
	}).subscribe();
	return () => {
		supabase.removeChannel(channel);
	};
}
async function setOrderStatus(orderId, orderStatus) {
	const { error } = await supabase.from("orders").update({
		order_status: orderStatus,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("order_id", orderId);
	if (error) throw new Error(error.message || "Unable to update this order.");
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/cloudinary-DWLj9SNi.js
/**
* Cloudinary delivery + unsigned upload.
*
* Only the cloud name and a folder-restricted unsigned preset live in the
* browser — never an API key or secret. Signed uploads and asset deletion are
* performed by Cloud Functions (see functions/src/cloudinary.ts).
*/
var CLOUDINARY_CLOUD_NAME = "b3k1ibns";
var CLOUDINARY_UPLOAD_PRESET = "digitalfoodstreet_images";
var UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
var DELIVERY_PREFIX = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/`;
var cloudinaryFolders = {
	shopLogo: (shopId) => `digitalfoodstreet/shops/${shopId}/logo`,
	shopCover: (shopId) => `digitalfoodstreet/shops/${shopId}/cover`,
	menuItem: (shopId, itemId) => `digitalfoodstreet/menu/${shopId}/${itemId}`,
	category: (shopId) => `digitalfoodstreet/categories/${shopId}`
};
/** Uploads one image through the restricted unsigned preset. */
async function uploadImage(file, folder) {
	if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
	if (file.size > 8388608) throw new Error("That image is too large. Please choose one under 8 MB.");
	const body = new FormData();
	body.append("file", file);
	body.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
	body.append("folder", folder);
	const res = await fetch(UPLOAD_URL, {
		method: "POST",
		body
	});
	if (!res.ok) throw new Error("We couldn't upload that image. Please try again.");
	const json = await res.json();
	if (!json.secure_url || !json.public_id) throw new Error("We couldn't upload that image. Please try again.");
	return {
		url: json.secure_url,
		publicId: json.public_id,
		width: json.width ?? 0,
		height: json.height ?? 0,
		bytes: json.bytes ?? file.size
	};
}
/**
* A deliberately small set of transformation variants — one per real display
* size in the app. `f_auto,q_auto` lets Cloudinary pick AVIF/WebP and a quality
* level per image, which turns a 3 MB upload into roughly 40–200 KB.
*/
var VARIANTS = {
	avatar: "f_auto,q_auto,c_fill,g_auto,w_96,h_96,dpr_2.0",
	thumb: "f_auto,q_auto,c_fill,g_auto,w_160,h_160,dpr_2.0",
	card: "f_auto,q_auto,c_fill,g_auto,w_320,h_240,dpr_2.0",
	cover: "f_auto,q_auto,c_fill,g_auto,w_480,h_270,dpr_2.0",
	hero: "f_auto,q_auto,c_fill,g_auto,w_720,h_405,dpr_2.0"
};
var isCloudinary = (url) => url.startsWith(DELIVERY_PREFIX);
/**
* Returns an optimised CDN URL for a stored image.
* Non-Cloudinary URLs (bundled demo assets) are returned untouched.
*/
function cldUrl(url, variant = "card") {
	if (!url) return "";
	if (!isCloudinary(url)) return url;
	const rest = url.slice(DELIVERY_PREFIX.length);
	const withoutTransform = /^v\d+\//.test(rest) ? rest : rest.replace(/^[^/]+\//, "");
	return `${DELIVERY_PREFIX}${VARIANTS[variant]}/${withoutTransform}`;
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/store-B0GTbkM2.js
/**
* Shared catalog types + a small runtime registry.
*
* The registry is filled by the realtime Firestore catalog listener
* (`src/lib/catalog-store.tsx`). Components keep using the same accessors they
* used with mock data, but the values are now live backend data.
*/
var CATEGORIES = [
	"All",
	"Burgers",
	"Meals",
	"Snacks",
	"Drinks",
	"Desserts",
	"Coffee"
];
/** Mutable snapshot of the live catalog. Replaced wholesale on every update. */
var SHOP_REGISTRY = [];
var FOOD_REGISTRY = [];
var setCatalogSnapshot = (shops, foods) => {
	SHOP_REGISTRY = shops;
	FOOD_REGISTRY = foods;
};
var getShop = (id) => SHOP_REGISTRY.find((s) => s.id === id);
var getFood = (id) => FOOD_REGISTRY.find((f) => f.id === id);
var formatPrice = (value) => `₹${value}`;
var CatalogContext = (0, import_react.createContext)(null);
var toShop = (d) => ({
	id: d.shopId,
	name: d.name,
	image: cldUrl(d.coverImageUrl, "hero"),
	logo: d.logoUrl ? cldUrl(d.logoUrl, "avatar") : null,
	description: d.description ?? "",
	isOpen: d.status === "OPEN",
	status: d.status ?? "CLOSED",
	prepTime: d.preparationTime ?? "10–15 min",
	rating: d.rating ?? 4.5,
	counter: `${d.name} Counter`,
	ownerId: d.ownerId
});
var toFood = (d) => ({
	id: d.itemId,
	shopId: d.shopId,
	name: d.name,
	description: d.description ?? "",
	ingredients: d.ingredients ?? "",
	price: d.price,
	image: cldUrl(d.imageUrl, "card"),
	imagePublicId: d.cloudinaryPublicId ?? null,
	category: d.categoryName || "Other",
	categoryId: d.categoryId ?? "",
	available: d.available !== false,
	popular: Boolean(d.popular),
	veg: d.veg !== false,
	prepTime: d.preparationTime ?? ""
});
function CatalogProvider({ children }) {
	const [shops, setShops] = (0, import_react.useState)([]);
	const [foods, setFoods] = (0, import_react.useState)([]);
	const [shopsLoaded, setShopsLoaded] = (0, import_react.useState)(false);
	const [foodsLoaded, setFoodsLoaded] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const stopShops = subscribeAllShops((docs) => {
			setShops(docs.map(toShop));
			setShopsLoaded(true);
			setError(null);
		}, (msg) => {
			setShopsLoaded(true);
			setError(msg || "Unable to load campus shops.");
		});
		const stopItems = subscribeAllMenuItems((docs) => {
			setFoods(docs.map(toFood));
			setFoodsLoaded(true);
		}, (_msg) => {
			setFoodsLoaded(true);
			setError("Unable to load the menu.");
		});
		return () => {
			stopShops();
			stopItems();
		};
	}, []);
	(0, import_react.useEffect)(() => {
		setCatalogSnapshot(shops, foods);
	}, [shops, foods]);
	const value = (0, import_react.useMemo)(() => ({
		shops,
		foods,
		loading: !(shopsLoaded && foodsLoaded),
		error
	}), [
		shops,
		foods,
		shopsLoaded,
		foodsLoaded,
		error
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CatalogContext.Provider, {
		value,
		children
	});
}
function useCatalog() {
	const ctx = (0, import_react.useContext)(CatalogContext);
	if (!ctx) throw new Error("useCatalog must be used inside CatalogProvider");
	return ctx;
}
var CART_KEY = "dfs.cart.v2";
var FAV_KEY = "dfs.favourites.v2";
var DISCOUNT_RATE = .05;
var GUEST = {
	id: "",
	name: "there",
	email: "",
	initials: "G"
};
var StoreContext = (0, import_react.createContext)(null);
function StoreProvider({ children }) {
	const { firebaseUser, profile, ready, logout: authLogout } = useAuth();
	const { foods } = useCatalog();
	const [cart, setCart] = (0, import_react.useState)([]);
	const [favourites, setFavourites] = (0, import_react.useState)([]);
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	const [orders, setOrders] = (0, import_react.useState)([]);
	const [cartIssues, setCartIssues] = (0, import_react.useState)([]);
	const [placing, setPlacing] = (0, import_react.useState)(false);
	const [checkoutStep, setCheckoutStep] = (0, import_react.useState)("idle");
	const uid = firebaseUser?.uid ?? null;
	(0, import_react.useEffect)(() => {
		try {
			const rawCart = localStorage.getItem(CART_KEY);
			if (rawCart) setCart(JSON.parse(rawCart));
			const rawFav = localStorage.getItem(FAV_KEY);
			if (rawFav) setFavourites(JSON.parse(rawFav));
		} catch {}
		setHydrated(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!hydrated) return;
		try {
			localStorage.setItem(CART_KEY, JSON.stringify(cart));
			localStorage.setItem(FAV_KEY, JSON.stringify(favourites));
		} catch {}
	}, [
		cart,
		favourites,
		hydrated
	]);
	(0, import_react.useEffect)(() => {
		if (!uid) return;
		let cancelled = false;
		supabase.from("users").select("favourites").eq("uid", uid).single().then(({ data }) => {
			if (!cancelled && data?.favourites && Array.isArray(data.favourites)) setFavourites(data.favourites);
		});
		return () => {
			cancelled = true;
		};
	}, [uid]);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined" || !uid) {
			setOrders([]);
			return;
		}
		const stopOrders = subscribeStudentOrders(uid, setOrders, (m) => toast.error(m));
		return () => {
			stopOrders();
		};
	}, [uid]);
	const cartItems = (0, import_react.useMemo)(() => cart.map((line) => {
		const item = foods.find((f) => f.id === line.itemId);
		return item ? {
			item,
			qty: line.qty
		} : null;
	}).filter(Boolean), [cart, foods]);
	const cartCount = cartItems.reduce((n, l) => n + l.qty, 0);
	const subtotal = cartItems.reduce((n, l) => n + l.qty * l.item.price, 0);
	const discount = subtotal > 0 ? Math.round(subtotal * DISCOUNT_RATE) : 0;
	const total = subtotal - discount;
	const firstCartItem = cartItems[0];
	const cartShop = firstCartItem ? getShop(firstCartItem.item.shopId) ?? null : null;
	const addToCart = (0, import_react.useCallback)((item, qty = 1) => {
		if (!item.available) {
			toast.error(`${item.name} is unavailable right now.`);
			return;
		}
		setCart((prev) => {
			const firstLine = prev[0];
			const existingShopId = firstLine ? getFood(firstLine.itemId)?.shopId : void 0;
			const differentShop = existingShopId && existingShopId !== item.shopId;
			const base = differentShop ? [] : prev;
			if (differentShop) toast("Cart updated", { description: "Items from another shop were removed." });
			return base.find((l) => l.itemId === item.id) ? base.map((l) => l.itemId === item.id ? {
				...l,
				qty: l.qty + qty
			} : l) : [...base, {
				itemId: item.id,
				qty
			}];
		});
		toast.success(`${item.name} added to cart`);
	}, []);
	const increment = (0, import_react.useCallback)((itemId) => {
		setCart((prev) => prev.map((l) => l.itemId === itemId ? {
			...l,
			qty: l.qty + 1
		} : l));
	}, []);
	const decrement = (0, import_react.useCallback)((itemId) => {
		setCart((prev) => prev.map((l) => l.itemId === itemId ? {
			...l,
			qty: l.qty - 1
		} : l).filter((l) => l.qty > 0));
	}, []);
	const removeFromCart = (0, import_react.useCallback)((itemId) => {
		const item = getFood(itemId);
		setCart((prev) => prev.filter((l) => l.itemId !== itemId));
		toast(`${item?.name ?? "Item"} removed from cart`);
	}, []);
	const clearCart = (0, import_react.useCallback)(() => setCart([]), []);
	const isFavourite = (0, import_react.useCallback)((itemId) => favourites.includes(itemId), [favourites]);
	const toggleFavourite = (0, import_react.useCallback)((item) => {
		setFavourites((prev) => {
			const has = prev.includes(item.id);
			const next = has ? prev.filter((id) => id !== item.id) : [...prev, item.id];
			toast(has ? "Removed from favourites" : "Added to favourites");
			if (uid) supabase.from("users").update({ favourites: next }).eq("uid", uid);
			return next;
		});
	}, [uid]);
	const favouriteItems = (0, import_react.useMemo)(() => favourites.map((id) => foods.find((f) => f.id === id)).filter(Boolean), [favourites, foods]);
	const placeOrder = (0, import_react.useCallback)(async () => {
		if (placing) return null;
		if (!uid || !profile) {
			toast.error("Please sign in to place your order.");
			return null;
		}
		if (cartItems.length === 0 || !cartShop) {
			toast.error("Your cart is empty");
			return null;
		}
		setPlacing(true);
		try {
			setCheckoutStep("creating");
			const payload = {
				shopId: cartShop.id,
				items: cartItems.map((l) => ({
					itemId: l.item.id,
					quantity: l.qty
				})),
				customerName: profile.name,
				customerEmail: profile.email
			};
			const { data: createResponse, error: createError } = await supabase.functions.invoke("create-cashfree-order", { body: payload });
			if (createError || !createResponse) throw new Error("Unable to reach payment gateway. Please try again.");
			if (!createResponse.success) throw new Error(createResponse.message || "Order creation failed.");
			setCheckoutStep("paying");
			const { payment_session_id, order_id } = createResponse;
			const { load } = await import("../_libs/cashfreepayments__cashfree-js.mjs").then((n) => n.t);
			const cashfree = await load({ mode: "sandbox" });
			return new Promise((resolve, reject) => {
				cashfree.checkout({
					paymentSessionId: payment_session_id,
					returnUrl: `${window.location.origin}/checkout?cf_order_id=${order_id}&cf_verify=true`
				}).then(() => {}).catch((err) => {
					console.error(err);
					reject(/* @__PURE__ */ new Error("Checkout failed to initialize"));
				});
			});
		} catch (err) {
			const msg = err instanceof Error ? err.message : "We couldn't complete your order.";
			toast.error(msg);
			return null;
		} finally {
			setCheckoutStep("idle");
			setPlacing(false);
		}
	}, [
		cartItems,
		cartShop,
		placing,
		profile,
		uid
	]);
	const confirmPickup = (0, import_react.useCallback)(async (receiptId) => {
		await supabase.from("orders").update({ order_status: "COMPLETED" }).eq("receipt_id", receiptId);
	}, []);
	const logout = (0, import_react.useCallback)(async () => {
		await authLogout();
		setCart([]);
		toast("Logged out");
	}, [authLogout]);
	/** Receipts are mapped directly from paid orders */
	const receipts = (0, import_react.useMemo)(() => {
		return orders.filter((o) => o.receiptId).map((order) => {
			const status = order.paymentStatus === "REDEEMED" || order.orderStatus === "COMPLETED" ? "picked_up" : order.orderStatus === "READY" ? "ready" : "preparing";
			return {
				id: order.receiptId,
				code: order.orderNumber,
				shopId: order.shopId,
				shopName: order.shopName,
				counter: `${order.shopName} Counter`,
				lines: (order.items ?? []).map((i) => ({
					name: i.name,
					qty: i.quantity,
					price: i.price
				})),
				total: order.totalAmount ?? 0,
				paid: order.paymentStatus === "PAID" || order.paymentStatus === "REDEEMED",
				status,
				createdAt: String(order.createdAt),
				pickedUpAt: status === "picked_up" ? String(order.updatedAt) : null
			};
		});
	}, [orders]);
	const value = {
		user: profile ? {
			id: profile.uid,
			name: profile.name?.split(" ")[0] ?? "there",
			email: profile.email,
			initials: (profile.name?.trim()?.charAt(0) ?? "S").toUpperCase()
		} : GUEST,
		signedIn: Boolean(uid),
		cart,
		favourites,
		receipts,
		orders,
		hydrated: hydrated && ready,
		cartCount,
		cartItems,
		cartShopName: cartShop?.name ?? null,
		subtotal,
		discount,
		total,
		addToCart,
		increment,
		decrement,
		removeFromCart,
		clearCart,
		isFavourite,
		toggleFavourite,
		favouriteItems,
		placeOrder,
		checkoutStep,
		cartIssues,
		clearCartIssues: () => setCartIssues([]),
		confirmPickup,
		logout
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoreContext.Provider, {
		value,
		children
	});
}
function useStore() {
	const ctx = (0, import_react.useContext)(StoreContext);
	if (!ctx) throw new Error("useStore must be used inside StoreProvider");
	return ctx;
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/utils-C_uf36nf.js
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/merchant-data-B6fsSmjI.js
var ORDER_FLOW = [
	"NEW",
	"ACCEPTED",
	"PREPARING",
	"READY",
	"COMPLETED"
];
var nextStatus = (s) => {
	const i = ORDER_FLOW.indexOf(s);
	if (i === -1 || i === ORDER_FLOW.length - 1) return null;
	return ORDER_FLOW[i + 1] ?? null;
};
var DAYS = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday"
];
var defaultHours = () => DAYS.map((day) => ({
	day,
	open: day !== "Sunday",
	from: "10:00 AM",
	to: "08:00 PM"
}));
var TIME_OPTIONS = [
	"07:00 AM",
	"08:00 AM",
	"09:00 AM",
	"10:00 AM",
	"11:00 AM",
	"12:00 PM",
	"01:00 PM",
	"02:00 PM",
	"03:00 PM",
	"04:00 PM",
	"05:00 PM",
	"06:00 PM",
	"07:00 PM",
	"08:00 PM",
	"09:00 PM",
	"10:00 PM",
	"11:00 PM"
];
var SHOP_CATEGORIES = [
	"Fast food and beverages",
	"Bakery and desserts",
	"Snacks and quick bites",
	"Juices and shakes",
	"Meals and thali"
];
var formatMoney = (n) => `₹${n.toLocaleString("en-IN")}`;
var formatTime = (iso) => new Date(iso).toLocaleTimeString("en-IN", {
	hour: "2-digit",
	minute: "2-digit",
	hour12: true
});
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/merchant-store-Cabkl_Y7.js
var MerchantContext = (0, import_react.createContext)(null);
var AVAILABILITY_TO_STATUS = {
	open: "OPEN",
	closed: "CLOSED",
	unavailable: "TEMPORARILY_UNAVAILABLE"
};
var STATUS_TO_AVAILABILITY = {
	OPEN: "open",
	CLOSED: "closed",
	TEMPORARILY_UNAVAILABLE: "unavailable"
};
/** A paid order is "NEW" work for the counter; unpaid orders never appear. */
var toUiStatus = (s) => {
	switch (s) {
		case "PAID": return "NEW";
		case "ACCEPTED":
		case "PREPARING":
		case "READY":
		case "COMPLETED":
		case "CANCELLED": return s;
		default: return null;
	}
};
var toBackendStatus = (s) => s === "NEW" ? "PAID" : s;
var tsToIso = (value) => {
	const t = value;
	if (t && typeof t.toDate === "function") return t.toDate().toISOString();
	return (/* @__PURE__ */ new Date()).toISOString();
};
var relativeDay = (iso) => {
	const days = Math.floor((Date.now() - Date.parse(iso)) / 864e5);
	if (days <= 0) return "Today";
	if (days === 1) return "Yesterday";
	return `${days} days ago`;
};
var buildCustomers = (orders) => {
	const map = /* @__PURE__ */ new Map();
	for (const o of orders) {
		if (o.paymentStatus !== "PAID") continue;
		const created = Date.parse(tsToIso(o.createdAt));
		const found = map.get(o.studentId);
		if (found) {
			found.orders += 1;
			found.spent += o.totalAmount;
			if (created > found.last) {
				found.last = created;
				found.lastOrder = relativeDay(new Date(created).toISOString());
			}
		} else map.set(o.studentId, {
			id: o.studentId,
			name: o.studentName || "Student",
			initials: (o.studentName || "S").charAt(0).toUpperCase(),
			orders: 1,
			spent: o.totalAmount,
			lastOrder: relativeDay(new Date(created).toISOString()),
			last: created
		});
	}
	return [...map.values()].sort((a, b) => b.spent - a.spent).map(({ last: _last, ...c }) => c);
};
function MerchantProvider({ children }) {
	const { firebaseUser, profile, ready, logout } = useAuth();
	const uid = firebaseUser?.uid ?? null;
	const [shopDocs, setShopDocs] = (0, import_react.useState)([]);
	const [shopsLoaded, setShopsLoaded] = (0, import_react.useState)(false);
	const [activeShopId, setActiveShopId] = (0, import_react.useState)(null);
	const [menu, setMenu] = (0, import_react.useState)([]);
	const [categories, setCategories] = (0, import_react.useState)([]);
	const [orders, setOrders] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		if (!uid) {
			setShopDocs([]);
			setShopsLoaded(ready);
			return;
		}
		setShopsLoaded(false);
		return subscribeOwnerShops(uid, (docs) => {
			setShopDocs(docs);
			setShopsLoaded(true);
		}, (message) => {
			setShopsLoaded(true);
			toast.error(message);
		});
	}, [uid, ready]);
	(0, import_react.useEffect)(() => {
		if (shopDocs.length === 0) {
			setActiveShopId(null);
			return;
		}
		setActiveShopId((prev) => prev && shopDocs.some((s) => s.shopId === prev) ? prev : shopDocs[0].shopId);
	}, [shopDocs]);
	(0, import_react.useEffect)(() => {
		if (!activeShopId) {
			setMenu([]);
			setCategories([]);
			setOrders([]);
			return;
		}
		const stopMenu = subscribeMenu(activeShopId, setMenu, (m) => toast.error(m));
		const stopCats = subscribeCategories(activeShopId, setCategories, (m) => toast.error(m));
		const stopOrders = subscribeShopOrders(activeShopId, setOrders, (m) => toast.error(m));
		return () => {
			stopMenu();
			stopCats();
			stopOrders();
		};
	}, [activeShopId]);
	const categoryIds = (0, import_react.useMemo)(() => {
		const map = {};
		for (const c of categories) map[c.name] = c.categoryId || c.name;
		return map;
	}, [categories]);
	const uiMenu = (0, import_react.useMemo)(() => menu.map((m) => ({
		id: m.itemId,
		name: m.name,
		description: m.description ?? "",
		price: m.price,
		category: m.categoryName || "Uncategorised",
		categoryId: m.categoryId,
		image: m.imageUrl ?? "",
		imagePublicId: m.cloudinaryPublicId ?? null,
		available: m.available !== false,
		veg: m.veg !== false,
		popular: Boolean(m.popular),
		ingredients: m.ingredients ?? "",
		prepTime: m.preparationTime ?? ""
	})), [menu]);
	const uiOrders = (0, import_react.useMemo)(() => orders.map((o) => {
		const status = toUiStatus(o.orderStatus);
		if (!status) return null;
		return {
			id: o.orderId,
			code: o.orderNumber,
			customerName: o.studentName || "Student",
			lines: o.items.map((i) => ({
				name: i.name,
				qty: i.quantity,
				price: i.price
			})),
			total: o.totalAmount,
			shopAmount: o.shopAmount,
			platformCommission: o.platformCommission,
			paid: o.paymentStatus === "PAID",
			status,
			placedAt: tsToIso(o.createdAt)
		};
	}).filter(Boolean), [orders]);
	const shops = (0, import_react.useMemo)(() => shopDocs.map((s) => {
		const isActive = s.shopId === activeShopId;
		const catNames = isActive ? [.../* @__PURE__ */ new Set([...categories.map((c) => c.name), ...uiMenu.map((m) => m.category)])] : [];
		return {
			id: s.shopId,
			name: s.name,
			description: s.description ?? "",
			category: s.category ?? "",
			phone: s.contactNumber ?? "",
			email: s.contactEmail ?? "",
			campus: s.location ?? "",
			logo: s.logoUrl ?? null,
			logoPublicId: s.logoPublicId ?? null,
			cover: s.coverImageUrl ?? null,
			coverPublicId: s.coverPublicId ?? null,
			prepTime: s.preparationTime ?? "",
			availability: STATUS_TO_AVAILABILITY[s.status] ?? "closed",
			hours: s.openingHours?.length ? s.openingHours : defaultHours(),
			paymentConnected: Boolean(s.payoutConfigured),
			vendorId: s.vendorId ?? null,
			vendorStatus: s.vendorStatus ?? null,
			categories: catNames,
			categoryIds: isActive ? categoryIds : {},
			menu: isActive ? uiMenu : [],
			orders: isActive ? uiOrders : [],
			customers: isActive ? buildCustomers(orders) : []
		};
	}), [
		shopDocs,
		activeShopId,
		categories,
		uiMenu,
		uiOrders,
		orders,
		categoryIds
	]);
	const activeShop = (0, import_react.useMemo)(() => shops.find((s) => s.id === activeShopId) ?? null, [shops, activeShopId]);
	const fail = (err, fallback) => {
		const msg = err instanceof Error ? err.message : fallback;
		toast.error(msg);
	};
	const createShop = (0, import_react.useCallback)(async (input) => {
		if (!uid) throw new Error("Please sign in to create your shop.");
		const shopId = await reserveShopId(input.name);
		await createShopDoc({
			shopId,
			ownerId: uid,
			name: input.name.trim(),
			description: input.description.trim(),
			category: input.category,
			logoUrl: input.logo?.url ?? null,
			logoPublicId: input.logo?.publicId ?? null,
			coverImageUrl: input.cover?.url ?? null,
			coverPublicId: input.cover?.publicId ?? null,
			location: input.campus.trim(),
			contactNumber: input.phone.trim(),
			contactEmail: input.email.trim(),
			preparationTime: input.prepTime,
			rating: 5,
			status: "CLOSED",
			openingHours: input.hours,
			vendorId: null,
			payoutConfigured: false
		});
		setActiveShopId(shopId);
		return shopId;
	}, [uid]);
	const updateShop = (0, import_react.useCallback)((patch) => {
		if (!activeShopId) return;
		const doc = {};
		if (patch.name !== void 0) doc["name"] = patch.name;
		if (patch.description !== void 0) doc["description"] = patch.description;
		if (patch.category !== void 0) doc["category"] = patch.category;
		if (patch.phone !== void 0) doc["contactNumber"] = patch.phone;
		if (patch.email !== void 0) doc["contactEmail"] = patch.email;
		if (patch.campus !== void 0) doc["location"] = patch.campus;
		if (patch.prepTime !== void 0) doc["preparationTime"] = patch.prepTime;
		if (patch.hours !== void 0) doc["openingHours"] = patch.hours;
		if (patch.logo !== void 0) doc["logoUrl"] = patch.logo;
		if (patch.logoPublicId !== void 0) doc["logoPublicId"] = patch.logoPublicId;
		if (patch.cover !== void 0) doc["coverImageUrl"] = patch.cover;
		if (patch.coverPublicId !== void 0) doc["coverPublicId"] = patch.coverPublicId;
		if (patch.paymentConnected !== void 0) doc["payoutConfigured"] = patch.paymentConnected;
		if (patch.availability !== void 0) doc["status"] = AVAILABILITY_TO_STATUS[patch.availability];
		if (Object.keys(doc).length === 0) return;
		updateShopDoc(activeShopId, doc).catch((e) => fail(e, "Unable to save your changes."));
	}, [activeShopId]);
	const setAvailability = (0, import_react.useCallback)((a) => {
		if (!activeShopId) return;
		const newStatus = AVAILABILITY_TO_STATUS[a];
		setShopDocs((prev) => prev.map((s) => s.shopId === activeShopId ? {
			...s,
			status: newStatus
		} : s));
		setShopStatus(activeShopId, newStatus).catch((e) => {
			fail(e, "Unable to update your shop status.");
		});
	}, [activeShopId]);
	const addMenuItem = (0, import_react.useCallback)((item) => {
		if (!activeShopId) return;
		createMenuItem(activeShopId, {
			shopId: activeShopId,
			name: item.name,
			description: item.description,
			price: item.price,
			imageUrl: item.image || null,
			cloudinaryPublicId: item.imagePublicId ?? null,
			categoryId: item.categoryId ?? categoryIds[item.category] ?? "",
			categoryName: item.category,
			available: item.available,
			popular: item.popular,
			veg: item.veg,
			ingredients: item.ingredients ?? "",
			preparationTime: item.prepTime ?? ""
		}).catch((e) => fail(e, "Unable to save this item."));
	}, [activeShopId, categoryIds]);
	const updateMenuItem$1 = (0, import_react.useCallback)((id, patch) => {
		if (!activeShopId) return;
		const doc = {};
		if (patch.name !== void 0) doc["name"] = patch.name;
		if (patch.description !== void 0) doc["description"] = patch.description;
		if (patch.price !== void 0) doc["price"] = patch.price;
		if (patch.image !== void 0) doc["imageUrl"] = patch.image || null;
		if (patch.imagePublicId !== void 0) doc["cloudinaryPublicId"] = patch.imagePublicId;
		if (patch.available !== void 0) doc["available"] = patch.available;
		if (patch.popular !== void 0) doc["popular"] = patch.popular;
		if (patch.veg !== void 0) doc["veg"] = patch.veg;
		if (patch.ingredients !== void 0) doc["ingredients"] = patch.ingredients;
		if (patch.prepTime !== void 0) doc["preparationTime"] = patch.prepTime;
		if (patch.category !== void 0) {
			doc["categoryName"] = patch.category;
			doc["categoryId"] = patch.categoryId ?? categoryIds[patch.category] ?? "";
		}
		if (Object.keys(doc).length === 0) return;
		setMenu((prev) => prev.map((m) => m.itemId === id ? {
			...m,
			...doc
		} : m));
		updateMenuItem(activeShopId, id, doc).catch((e) => fail(e, "Unable to save this item."));
	}, [activeShopId, categoryIds]);
	const deleteMenuItem$1 = (0, import_react.useCallback)((id) => {
		if (!activeShopId) return;
		deleteMenuItem(activeShopId, id).catch((e) => fail(e, "Unable to delete this item."));
	}, [activeShopId]);
	const addCategory = (0, import_react.useCallback)((name) => {
		if (!activeShopId || categoryIds[name]) return;
		createCategory(activeShopId, name).catch((e) => fail(e, "Unable to add this category."));
	}, [activeShopId, categoryIds]);
	const renameCategory$1 = (0, import_react.useCallback)((from, to) => {
		const id = categoryIds[from];
		if (!activeShopId || !id) return;
		renameCategory(activeShopId, id, to, menu).catch((e) => fail(e, "Unable to rename this category."));
	}, [
		activeShopId,
		categoryIds,
		menu
	]);
	const deleteCategory$1 = (0, import_react.useCallback)((name) => {
		const id = categoryIds[name];
		if (!activeShopId || !id) return;
		deleteCategory(activeShopId, id, menu).catch((e) => fail(e, "Unable to delete this category."));
	}, [
		activeShopId,
		categoryIds,
		menu
	]);
	const setOrderStatus$1 = (0, import_react.useCallback)((orderId, status) => {
		setOrderStatus(orderId, toBackendStatus(status)).then(() => toast.success(`Order marked ${status.toLowerCase()}`)).catch((e) => fail(e, "Unable to update this order."));
	}, []);
	const value = {
		hydrated: ready,
		authed: Boolean(uid) && (profile?.role === "SHOP_OWNER" || profile?.role === "SUPER_ADMIN"),
		loading: !shopsLoaded,
		owner: profile ? {
			name: profile.name,
			email: profile.email
		} : null,
		shops,
		activeShopId,
		activeShop,
		setActiveShop: setActiveShopId,
		signOut: logout,
		createShop,
		updateShop,
		setAvailability,
		addMenuItem,
		updateMenuItem: updateMenuItem$1,
		deleteMenuItem: deleteMenuItem$1,
		addCategory,
		renameCategory: renameCategory$1,
		deleteCategory: deleteCategory$1,
		setOrderStatus: setOrderStatus$1
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MerchantContext.Provider, {
		value,
		children
	});
}
function useMerchant() {
	const ctx = (0, import_react.useContext)(MerchantContext);
	if (!ctx) throw new Error("useMerchant must be used inside MerchantProvider");
	return ctx;
}
//#endregion
export { __exportAll as C, supabase_exports as E, useAuth as S, supabase as T, useCatalog as _, SHOP_CATEGORIES as a, uploadImage as b, formatMoney as c, cn as d, CATEGORIES as f, getShop as g, formatPrice as h, DAYS as i, formatTime as l, StoreProvider as m, MerchantProvider as n, TIME_OPTIONS as o, CatalogProvider as p, useMerchant as r, defaultHours as s, router_exports as t, nextStatus as u, useStore as v, createShopOwnerAndShop as w, AuthProvider as x, cloudinaryFolders as y };
