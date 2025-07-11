import { Icon } from "@/common/Icon";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useDashboardStore } from "@/store/dashboardStore";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

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
    } else {
      // Si no hay dashboards, redirigir a la página de creación
      router.push("/dashboard/create");
    }
  }, [dashboards, router]);

  // Mostrar loading mientras se carga
  return (
    <>
      <Head>
        <title>ONE - Dashboards</title>
      </Head>
      <ProtectedRoute>
        <div className="auth-page">
          <div className="auth-page__loader-container">
            <div className="auth-page__loader-content">
              <Icon
                name="loader"
                className="auth-page__loader-icon"
                size={48}
              />
              <p className="auth-page__loader-text">Cargando dashboard...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    </>
  );
}
