import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button, Card } from "@/components/merchant/MerchantUI";
import { useAuth } from "@/lib/auth-store";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/shops")({
  head: () => ({ meta: [{ title: "Admin — Shops" }] }),
  component: AdminShopsPage,
});

function AdminShopsPage() {
  const { profile, ready, firebaseUser } = useAuth();
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const debug = { timestamp: "hydration-safe" };

  // Hooks MUST be called unconditionally
  useEffect(() => {
    if (!ready || !profile || profile.role !== "SUPER_ADMIN") {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const { data, error } = await supabase.from("shops").select("*").order("created_at", { ascending: false });
        if (error) {
          console.error("Failed to fetch shops:", error);
        } else {
          setShops(data ?? []);
        }
      } catch (err) {
        console.error("Error fetching shops:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [profile, ready]);

  async function handleDeleteShop(shopId: string, shopName: string) {
    if (!confirm(`Are you sure you want to permanently delete "${shopName}" and all of its associated data?`)) return;

    try {
      const { error } = await supabase.from("shops").delete().eq("id", shopId);
      if (error) throw error;
      setShops(shops.filter((s) => s.id !== shopId));
      alert("Shop deleted successfully.");
    } catch (error: any) {
      console.error("Failed to delete shop:", error);
      alert(`Failed to delete shop: ${error.message}`);
    }
  }

  // Handle nested route rendering
  if (location.pathname !== "/admin/shops") {
    return <Outlet />;
  }

  // TEST: Render simple static content to verify component is rendering
  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-16 pt-6 sm:px-6">
      <div style={{ padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px', marginBottom: '20px' }}>
        <h2 style={{ marginBottom: '10px', fontWeight: 'bold', color: '#333' }}>DEBUG INFO</h2>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Timestamp: {debug.timestamp}</p>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Ready: {String(ready)}</p>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Has FirebaseUser: {Boolean(firebaseUser)}</p>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Has Profile: {Boolean(profile)}</p>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Role: {profile?.role || 'undefined'}</p>
        <details style={{ marginTop: '10px', padding: '10px', backgroundColor: 'white', borderRadius: '4px' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Full Profile JSON</summary>
          <pre style={{ marginTop: '10px', fontSize: '12px', overflow: 'auto' }}>{JSON.stringify(profile, null, 2)}</pre>
        </details>
      </div>

      {!ready && <p style={{ padding: '20px', color: '#666' }}>⏳ Loading authentication...</p>}
      {ready && !firebaseUser && <p style={{ padding: '20px', color: '#d32f2f' }}>❌ Not signed in</p>}
      {ready && firebaseUser && !profile && <p style={{ padding: '20px', color: '#ff9800' }}>⏳ Loading profile...</p>}
      {ready && profile && profile.role !== "SUPER_ADMIN" && (
        <p style={{ padding: '20px', color: '#d32f2f' }}>❌ Access denied. Your role is: {profile.role}</p>
      )}

      {ready && profile && profile.role === "SUPER_ADMIN" && (
        <>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Shops</h1>
            <Link to="/admin/shops/create">
              <Button>Create Shop & Owner</Button>
            </Link>
          </div>
          <div style={{ display: 'grid', gap: '12px' }}>
            {loading && <p style={{ color: '#999' }}>Loading shops...</p>}
            {!loading && shops.length === 0 && <p style={{ color: '#999' }}>No shops yet. Create your first shop.</p>}
            {shops.map((s) => (
              <Card key={s.id} className="p-4">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>{s.name}</p>
                    <p style={{ fontSize: '14px', color: '#999', margin: 0 }}>Owner UID: {s.owner_uid}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <div style={{ fontSize: '14px', color: '#999' }}>{new Date(s.created_at).toLocaleString()}</div>
                    <Button
                      variant="outline"
                      onClick={() => handleDeleteShop(s.id, s.name)}
                      className="h-8 border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground px-3 text-xs"
                    >
                      Delete Shop
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
