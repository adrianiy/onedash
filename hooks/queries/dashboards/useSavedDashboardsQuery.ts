import { useQuery } from "@tanstack/react-query";
import { Dashboard } from "@/types/dashboard";
import { apiService } from "@/services/apiService";

/**
 * Hook para obtener los dashboards guardados por el usuario
 * @returns Query con la lista de dashboards guardados
 */
export function useSavedDashboardsQuery() {
  return useQuery<Dashboard[]>({
    queryKey: ["saved-dashboards"],
    queryFn: async () => {
      const response = await apiService.get<Dashboard[]>(
        "/users/saved-dashboards"
      );

      if (!response.success) {
        throw new Error(
          response.error || "Error al obtener los dashboards guardados"
        );
      }

      // Convertir fechas de string a Date
      return (response.data || []).map((dashboard: Dashboard) => ({
        ...dashboard,
        createdAt: new Date(dashboard.createdAt),
        updatedAt: new Date(dashboard.updatedAt),
      }));
    },
  });
}
