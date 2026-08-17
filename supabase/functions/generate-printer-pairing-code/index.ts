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
 * generate-printer-pairing-code
 * 
 * Called by authenticated shop owner to generate a one-time 6-digit pairing code.
 * The Windows Print Agent uses this code to authenticate itself.
 * 
 * Body: { shop_id: string, printer_name?: string, connection_type?: "USB" | "LAN" }
 * Returns: { pairing_code: string, printer_id: string, expires_in_minutes: number }
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

        // Authenticate as shop owner
        const token = authHeader.replace("Bearer ", "");
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) {
            return jsonResponse({ success: false, message: "Invalid session" }, 401);
        }

        const body = await req.json();
        const { shop_id, printer_name, connection_type } = body;

        if (!shop_id) {
            return jsonResponse({ success: false, message: "shop_id required" }, 400);
        }

        // Verify this user owns the shop
        const { data: shop } = await supabase
            .from("shops")
            .select("shop_id")
            .eq("shop_id", shop_id)
            .eq("owner_uid", user.id)
            .single();

        if (!shop) {
            return jsonResponse({ success: false, message: "Shop not found or access denied" }, 403);
        }

        // Generate a secure 6-digit pairing code
        const pairingCodeInt = Math.floor(100000 + Math.random() * 900000);
        const pairingCode = String(pairingCodeInt);

        // Hash it for storage (simple SHA-256)
        const encoder = new TextEncoder();
        const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(pairingCode));
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const codeHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

        // Create or update printer record
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const { data: printer, error: printerError } = await supabase
            .from("printers")
            .insert({
                shop_id,
                name: printer_name || "Thermal Printer",
                connection_type: connection_type || "USB",
                status: "OFFLINE",
                pairing_code: codeHash, // store only the hash
                pairing_code_expires_at: expiresAt.toISOString()
            })
            .select("id")
            .single();

        if (printerError || !printer) {
            console.error("Failed to create printer:", printerError);
            return jsonResponse({ success: false, message: "Failed to create printer record" }, 500);
        }

        return jsonResponse({
            success: true,
            pairing_code: pairingCode, // return plaintext to shop owner (shown once)
            printer_id: printer.id,
            expires_in_minutes: 10,
            message: "Show this code to the Print Agent to pair the printer."
        });

    } catch (error) {
        console.error("Unhandled error:", error);
        return jsonResponse({ success: false, message: "Internal server error" }, 500);
    }
});
