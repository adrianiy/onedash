import { useQuery } from "@tanstack/react-query";
import { Widget } from "@/types/widget";
import { apiService } from "@/services/apiService";
import { WidgetQueryFilters } from "./types";

/**
 * Hook para obtener todos los widgets con filtros opcionales
 * @param filters - Filtros opcionales para la consulta
 * @param options - Opciones adicionales de la consulta
 * @returns Query con la lista de widgets
 */
export function useWidgetsQuery(
  filters?: WidgetQueryFilters,
  options?: {
    enabled?: boolean;
    onSuccess?: (data: Widget[]) => void;
    onError?: (error: Error) => void;
  }
) {
  return useQuery<Widget[]>({
    queryKey: ["widgets", filters],
    queryFn: async () => {
      // Construir string de query params
      const queryParams = new URLSearchParams();

      if (filters?.dashboardId) {
        queryParams.append("dashboardId", filters.dashboardId);
      }

      if (filters?.type) {
        queryParams.append("type", filters.type);
      }

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/widgets?${queryString}` : "/widgets";

      const response = await apiService.get<Widget[]>(endpoint);

      if (!response.success) {
        throw new Error(response.error || "Error al obtener los widgets");
      }

      // Convertir fechas de string a Date
      return (response.data || []).map((widget) => ({
        ...widget,
        createdAt: new Date(widget.createdAt),
        updatedAt: new Date(widget.updatedAt),
      }));
    },
    ...options,
  });
}
