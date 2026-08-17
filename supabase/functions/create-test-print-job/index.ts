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

/**
 * create-test-print-job
 *
 * Called by authenticated shop owner from the admin dashboard.
 * Creates a test print job (is_test = true) that does NOT create
 * a real order, receipt, or any payment record.
 * 
 * The Print Agent prints a test page when it sees a test job.
 *
 * Body: { shop_id: string, printer_id?: string }
 */
Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    if (req.method !== "POST") {
        return jsonResponse({ success: false, message: "Method not allowed" }, 405);
    }

    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return jsonResponse({ success: false, message: "Unauthorized" }, 401);
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, serviceRoleKey);

        const token = authHeader.replace("Bearer ", "");
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) {
            return jsonResponse({ success: false, message: "Invalid session" }, 401);
        }

        const body = await req.json();
        const { shop_id, printer_id } = body;

        if (!shop_id) {
            return jsonResponse({ success: false, message: "shop_id required" }, 400);
        }

        // Verify shop ownership
        const { data: shop } = await supabase
            .from("shops")
            .select("shop_id, name")
            .eq("shop_id", shop_id)
            .eq("owner_uid", user.id)
            .single();

        if (!shop) {
            return jsonResponse({ success: false, message: "Shop not found or access denied" }, 403);
        }

        // Resolve printer (provided or auto-detect)
        let resolvedPrinterId = printer_id || null;
        if (!resolvedPrinterId) {
            const { data: p } = await supabase
                .from("printers")
                .select("id")
                .eq("shop_id", shop_id)
                .order("last_seen_at", { ascending: false })
                .limit(1)
                .maybeSingle();
            resolvedPrinterId = p?.id || null;
        }

        // Insert test print job (no order_id, no receipt_id)
        const { data: job, error: jobError } = await supabase
            .from("print_jobs")
            .insert({
                order_id: null,      // no real order
                receipt_id: null,    // no real receipt
                shop_id,
                printer_id: resolvedPrinterId,
                status: "QUEUED",
                is_test: true,
                attempt_count: 0,
                priority: 10         // test prints get bumped to front
            })
            .select("id")
            .single();

        if (jobError || !job) {
            console.error("Failed to create test job:", jobError);
            return jsonResponse({ success: false, message: "Failed to create test print job" }, 500);
        }

        return jsonResponse({
            success: true,
            job_id: job.id,
            message: "Test print job queued. The printer will print a test page."
        });

    } catch (error) {
        console.error("Unhandled error:", error);
        return jsonResponse({ success: false, message: "Internal server error" }, 500);
    }
});
