import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Printer, Wifi, WifiOff, RefreshCw, Plus, Trash2 } from "lucide-react";
import { MerchantShell } from "@/components/merchant/MerchantShell";
import {
    Button,
    Card,
    SectionHeading,
} from "@/components/merchant/MerchantUI";
import { useMerchant } from "@/lib/merchant-store";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shop/printer")({
    head: () => ({
        meta: [
            { title: "Printer Management — DigitalFoodStreet Shop" },
            { name: "robots", content: "noindex" },
        ],
    }),
    component: PrinterPage,
});

// ── Types ──────────────────────────────────────────────────────────────────
interface PrinterRow {
    id: string;
    name: string;
    connection_type: string;
    status: string;
    last_seen_at: string | null;
}

interface PrintJob {
    id: string;
    status: string;
    is_test: boolean;
    created_at: string;
    orders?: Array<{
        order_number: string;
        receipts?: Array<{ receipt_number: string }> | null;
    }> | null;
}

// ── Status helpers ─────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    const isOnline = status === "ONLINE" || status === "PRINTING";
    return (
        <span
            className={cn(
                "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase",
                isOnline ? "bg-success-soft text-success" : "bg-secondary text-muted-foreground",
            )}
        >
            {isOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
            {isOnline ? "Online" : "Offline"}
        </span>
    );
}

function JobStatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        QUEUED: "bg-blue-500/10 text-blue-400",
        PRINTING: "bg-success-soft text-success",
        PRINTED: "bg-secondary text-muted-foreground",
        FAILED: "bg-destructive/10 text-destructive",
        CANCELLED: "bg-secondary text-muted-foreground",
    };
    return (
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", colors[status] || "")}>
            {status}
        </span>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────
function PrinterPage() {
    const { activeShop } = useMerchant();
    const shopId = activeShop?.id;

    const [printers, setPrinters] = useState<PrinterRow[]>([]);
    const [jobs, setJobs] = useState<PrintJob[]>([]);
    const [pairingCode, setPairingCode] = useState<string | null>(null);
    const [newPrinterId, setNewPrinterId] = useState<string | null>(null);
    const [loadingPair, setLoadingPair] = useState(false);
    const [loadingTest, setLoadingTest] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async () => {
        if (!shopId) return;
        setRefreshing(true);

        const { data: p } = await supabase
            .from("printers")
            .select("id, name, connection_type, status, last_seen_at")
            .eq("shop_id", shopId)
            .order("last_seen_at", { ascending: false });

        const { data: j } = await supabase
            .from("print_jobs")
            .select(`
        id, status, is_test, created_at,
        orders ( order_number, receipts ( receipt_number ) )
      `)
            .eq("shop_id", shopId)
            .order("created_at", { ascending: false })
            .limit(20);

        setPrinters(p ?? []);
        setJobs(j ?? []);
        setRefreshing(false);
    }, [shopId]);

    useEffect(() => {
        fetchData();

        // Realtime: refresh when a print_job changes
        const channel = supabase
            .channel(`printer-dashboard-${shopId}`)
            .on("postgres_changes", {
                event: "*",
                schema: "public",
                table: "print_jobs",
                filter: `shop_id=eq.${shopId}`,
            }, fetchData)
            .on("postgres_changes", {
                event: "UPDATE",
                schema: "public",
                table: "printers",
                filter: `shop_id=eq.${shopId}`,
            }, fetchData)
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [shopId, fetchData]);

    // ── Generate pairing code ──────────────────────────────────────────────
    async function handleGeneratePairingCode() {
        if (!shopId) return;
        setLoadingPair(true);
        setPairingCode(null);
        setNewPrinterId(null);

        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;

        if (!token) {
            toast.error("Not authenticated");
            setLoadingPair(false);
            return;
        }

        const { data: resp, error } = await supabase.functions.invoke("generate-printer-pairing-code", {
            body: { shop_id: shopId, printer_name: "Thermal Printer", connection_type: "USB" },
        });

        if (error || !resp?.success) {
            toast.error(resp?.message || "Failed to generate pairing code");
        } else {
            setPairingCode(resp.pairing_code as string);
            setNewPrinterId(resp.printer_id as string);
            toast.success("Pairing code generated! Valid for 10 minutes.");
            await fetchData();
        }
        setLoadingPair(false);
    }

    // ── Test print ──────────────────────────────────────────────────────────
    async function handleTestPrint(printerId: string | null) {
        if (!shopId) return;
        setLoadingTest(printerId ?? "any");

        const { data: resp, error } = await supabase.functions.invoke("create-test-print-job", {
            body: { shop_id: shopId, printer_id: printerId },
        });

        if (error || !resp?.success) {
            toast.error(resp?.message || "Failed to queue test print");
        } else {
            toast.success("Test print queued! The printer will print shortly.");
            await fetchData();
        }
        setLoadingTest(null);
    }

    // ── Cancel a job ──────────────────────────────────────────────────────
    async function handleCancelJob(jobId: string) {
        await supabase
            .from("print_jobs")
            .update({ status: "CANCELLED" })
            .eq("id", jobId)
            .in("status", ["QUEUED"]); // only cancel if still queued

        await fetchData();
        toast.success("Job cancelled");
    }

    // ── Delete Printer ────────────────────────────────────────────────────
    async function handleDeletePrinter(id: string) {
        if (!confirm("Are you sure you want to remove this printer? The connected Print Agent will be unlinked automatically.")) return;

        await supabase.from("printers").delete().eq("id", id);
        toast.success("Printer deleted");
        await fetchData();
    }

    if (!shopId) return null;

    const activeJobs = jobs.filter((j) => ["QUEUED", "PRINTING"].includes(j.status));
    const recentJobs = jobs.filter((j) => !["QUEUED", "PRINTING"].includes(j.status)).slice(0, 8);

    return (
        <MerchantShell
            title="Printer Management"
            subtitle="Pair thermal printers and monitor print queues."
        >
            <div className="space-y-6">
                {/* ── Printers List ── */}
                <section>
                    <SectionHeading
                        title="Printers"
                        description="USB thermal printers paired to this shop."
                    />
                    {printers.length === 0 ? (
                        <Card className="text-center py-6">
                            <Printer size={28} className="mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm font-medium">No printer paired yet.</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Generate a pairing code and enter it in the Print Agent.
                            </p>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {printers.map((p) => (
                                <Card key={p.id} className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={cn(
                                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                                                p.status === "ONLINE" || p.status === "PRINTING"
                                                    ? "bg-success-soft"
                                                    : "bg-secondary",
                                            )}
                                        >
                                            <Printer size={16} />
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold">{p.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {p.connection_type} ·{" "}
                                                {p.last_seen_at
                                                    ? `Last seen ${new Date(p.last_seen_at).toLocaleTimeString("en-IN")}`
                                                    : "Never connected"}
                                            </p>
                                            <p className="mt-0.5 text-[10px] font-mono text-muted-foreground/60">
                                                ID: {p.id}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <StatusBadge status={p.status} />
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                className="h-7 px-3 text-[11px]"
                                                onClick={() => handleTestPrint(p.id)}
                                                disabled={loadingTest === p.id}
                                            >
                                                {loadingTest === p.id ? "Queuing…" : "Test Print"}
                                            </Button>
                                            <button
                                                onClick={() => handleDeletePrinter(p.id)}
                                                className="text-muted-foreground hover:text-destructive transition-colors flex h-7 items-center px-1"
                                                title="Delete Printer"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </section>

                {/* ── Pair New Printer ── */}
                <section>
                    <SectionHeading
                        title="Pair New Printer"
                        description="Generate a one-time code to pair the Windows Print Agent."
                    />
                    <Card className="space-y-4">
                        {pairingCode ? (
                            <div className="text-center py-2">
                                <p className="text-xs text-muted-foreground mb-1">Enter this code in the Print Agent:</p>
                                <p className="font-mono text-4xl font-bold tracking-[0.2em] text-primary">{pairingCode}</p>
                                <p className="text-xs text-muted-foreground mt-2">Valid for 10 minutes</p>
                                {newPrinterId && (
                                    <div className="mt-3 bg-secondary/40 rounded-lg px-3 py-2 text-left">
                                        <p className="text-[11px] text-muted-foreground">Printer ID (copy to Print Agent):</p>
                                        <p className="font-mono text-xs font-semibold mt-0.5 break-all">{newPrinterId}</p>
                                    </div>
                                )}
                                <Button
                                    variant="outline"
                                    className="mt-4 w-full"
                                    onClick={() => { setPairingCode(null); setNewPrinterId(null); }}
                                >
                                    Done
                                </Button>
                            </div>
                        ) : (
                            <Button
                                className="w-full"
                                onClick={handleGeneratePairingCode}
                                disabled={loadingPair}
                            >
                                <Plus size={15} className="mr-1.5" />
                                {loadingPair ? "Generating…" : "Generate Pairing Code"}
                            </Button>
                        )}
                    </Card>
                </section>

                {/* ── Active Queue ── */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <SectionHeading title="Print Queue" description={activeJobs.length ? `${activeJobs.length} job(s) pending` : "Queue is empty."} />
                        <button
                            onClick={fetchData}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                            disabled={refreshing}
                        >
                            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
                            Refresh
                        </button>
                    </div>
                    {activeJobs.length === 0 ? (
                        <p className="text-sm text-muted-foreground px-1">No jobs in queue.</p>
                    ) : (
                        <div className="space-y-2">
                            {activeJobs.map((j) => (
                                <Card key={j.id} className="flex items-center justify-between gap-3 py-3">
                                    <div>
                                        <p className="text-sm font-semibold">
                                            {j.is_test ? "🖨 TEST PRINT" : (j.orders?.[0]?.receipts?.[0]?.receipt_number || `Order #${j.orders?.[0]?.order_number}`)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(j.created_at).toLocaleTimeString("en-IN")}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <JobStatusBadge status={j.status} />
                                        {j.status === "QUEUED" && (
                                            <button
                                                onClick={() => handleCancelJob(j.id)}
                                                className="text-muted-foreground hover:text-destructive transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </section>

                {/* ── Recent History ── */}
                {recentJobs.length > 0 && (
                    <section>
                        <SectionHeading title="Recent History" description="Last printed receipts." />
                        <div className="space-y-2">
                            {recentJobs.map((j) => (
                                <Card key={j.id} className="flex items-center justify-between gap-3 py-3">
                                    <div>
                                        <p className="text-sm">
                                            {j.is_test ? "TEST PRINT" : (j.orders?.[0]?.receipts?.[0]?.receipt_number || `Order #${j.orders?.[0]?.order_number}`)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(j.created_at).toLocaleString("en-IN", { hour12: true })}
                                        </p>
                                    </div>
                                    <JobStatusBadge status={j.status} />
                                </Card>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </MerchantShell>
    );
}
