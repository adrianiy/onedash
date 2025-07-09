import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "../store/authStore";
import { useDashboardStore } from "../store/dashboardStore";
import { Icon } from "../components/common/Icon";

export default function Loading() {
  const router = useRouter();
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const { fetchDashboards } = useDashboardStore();
  const [hasInitialized, setHasInitialized] = useState(false);
  const isProcessing = useRef(false);

  // Efecto para verificar autenticación (solo se ejecuta una vez)
  useEffect(() => {
    if (!hasInitialized && !isProcessing.current) {
      isProcessing.current = true;
      checkAuth().finally(() => {
        setHasInitialized(true);
        isProcessing.current = false;
      });
    }
  }, [hasInitialized, checkAuth]);

  // Efecto para manejar redirección después de verificar autenticación
  useEffect(() => {
    if (!hasInitialized || isProcessing.current) return;

    const handleRedirect = async () => {
      if (isLoading) return;

      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      // Si está autenticado, cargar dashboards y redirigir
      try {
        await fetchDashboards();

        // Obtener dashboards actualizados del store
        const { dashboards: currentDashboards } = useDashboardStore.getState();

        if (currentDashboards && currentDashboards.length > 0) {
          const defaultDashboard =
            currentDashboards.find((d) => d.name === "default") ||
            currentDashboards[0];
          router.push(`/dashboard/${defaultDashboard._id}`);
        } else {
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error loading dashboards:", error);
        router.push("/dashboard");
      }
    };

    handleRedirect();
  }, [hasInitialized, isAuthenticated, isLoading, router, fetchDashboards]);

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
