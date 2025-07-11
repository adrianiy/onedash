import { useAuthStore } from "@/store/authStore";
import { useDashboardStore } from "@/store/dashboardStore";
import { useThemeStore } from "@/store/themeStore";
import "@/styles/index.css";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect } from "react";
import "react-tooltip/dist/react-tooltip.css";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
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

  return (
    <>
      <Head>
        <title>ONE</title>
        <meta
          name="description"
          content="Dashboard de métricas y visualizaciones"
        />

        {/* Favicons */}
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/favicon-96x96.png"
        />

        {/* Favicon por defecto */}
        <link rel="icon" href="/favicon-32x32.png" />
      </Head>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </>
  );
}
