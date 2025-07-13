import { ErrorPage, LoaderPage } from "@/components/common";
import { useDashboardsQuery } from "@/hooks/queries/dashboards";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function DashboardIndex() {
  const router = useRouter();
  // Usar React Query para obtener los dashboards en lugar del store
  const { data: dashboards, isLoading, error } = useDashboardsQuery();

  useEffect(() => {
    // Si hay datos de dashboards y no estamos cargando
    if (dashboards && !isLoading) {
      if (dashboards.length > 0) {
        // Redirigir al primer dashboard o al dashboard "default" si existe
        const defaultDashboard = dashboards[0];
        router.push(`/dashboard/${defaultDashboard._id}`);
      } else {
        // Si no hay dashboards, redirigir a la página de creación
        router.push("/dashboard/create");
      }
    }
  }, [dashboards, router, isLoading]);

  // Mostrar mensaje de error si ocurre algún problema
  if (error) {
    return (
      <ErrorPage message={`Error al cargar los dashboards: ${error.message}`} />
    );
  }

  // Mostrar loading mientras se carga
  return <LoaderPage title="ONE - Dashboards" />;
}
