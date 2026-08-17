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
 * authenticate-printer
 *
 * Called by the Windows Print Agent during initial setup.
 * Takes a pairing code, validates it, and returns a long-lived
 * agent token (NOT a service role key) that the agent stores locally.
 *
 * The agent token is stored hashed in the printers table.
 * The print agent uses this token to authenticate future requests.
 *
 * Body: { printer_id: string, pairing_code: string }
 * Returns: { agent_token: string, shop_id: string, printer_name: string }
 */
Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    if (req.method !== "POST") {
        return jsonResponse({ success: false, message: "Method not allowed" }, 405);
    }

    try {
        const body = await req.json();
        const { printer_id, pairing_code } = body;

        if (!printer_id || !pairing_code) {
            return jsonResponse({ success: false, message: "printer_id and pairing_code required" }, 400);
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, serviceRoleKey);

        // Fetch printer record
        const { data: printer } = await supabase
            .from("printers")
            .select("id, shop_id, name, pairing_code, pairing_code_expires_at")
            .eq("id", printer_id)
            .single();

        if (!printer) {
            return jsonResponse({ success: false, message: "Printer not found" }, 404);
        }

        // Check pairing code expiry
        if (!printer.pairing_code_expires_at || new Date(printer.pairing_code_expires_at) < new Date()) {
            return jsonResponse({ success: false, message: "Pairing code expired. Generate a new one." }, 401);
        }

        // Hash the provided code and compare
        const encoder = new TextEncoder();
        const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(pairing_code));
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const providedHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

        if (providedHash !== printer.pairing_code) {
            return jsonResponse({ success: false, message: "Invalid pairing code" }, 401);
        }

        // Generate a long-lived agent token (cryptographically random)
        const tokenBytes = new Uint8Array(32);
        crypto.getRandomValues(tokenBytes);
        const agentToken = Array.from(tokenBytes).map(b => b.toString(16).padStart(2, "0")).join("");

        // Hash agent token for storage
        const tokenHashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(agentToken));
        const tokenHashArray = Array.from(new Uint8Array(tokenHashBuffer));
        const agentTokenHash = tokenHashArray.map(b => b.toString(16).padStart(2, "0")).join("");

        // Save hashed token, clear pairing code
        await supabase
            .from("printers")
            .update({
                auth_token_hash: agentTokenHash,
                pairing_code: null,
                pairing_code_expires_at: null,
                status: "OFFLINE",
                last_seen_at: new Date().toISOString()
            })
            .eq("id", printer_id);

        return jsonResponse({
            success: true,
            agent_token: agentToken, // plaintext returned ONCE, agent must store securely
            printer_id: printer.id,
            shop_id: printer.shop_id,
            printer_name: printer.name,
            supabase_url: supabaseUrl,
            anon_key: Deno.env.get("SUPABASE_ANON_KEY"),
            message: "Printer paired successfully. Store the agent_token securely."
        });

    } catch (error) {
        console.error("Unhandled error:", error);
        return jsonResponse({ success: false, message: "Internal server error" }, 500);
    }
});
