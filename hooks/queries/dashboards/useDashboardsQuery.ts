import { useQuery } from "@tanstack/react-query";
import { Dashboard } from "@/types/dashboard";
import { apiService } from "@/services/apiService";

/**
 * Hook para obtener todos los dashboards
 * @returns Query con la lista de dashboards
 */
export function useDashboardsQuery() {
  return useQuery<Dashboard[]>({
    queryKey: ["dashboards"],
    queryFn: async () => {
      const response = await apiService.get<Dashboard[]>("/dashboards");

      if (!response.success) {
        throw new Error(response.error || "Error al obtener los dashboards");
      }

      // Convertir fechas de string a Date
      return (response.data || []).map((dashboard) => ({
        ...dashboard,
        createdAt: new Date(dashboard.createdAt),
        updatedAt: new Date(dashboard.updatedAt),
      }));
    },
  });
}
