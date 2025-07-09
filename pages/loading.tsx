import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "../store/authStore";
import { useDashboardStore } from "../store/dashboardStore";
import { Icon } from "../components/common/Icon";

export default function Loading() {
  const router = useRouter();
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const { fetchDashboards, dashboards } = useDashboardStore();

  useEffect(() => {
    const verifyAuthAndRedirect = async () => {
      // Verificar autenticación
      await checkAuth();

      // Esperar a que se actualice el estado de autenticación
      if (isAuthenticated) {
        // Cargar dashboards
        await fetchDashboards();

        // Redirigir al primer dashboard o al dashboard "default" si existe
        if (dashboards && dashboards.length > 0) {
          const defaultDashboard =
            dashboards.find((d) => d.name === "default") || dashboards[0];
          router.push(`/dashboard/${defaultDashboard._id}`);
        } else {
          router.push("/dashboard");
        }
      } else if (!isLoading) {
        // Si no está autenticado y no está cargando, redirigir a login
        router.push("/login");
      }
    };

    verifyAuthAndRedirect();
  }, [
    isAuthenticated,
    isLoading,
    checkAuth,
    fetchDashboards,
    dashboards,
    router,
  ]);

  return (
    <div className="auth-page">
      <div className="auth-page__loader-container">
        <div className="auth-page__loader-content">
          <Icon name="loader" className="auth-page__loader-icon" size={48} />
          <p className="auth-page__loader-text">Iniciando sesión...</p>
        </div>
      </div>
    </div>
  );
}
