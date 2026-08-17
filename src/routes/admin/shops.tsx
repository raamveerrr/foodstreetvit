import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button, Card } from "@/components/merchant/MerchantUI";
import { useAuth } from "@/lib/auth-store";
import { getDb } from "@/lib/firebase/client";
import { collection, query, orderBy, getDocs } from "firebase/firestore";

export const Route = createFileRoute("/admin/shops")({
  head: () => ({ meta: [{ title: "Admin — Shops" }] }),
  component: AdminShopsPage,
});

function AdminShopsPage() {
  const { profile, ready, firebaseUser } = useAuth();
  const [shops, setShops] = useState<any[]>([]);
  const location = useLocation();
  const debug = { timestamp: "hydration-safe" };

  if (location.pathname !== "/admin/shops") {
    return <Outlet />;
  }

  useEffect(() => {
    if (!ready || !profile || profile.role !== "SUPER_ADMIN") return;
    (async () => {
      const db = getDb();
      const q = query(collection(db, "shops"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setShops(snap.docs.map((d) => d.data()));
    })();
  }, [profile, ready]);

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
      {ready && firebaseUser && !profile && <p style={{ padding: '20px', color: '#ff9800' }}>⏳ Loading profile from Firestore...</p>}
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
            {shops.length === 0 && <p style={{ color: '#999' }}>No shops yet. Create your first shop.</p>}
            {shops.map((s) => (
              <Card key={s.shopId} className="p-4">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>{s.name}</p>
                    <p style={{ fontSize: '14px', color: '#999', margin: 0 }}>Owner: {s.ownerId}</p>
                  </div>
                  <div style={{ fontSize: '14px', color: '#999' }}>{new Date(s.createdAt?._seconds*1000).toLocaleString()}</div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
