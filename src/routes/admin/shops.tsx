import { createFileRoute, Link } from "@tanstack/react-router";
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
  const { profile } = useAuth();
  const [shops, setShops] = useState<any[]>([]);

  useEffect(() => {
    if (!profile || profile.role !== "SUPER_ADMIN") return;
    (async () => {
      const db = getDb();
      const q = query(collection(db, "shops"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setShops(snap.docs.map((d) => d.data()));
    })();
  }, [profile]);

  if (!profile) return <div className="p-6">Please sign in as an administrator.</div>;
  if (profile.role !== "SUPER_ADMIN") return <div className="p-6">Access denied.</div>;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-16 pt-6 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Shops</h1>
        <Link to="/admin/shops/create">
          <Button>Create Shop & Owner</Button>
        </Link>
      </div>
      <div className="grid gap-3">
        {shops.map((s) => (
          <Card key={s.shopId} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{s.name}</p>
                <p className="text-sm text-muted-foreground">Owner: {s.ownerId}</p>
              </div>
              <div className="text-sm text-muted-foreground">{new Date(s.createdAt?._seconds*1000).toLocaleString()}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
