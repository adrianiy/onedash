import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/services/apiService";

interface UnsaveDashboardResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Hook para eliminar un dashboard de la lista de guardados del usuario
 * @returns Mutation para eliminar un dashboard de guardados
 */
export function useUnsaveDashboardMutation() {
  const queryClient = useQueryClient();

  return useMutation<UnsaveDashboardResponse, Error, string>({
    mutationFn: async (dashboardId: string) => {
      const response = await apiService.delete<UnsaveDashboardResponse>(
        `/users/saved-dashboards?dashboardId=${dashboardId}`
      );

      if (!response.success) {
        throw new Error(
          response.error || "Error al eliminar el dashboard de guardados"
        );
      }

      return response;
    },
    onSuccess: () => {
      // Invalidar consultas relacionadas para forzar re-fetch
      queryClient.invalidateQueries({ queryKey: ["saved-dashboards"] });
    },
  });
}
