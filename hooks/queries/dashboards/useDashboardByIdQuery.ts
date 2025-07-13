import { useQuery } from "@tanstack/react-query";
import { Dashboard } from "@/types/dashboard";
import { apiService } from "@/services/apiService";

/**
 * Hook para obtener un dashboard específico por su ID
 * @param id - ID del dashboard a obtener
 * @param options - Opciones adicionales de la consulta
 * @returns Query con el dashboard solicitado
 */
export function useDashboardByIdQuery(
  id: string | null | undefined,
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery<Dashboard, Error, Dashboard>({
    queryKey: ["dashboard", id],
    queryFn: async () => {
      // Si no hay ID o es inválido, no hacer la consulta
      if (!id || !/^[0-9a-f]{24}$/.test(id)) {
        throw new Error("ID de dashboard inválido");
      }

      const response = await apiService.get<Dashboard>(`/dashboards/${id}`);

      if (!response.success) {
        throw new Error(
          response.error || `Error al obtener el dashboard ${id}`
        );
      }

      // Convertir fechas de string a Date
      return {
        ...response.data!,
        createdAt: new Date(response.data!.createdAt),
        updatedAt: new Date(response.data!.updatedAt),
      } as Dashboard;
    },
    enabled: !!id && /^[0-9a-f]{24}$/.test(id) && options?.enabled !== false,
  });
}
