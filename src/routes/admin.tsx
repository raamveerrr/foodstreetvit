import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin — DigitalFoodStreet" }],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const { profile, ready } = useAuth();

  useEffect(() => {
    if (!ready) return;
    
    if (!profile) {
      // Not authenticated, redirect to login
      navigate({ to: "/login", replace: true });
      return;
    }
    
    if (profile.role !== "SUPER_ADMIN") {
      // Not admin, redirect home
      navigate({ to: "/", replace: true });
      return;
    }
    
    // Admin authenticated, redirect to shops management
    navigate({ to: "/admin/shops", replace: true });
  }, [profile, ready, navigate]);

  return null;
}
