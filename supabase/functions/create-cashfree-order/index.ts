import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

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

const CASHFREE_BASE_URL = "https://sandbox.cashfree.com/pg";
const CF_API_VERSION = "2023-08-01";

interface OrderItemRequest {
    itemId: string;
    quantity: number;
}

interface CreateOrderRequest {
    shopId: string;
    items: OrderItemRequest[];
    customerPhone?: string;
    customerEmail?: string;
    customerName?: string;
}

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    if (req.method !== "POST") {
        return jsonResponse({ success: false, message: "Method not allowed" }, 405);
    }

    try {
        const payload = (await req.json()) as CreateOrderRequest;

        if (!payload.shopId || !payload.items || payload.items.length === 0) {
            return jsonResponse({ success: false, message: "Invalid order payload" }, 200);
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!supabaseUrl || !serviceRoleKey) {
            return jsonResponse({ success: false, message: "Server misconfiguration - Missing Supabase Keys" }, 200);
        }

        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return jsonResponse({ success: false, message: "Unauthorized - No Auth Header" }, 200);
        }
        const token = authHeader.replace("Bearer ", "");

        // Authenticate Student
        const supabase = createClient(supabaseUrl, serviceRoleKey);
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return jsonResponse({ success: false, message: "Invalid session - Failed to decode JWT" }, 200);
        }

        const studentId = user.id;

        // Load Shop Data
        const { data: shop, error: shopError } = await supabase
            .from("shops")
            .select("shop_id, name, cashfree_vendor_id, payment_ready, status")
            .eq("shop_id", payload.shopId)
            .single();

        if (shopError || !shop) {
            return jsonResponse({ success: false, message: "Shop not found" }, 200);
        }

        if (shop.status === "CLOSED" || shop.status === "TEMPORARILY_UNAVAILABLE") {
            return jsonResponse({ success: false, message: "Shop is closed" }, 200);
        }

        if (!shop.payment_ready || !shop.cashfree_vendor_id) {
            return jsonResponse({ success: false, message: "Online payments are temporarily unavailable for this shop (Missing Vendor ID or Payment Ready)." }, 200);
        }

        // Load Menu Pricing to compute authoritative amount
        const itemIds = payload.items.map(i => i.itemId);
        const { data: menuItems, error: menuError } = await supabase
            .from("menu_items")
            .select("id, item_id, name, price, available")
            .eq("shop_id", payload.shopId)
            .in("item_id", itemIds);

        if (menuError || !menuItems || menuItems.length === 0) {
            return jsonResponse({ success: false, message: "Could not load menu items" }, 200);
        }

        let subtotal = 0;
        const finalItems = [];

        for (const reqItem of payload.items) {
            const dbItem = menuItems.find(m => m.item_id === reqItem.itemId);
            if (!dbItem) {
                return jsonResponse({ success: false, message: `Invalid item: ${reqItem.itemId}` }, 200);
            }
            if (!dbItem.available) {
                return jsonResponse({ success: false, message: `${dbItem.name} is currently unavailable` }, 200);
            }
            const itemSubtotal = dbItem.price * reqItem.quantity;
            subtotal += itemSubtotal;

            finalItems.push({
                item_id: dbItem.item_id,
                name: dbItem.name,
                price: dbItem.price,
                quantity: reqItem.quantity,
                item_total: itemSubtotal
            });
        }

        // Platform Commission Config
        // Format is {"commission": {"mode": "PERCENTAGE", "value": 1}}
        const { data: configRecord } = await supabase.from("config").select("value").eq("key", "platform").single();
        let commissionPercentage = 5; // Default 5% if not found
        if (configRecord && configRecord.value?.commission?.value) {
            commissionPercentage = configRecord.value.commission.value;
        }

        const discount = 0; // Or calculate if required
        const platformCommission = Math.round((subtotal * commissionPercentage) / 100);
        const totalAmount = subtotal - discount;
        const shopAmount = totalAmount - platformCommission;

        const orderNumber = Math.random().toString(36).substring(2, 7).toUpperCase();
        const appOrderId = crypto.randomUUID();

        const orderMeta = {
            id: appOrderId,
            order_id: `order_${Date.now()}_${orderNumber}`,
            order_number: orderNumber,
            student_id: studentId,
            shop_id: shop.shop_id,
            shop_name: shop.name,
            items: finalItems,
            subtotal,
            discount,
            platform_commission: platformCommission,
            shop_amount: shopAmount,
            total_amount: totalAmount,
            currency: "INR",
            payment_status: "PENDING_PAYMENT",
            order_status: "PENDING_PAYMENT"
        };

        const { error: orderInsertError } = await supabase.from("orders").insert(orderMeta);
        if (orderInsertError) {
            console.error(orderInsertError);
            return jsonResponse({ success: false, message: "Error creating application order: " + JSON.stringify(orderInsertError) }, 200);
        }

        // Cashfree Logic
        const cfClientId = Deno.env.get("CASHFREE_CLIENT_ID");
        const cfClientSecret = Deno.env.get("CASHFREE_CLIENT_SECRET");
        const env = Deno.env.get("CASHFREE_ENV") || "sandbox";
        const baseUrl = env === "sandbox" ? CASHFREE_BASE_URL : "https://api.cashfree.com/pg";

        if (!cfClientId || !cfClientSecret) {
            return jsonResponse({ success: false, message: "Payment gateway misconfigured (Missing CFO Client ID or Secret in Supabase Vault)" }, 200);
        }

        const cfOrderBody: Record<string, any> = {
            order_id: orderMeta.order_id,
            order_amount: totalAmount,
            order_currency: "INR",
            customer_details: {
                customer_id: studentId,
                customer_phone: payload.customerPhone || "9999999999",
                customer_email: payload.customerEmail || "test@digitalfoodstreet.com",
                customer_name: payload.customerName || "Student"
            }
        };

        if (shop.cashfree_vendor_id && shop.cashfree_vendor_id !== "test_vendor") {
            cfOrderBody.order_splits = [
                {
                    vendor_id: shop.cashfree_vendor_id,
                    amount: shopAmount
                }
            ];
        }

        console.log("Creating Cashfree Order:", JSON.stringify(cfOrderBody));

        const cfResponse = await fetch(`${baseUrl}/orders`, {
            method: "POST",
            headers: {
                "x-client-id": cfClientId,
                "x-client-secret": cfClientSecret,
                "x-api-version": CF_API_VERSION,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(cfOrderBody)
        });

        const cfData = await cfResponse.json();

        if (!cfResponse.ok) {
            console.error("Cashfree creation failed:", cfData);
            let detailMsg = "Unknown Error";
            if (cfData && typeof cfData === "object" && cfData.message) detailMsg = cfData.message;
            return jsonResponse({ success: false, message: "Failed to create gateway order: " + detailMsg, details: cfData }, 200);
        }

        // Create tracking payments row
        const paymentMeta = {
            app_order_id: appOrderId,
            student_id: studentId,
            shop_id: shop.shop_id,
            cashfree_order_id: orderMeta.order_id,
            payment_session_id: cfData.payment_session_id,
            amount: totalAmount,
            currency: "INR",
            payment_status: "PENDING"
        };

        await supabase.from("payments").insert(paymentMeta);

        return jsonResponse({
            success: true,
            order_id: orderMeta.order_id,
            payment_session_id: cfData.payment_session_id,
            total_amount: totalAmount
        });

    } catch (error: any) {
        console.error("Unhandled error:", error);
        return jsonResponse({ success: false, message: "Internal server error: " + error.message }, 200);
    }
});
