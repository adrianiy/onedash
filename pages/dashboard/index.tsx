import { useEffect } from "react";
import { useRouter } from "next/router";
import { useDashboardStore } from "../../store/dashboardStore";
import { useAuthStore } from "../../store/authStore";

export default function DashboardIndex() {
  const router = useRouter();
  const { dashboards, fetchDashboards } = useDashboardStore();
  const { isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const init = async () => {
      if (isAuthenticated) {
        await fetchDashboards();
      }
    };

    init();
  }, [fetchDashboards, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (dashboards.length > 0) {
      // Redirigir al primer dashboard o al dashboard "default" si existe
      const defaultDashboard =
        dashboards.find((d) => d.name === "default") || dashboards[0];
      router.push(`/dashboard/${defaultDashboard._id}`);
    }
  }, [isAuthenticated, dashboards, router]);

  // Mostrar loading mientras se carga
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <p>Cargando dashboard...</p>
    </div>
  );
}
