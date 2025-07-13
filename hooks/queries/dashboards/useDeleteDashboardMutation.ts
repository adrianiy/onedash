import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/services/apiService";

/**
 * Hook para eliminar un dashboard existente
 * @returns Mutation para eliminar dashboards
 */
export function useDeleteDashboardMutation() {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, string>({
    mutationFn: async (id) => {
      // Validar que sea un ID de MongoDB
      if (!/^[0-9a-f]{24}$/.test(id)) {
        throw new Error("ID de dashboard inválido");
      }

      const response = await apiService.delete(`/dashboards/${id}`);

      if (!response.success) {
        throw new Error(
          response.error || `Error al eliminar el dashboard ${id}`
        );
      }

      return true;
    },
    onSuccess: (_, id) => {
      // Invalidar consultas relacionadas para forzar re-fetch
      queryClient.invalidateQueries({ queryKey: ["dashboards"] });

      // También eliminamos la consulta específica del dashboard eliminado
      queryClient.removeQueries({ queryKey: ["dashboard", id] });
    },
  });
}
