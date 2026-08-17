import { createFileRoute, useNavigate, Outlet } from "@tanstack/react-router";
import { useLayoutEffect } from "react";
import { useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin — DigitalFoodStreet" }],
  }),
  component: AdminShell,
});

function AdminShell() {
  const navigate = useNavigate();
  const { profile, ready } = useAuth();

  // Use useLayoutEffect to redirect synchronously before render
  useLayoutEffect(() => {
    if (!ready) return; // Wait for auth to be ready
    
    if (!profile) {
      void navigate({ to: "/login", replace: true });
      return;
    }
    
    if (profile.role !== "SUPER_ADMIN") {
      void navigate({ to: "/", replace: true });
      return;
    }
    
    // SUPER_ADMIN should go to shops if not already on a child route
    if (window.location.pathname === "/admin" || window.location.pathname === "/admin/") {
      void navigate({ to: "/admin/shops", replace: true });
    }
  }, [profile, ready, navigate]);

  // Render the Outlet for child routes (like /admin/shops)
  // If at /admin, the useEffect will redirect to /admin/shops
  return <Outlet />;
}
