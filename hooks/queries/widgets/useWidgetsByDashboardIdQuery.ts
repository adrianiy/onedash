import { useQuery } from "@tanstack/react-query";
import { Widget } from "@/types/widget";
import { apiService } from "@/services/apiService";

/**
 * Hook para obtener los widgets de un dashboard específico
 * @param dashboardId - ID del dashboard del que se quieren obtener los widgets
 * @param options - Opciones adicionales de la consulta
 * @returns Query con la lista de widgets del dashboard
 */
export function useWidgetsByDashboardIdQuery(
  dashboardId: string | null | undefined,
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery<Widget[], Error, Widget[]>({
    queryKey: ["widgets", "dashboard", dashboardId],
    queryFn: async () => {
      // Si no hay ID o es inválido, no hacer la consulta
      if (!dashboardId || !/^[0-9a-f]{24}$/.test(dashboardId)) {
        throw new Error("ID de dashboard inválido");
      }

      const response = await apiService.get<Widget[]>(
        `/widgets?dashboardId=${dashboardId}`
      );

      if (!response.success) {
        throw new Error(
          response.error ||
            `Error al obtener los widgets del dashboard ${dashboardId}`
        );
      }

      // Convertir fechas de string a Date
      return (response.data || []).map((widget) => ({
        ...widget,
        createdAt: new Date(widget.createdAt),
        updatedAt: new Date(widget.updatedAt),
      })) as Widget[];
    },
    enabled:
      !!dashboardId &&
      /^[0-9a-f]{24}$/.test(dashboardId) &&
      options?.enabled !== false,
  });
}
