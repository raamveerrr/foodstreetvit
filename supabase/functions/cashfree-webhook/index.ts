import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-signature, x-webhook-timestamp",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
}

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    if (req.method !== "POST") {
        return jsonResponse({ success: false, message: "Method not allowed" }, 405);
    }

    try {
        const rawBody = await req.text();
        const signature = req.headers.get("x-webhook-signature");
        const timestamp = req.headers.get("x-webhook-timestamp");
        const webhookSecret = Deno.env.get("CASHFREE_WEBHOOK_SECRET");

        if (!signature || !timestamp || !webhookSecret) {
            console.error("Missing webhook auth headers/secrets");
            return jsonResponse({ success: false, message: "Webhook missing auth info" }, 401);
        }

        // 1. Verify Signature using Web Crypto API
        const encoder = new TextEncoder();
        const keyData = encoder.encode(webhookSecret);
        const dataToSign = encoder.encode(timestamp + rawBody);

        const cryptoKey = await crypto.subtle.importKey(
            "raw",
            keyData,
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
        );

        const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, dataToSign);
        const expectedSignature = encodeBase64(signatureBuffer);

        if (expectedSignature !== signature) {
            console.error("Invalid Webhook Signature.");
            return jsonResponse({ success: false, message: "Invalid Signature" }, 401);
        }

        // 2. Parse payload
        const payload = JSON.parse(rawBody);
        console.log("Verified Webhook Payload:", JSON.stringify(payload));

        const eventId = payload.data?.payment?.cf_payment_id || payload.type + timestamp;
        const eventType = payload.type;
        const cashfreeOrderId = payload.data?.order?.order_id;
        const paymentStatus = payload.data?.payment?.payment_status;

        if (!cashfreeOrderId) {
            return jsonResponse({ success: true, message: "No order ID, ignoring" });
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!supabaseUrl || !serviceRoleKey) {
            return jsonResponse({ success: false, message: "Server Misconfiguration" }, 500);
        }

        const supabase = createClient(supabaseUrl, serviceRoleKey);

        // 3. Idempotency Check
        const { data: existingEvent } = await supabase
            .from("payment_webhook_events")
            .select("id")
            .eq("event_id", String(eventId))
            .single();

        if (existingEvent) {
            console.log("Duplicate Webhook ignored:", eventId);
            return jsonResponse({ success: true, message: "Already Processed" });
        }

        // Log the event immediately to prevent duplicate runs
        const { error: eventInsertError } = await supabase
            .from("payment_webhook_events")
            .insert({
                event_id: String(eventId),
                event_type: eventType,
                cashfree_order_id: cashfreeOrderId,
                payload_hash: expectedSignature
            });

        if (eventInsertError) {
            console.error("Idempotency insertion error:", eventInsertError);
            return jsonResponse({ success: false, message: "Concurrent Webhook execution blocked" }, 409);
        }

        // 4. Update Business Logic
        if (eventType === "PAYMENT_SUCCESS_WEBHOOK" || paymentStatus === "SUCCESS") {
            const { data: paymentRecord } = await supabase
                .from("payments")
                .select("id, app_order_id, shop_id, student_id")
                .eq("cashfree_order_id", cashfreeOrderId)
                .single();

            if (!paymentRecord) {
                console.warn("Payment record not found for webhook:", cashfreeOrderId);
                return jsonResponse({ success: true, message: "Orphaned cashfree order ignores" });
            }

            const { data: orderRecord } = await supabase
                .from("orders")
                .select("id, order_number, payment_status, receipt_id")
                .eq("id", paymentRecord.app_order_id)
                .single();

            if (orderRecord && orderRecord.payment_status !== "PAID" && !orderRecord.receipt_id) {
                const receiptNumber = `FS-${orderRecord.order_number}`;
                const receiptPayload = {
                    receipt_number: receiptNumber,
                    order_id: orderRecord.id,
                    student_id: paymentRecord.student_id,
                    shop_id: paymentRecord.shop_id,
                    status: "ACTIVE"
                };

                await supabase.from("receipts").insert(receiptPayload);

                const { data: newReceipt } = await supabase
                    .from("receipts")
                    .select("id")
                    .eq("order_id", orderRecord.id)
                    .single();

                if (newReceipt) {
                    await supabase.from("payments").update({ payment_status: "PAID" }).eq("id", paymentRecord.id);
                    await supabase.from("orders").update({
                        payment_status: "PAID",
                        order_status: "PAID",
                        receipt_id: newReceipt.id
                    }).eq("id", orderRecord.id);
                }
            }
        } else if (eventType === "PAYMENT_FAILED_WEBHOOK") {
            await supabase.from("payments").update({ payment_status: "FAILED" }).eq("cashfree_order_id", cashfreeOrderId);
            // Optional: fail the app_order
        }

        // Mark event processed
        await supabase.from("payment_webhook_events")
            .update({ processing_status: "COMPLETED", processed_at: new Date().toISOString() })
            .eq("event_id", String(eventId));

        return jsonResponse({ success: true, message: "Webhook successfully processed." });

    } catch (error) {
        console.error("Unhandled webhook error:", error);
        return jsonResponse({ success: false, message: "Internal server error" }, 500);
    }
});
