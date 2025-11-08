"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function DashboardPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    checkAuth();
    if (!isAuthenticated) {
      router.replace("/sign-in");
    }
  }, [isAuthenticated, checkAuth, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <button
          onClick={() => { logout(); router.replace("/sign-in"); }}
          className="px-4 py-2 rounded bg-black text-white"
        >
          Cerrar sesión
        </button>
      </div>
      <p className="text-gray-700 mb-2">Sesión activa.</p>
      {/* Texto simple para identificar el dashboard según rol */}
      <p className="text-sm text-gray-500">
        {user?.rol === "ADMIN" ? "Dashboard de ADMIN" : "Dashboard de REPARTIDOR"}
      </p>
    </div>
  );
}
