import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dashboard } from "@/types/dashboard";
import { apiService } from "@/services/apiService";
import { UpdateDashboardParams } from "./types";

/**
 * Hook para actualizar un dashboard existente
 * @returns Mutation para actualizar dashboards
 */
export function useUpdateDashboardMutation() {
  const queryClient = useQueryClient();

  return useMutation<Dashboard, Error, UpdateDashboardParams>({
    mutationFn: async ({ id, updates }) => {
      const response = await apiService.put<Dashboard>(
        `/dashboards/${id}`,
        updates
      );

      if (!response.success) {
        throw new Error(response.error || "Error al actualizar el dashboard");
      }

      // Convertir fechas de string a Date
      return {
        ...response.data!,
        createdAt: new Date(response.data!.createdAt),
        updatedAt: new Date(response.data!.updatedAt),
      };
    },
    onSuccess: (data) => {
      // Invalidar consultas relacionadas para forzar re-fetch
      queryClient.invalidateQueries({ queryKey: ["dashboards"] });
      queryClient.invalidateQueries({ queryKey: ["dashboards", data._id] });

      // Actualizar los datos en caché para reflejar cambios inmediatos
      queryClient.setQueryData(["dashboards", data._id], data);
    },
  });
}
