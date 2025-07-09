import { useEffect } from "react";
import { useRouter } from "next/router";
import { useDashboardStore } from "../../store/dashboardStore";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";
import { Icon } from "../../components/common/Icon";

export default function DashboardIndex() {
  const router = useRouter();
  const { dashboards, fetchDashboards } = useDashboardStore();

  useEffect(() => {
    const init = async () => {
      await fetchDashboards();
    };

    init();
  }, [fetchDashboards]);

  useEffect(() => {
    if (dashboards.length > 0) {
      // Redirigir al primer dashboard o al dashboard "default" si existe
      const defaultDashboard =
        dashboards.find((d) => d.name === "default") || dashboards[0];
      router.push(`/dashboard/${defaultDashboard._id}`);
    }
  }, [dashboards, router]);

  // Mostrar loading mientras se carga
  return (
    <ProtectedRoute>
      <div className="auth-page">
        <div className="auth-page__loader-container">
          <div className="auth-page__loader-content">
            <Icon name="loader" className="auth-page__loader-icon" size={48} />
            <p className="auth-page__loader-text">Cargando dashboard...</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
