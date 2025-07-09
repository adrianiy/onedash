import { useEffect } from "react";
import type { AppProps } from "next/app";
import { useThemeStore } from "../store/themeStore";
import { useAuthStore } from "../store/authStore";
import { useDashboardStore } from "../store/dashboardStore";
import "react-tooltip/dist/react-tooltip.css";
import "../styles/index.css";

export default function App({ Component, pageProps }: AppProps) {
  const { theme } = useThemeStore();
  const { checkAuth, isAuthenticated } = useAuthStore();
  const { fetchDashboards } = useDashboardStore();

  // Establecer el tema
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Cargar dashboards al cargar la aplicación (solo si está autenticado)
  useEffect(() => {
    const init = async () => {
      if (isAuthenticated) {
        // Cargar dashboards desde MongoDB
        await fetchDashboards();
      }
    };

    init();
  }, [fetchDashboards, isAuthenticated]);

  return <Component {...pageProps} />;
}
