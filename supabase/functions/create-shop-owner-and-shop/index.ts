interface CreateShopOwnerRequest {
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  temporaryPassword?: string;
  shop: {
    name: string;
    description: string;
    category: string;
    phone: string;
    email: string;
    campus: string;
    prepTime: string;
    hours: unknown;
    status?: "CLOSED" | "OPEN" | "TEMPORARILY_UNAVAILABLE";
  };
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ success: false, message: "Method not allowed" }, 405);
  }

  try {
    const payload = (await req.json()) as CreateShopOwnerRequest;
    console.log("Received payload:", JSON.stringify(payload, null, 2));

    // ── Validate required fields ──────────────────────────────────
    if (!payload.ownerName || !payload.ownerEmail || !payload.temporaryPassword || !payload.shop?.name) {
      return jsonResponse({ success: false, message: "Missing required fields" }, 400);
    }

    // ── Environment variables ─────────────────────────────────────
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing env vars:", { supabaseUrl: !!supabaseUrl, serviceRoleKey: !!serviceRoleKey });
      return jsonResponse({ success: false, message: "Server misconfiguration — missing env vars" }, 500);
    }

    // ── Verify caller is authenticated ────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ success: false, message: "Unauthorized — no auth header" }, 401);
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: serviceRoleKey,
      },
    });

    if (!userResponse.ok) {
      const userErr = await userResponse.text();
      console.error("Auth verification failed:", userErr);
      return jsonResponse({ success: false, message: "Invalid token" }, 401);
    }

    const currentUser = await userResponse.json();
    console.log("Caller UID:", currentUser.id);

    // ── Check SUPER_ADMIN role ────────────────────────────────────
    const profileResponse = await fetch(
      `${supabaseUrl}/rest/v1/users?uid=eq.${currentUser.id}&select=role`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
          "Content-Type": "application/json",
        },
      },
    );

    if (!profileResponse.ok) {
      const profErr = await profileResponse.text();
      console.error("Profile fetch failed:", profErr);
      return jsonResponse({ success: false, message: "Failed to fetch user profile" }, 500);
    }

    const profiles = await profileResponse.json();
    if (!profiles || profiles.length === 0) {
      return jsonResponse({ success: false, message: "User profile not found" }, 404);
    }

    if (profiles[0].role !== "SUPER_ADMIN") {
      return jsonResponse({ success: false, message: "Only SUPER_ADMIN can create shops" }, 403);
    }

    // ── Step 1: Create auth user ──────────────────────────────────
    const createUserBody = {
      email: payload.ownerEmail,
      password: payload.temporaryPassword,
      email_confirm: true,
    };
    console.log("Creating auth user with:", JSON.stringify(createUserBody));

    const createUserResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createUserBody),
    });

    const authData = await createUserResponse.json();

    if (!createUserResponse.ok) {
      console.error("Auth user creation failed:", JSON.stringify(authData));
      return jsonResponse({
        success: false,
        message: authData?.msg || authData?.message || authData?.error_description || "Failed to create auth user",
        detail: authData,
      }, 400);
    }

    // The Supabase Admin API returns the user object directly (NOT wrapped in { user: ... })
    const ownerUid = authData.id;
    if (!ownerUid) {
      console.error("No user ID in auth response:", JSON.stringify(authData));
      return jsonResponse({ success: false, message: "Auth user created but no ID returned" }, 500);
    }
    console.log("Auth user created:", ownerUid);

    // ── Step 2: Create user profile row ───────────────────────────
    const userProfileBody = {
      uid: ownerUid,
      name: payload.ownerName,
      email: payload.ownerEmail.toLowerCase(),
      phone: payload.ownerPhone || "",
      role: "SHOP_OWNER",
      must_change_password: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    console.log("Inserting user profile:", JSON.stringify(userProfileBody));

    const userInsertResponse = await fetch(`${supabaseUrl}/rest/v1/users`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(userProfileBody),
    });

    if (!userInsertResponse.ok) {
      const insertErr = await userInsertResponse.text();
      console.error("User profile insert failed:", insertErr);
      return jsonResponse({
        success: false,
        message: "Failed to create user profile: " + insertErr,
      }, 400);
    }
    console.log("User profile created for:", ownerUid);

    // ── Step 3: Create shop row ───────────────────────────────────
    const shopId =
      payload.shop.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .substring(0, 50) +
      "-" +
      Date.now();

    const shopBody = {
      shop_id: shopId,
      owner_uid: ownerUid,
      name: payload.shop.name,
      description: payload.shop.description,
      category: payload.shop.category,
      phone: payload.shop.phone,
      email: payload.shop.email,
      campus: payload.shop.campus,
      prep_time: payload.shop.prepTime,
      hours: payload.shop.hours,
      status: payload.shop.status || "CLOSED",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    console.log("Inserting shop:", JSON.stringify(shopBody));

    const shopInsertResponse = await fetch(`${supabaseUrl}/rest/v1/shops`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(shopBody),
    });

    if (!shopInsertResponse.ok) {
      const shopErr = await shopInsertResponse.text();
      console.error("Shop insert failed:", shopErr);
      return jsonResponse({
        success: false,
        message: "Failed to create shop: " + shopErr,
      }, 400);
    }
    console.log("Shop created:", shopId);

    // ── Success ───────────────────────────────────────────────────
    return jsonResponse({
      success: true,
      message: "Shop and owner created successfully.",
      shopId,
      shopName: payload.shop.name,
      ownerName: payload.ownerName,
      ownerEmail: payload.ownerEmail,
      temporaryPassword: payload.temporaryPassword,
    });
  } catch (error) {
    console.error("Unhandled error:", error);
    return jsonResponse(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      500,
    );
  }
});
