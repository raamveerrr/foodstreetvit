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

interface VerifyPaymentRequest {
    cashfreeOrderId: string;
}

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    if (req.method !== "POST") {
        return jsonResponse({ success: false, message: "Method not allowed" }, 405);
    }

    try {
        const payload = (await req.json()) as VerifyPaymentRequest;

        if (!payload.cashfreeOrderId) {
            return jsonResponse({ success: false, message: "Invalid payload" }, 400);
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!supabaseUrl || !serviceRoleKey) {
            return jsonResponse({ success: false, message: "Server misconfiguration" }, 500);
        }

        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return jsonResponse({ success: false, message: "Unauthorized" }, 401);
        }
        const token = authHeader.replace("Bearer ", "");

        // Authenticate Student
        const supabase = createClient(supabaseUrl, serviceRoleKey);
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return jsonResponse({ success: false, message: "Invalid session" }, 401);
        }

        const studentId = user.id;

        // Load Payment Record
        const { data: paymentRecord, error: paymentError } = await supabase
            .from("payments")
            .select("id, app_order_id, shop_id, payment_status")
            .eq("cashfree_order_id", payload.cashfreeOrderId)
            .eq("student_id", studentId)
            .single();

        if (paymentError || !paymentRecord) {
            return jsonResponse({ success: false, message: "Payment record not found" }, 404);
        }

        // Load Order Record
        const { data: orderRecord, error: orderError } = await supabase
            .from("orders")
            .select("id, order_number, payment_status, receipt_id")
            .eq("id", paymentRecord.app_order_id)
            .single();

        if (orderError || !orderRecord) {
            return jsonResponse({ success: false, message: "Associated order not found" }, 404);
        }

        if (paymentRecord.payment_status === "PAID" && orderRecord.receipt_id) {
            // Already processed (could be from webhook acting faster than the client callback)
            return jsonResponse({
                success: true,
                message: "Already verified",
                receipt_id: orderRecord.receipt_id,
                order_status: "PAID"
            });
        }

        // Cashfree Logic
        const cfClientId = Deno.env.get("CASHFREE_CLIENT_ID");
        const cfClientSecret = Deno.env.get("CASHFREE_CLIENT_SECRET");
        const env = Deno.env.get("CASHFREE_ENV") || "sandbox";
        const baseUrl = env === "sandbox" ? CASHFREE_BASE_URL : "https://api.cashfree.com/pg";

        if (!cfClientId || !cfClientSecret) {
            return jsonResponse({ success: false, message: "Payment gateway misconfigured" }, 500);
        }

        const cfResponse = await fetch(`${baseUrl}/orders/${payload.cashfreeOrderId}`, {
            method: "GET",
            headers: {
                "x-client-id": cfClientId,
                "x-client-secret": cfClientSecret,
                "x-api-version": CF_API_VERSION,
                "Content-Type": "application/json"
            }
        });

        const cfData = await cfResponse.json();

        if (!cfResponse.ok) {
            console.error("Cashfree fetch failed:", cfData);
            return jsonResponse({ success: false, message: "Failed to verify with Cashfree", details: cfData }, 500);
        }

        // Example Cashfree Statuses: PAID, ACTIVE, PENDING
        const cfStatus = cfData.order_status;

        if (cfStatus === "PAID") {
            // It's Paid! Atomically update state
            const generateReceipt = async () => {
                const receiptNumber = `FS-${orderRecord.order_number}`;
                const receiptPayload = {
                    receipt_number: receiptNumber,
                    order_id: orderRecord.id,
                    student_id: studentId,
                    shop_id: paymentRecord.shop_id,
                    status: "ACTIVE"
                };

                const { data: receiptRecord, error: rcptErr } = await supabase
                    .from("receipts")
                    .insert(receiptPayload)
                    .select("id")
                    .single();

                // EITHER it succeeded OR it hit unique constraint 
                // Find actual receipt either way
                const { data: realRcpt } = await supabase
                    .from("receipts")
                    .select("id")
                    .eq("order_id", orderRecord.id)
                    .single();

                return realRcpt?.id || receiptRecord?.id;
            };

            const finalReceiptId = await generateReceipt();
            if (!finalReceiptId) {
                throw new Error("Failed to construct receipt securely.");
            }

            // === Phase 6: Queue print job ===
            // ON CONFLICT idempotency: if webhook fires twice, only one print job is created.
            // Find the shop's primary printer (first ONLINE, else any)
            const { data: shopPrinter } = await supabase
                .from("printers")
                .select("id")
                .eq("shop_id", paymentRecord.shop_id)
                .order("last_seen_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            await supabase.from("print_jobs").upsert({
                order_id: orderRecord.id,
                receipt_id: finalReceiptId,
                shop_id: paymentRecord.shop_id,
                printer_id: shopPrinter?.id ?? null,
                status: "QUEUED",
                attempt_count: 0
            }, { onConflict: "order_id", ignoreDuplicates: true });
            // === End Phase 6 ===

            await supabase.from("payments").update({ payment_status: "PAID" }).eq("id", paymentRecord.id);

            await supabase.from("orders").update({
                payment_status: "PAID",
                order_status: "PAID",
                receipt_id: finalReceiptId
            }).eq("id", orderRecord.id);

            return jsonResponse({
                success: true,
                message: "Payment successfully verified.",
                receipt_id: finalReceiptId,
                order_status: "PAID"
            });

        } else if (cfStatus === "ACTIVE" || cfStatus === "PENDING") {
            return jsonResponse({ success: true, message: "Payment is still pending", order_status: "PENDING" });
        } else {
            await supabase.from("payments").update({ payment_status: "FAILED" }).eq("id", paymentRecord.id);
            await supabase.from("orders").update({ payment_status: "FAILED" }).eq("id", orderRecord.id);

            return jsonResponse({ success: false, message: "Payment definitively failed or cancelled.", order_status: "FAILED" });
        }

    } catch (error) {
        console.error("Unhandled error:", error);
        return jsonResponse({ success: false, message: "Internal server error" }, 500);
    }
});
