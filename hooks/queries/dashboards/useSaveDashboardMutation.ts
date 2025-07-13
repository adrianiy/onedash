import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/services/apiService";

interface SaveDashboardResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Hook para guardar un dashboard en la lista de guardados del usuario
 * @returns Mutation para guardar un dashboard
 */
export function useSaveDashboardMutation() {
  const queryClient = useQueryClient();

  return useMutation<SaveDashboardResponse, Error, string>({
    mutationFn: async (dashboardId: string) => {
      const response = await apiService.post<SaveDashboardResponse>(
        "/users/saved-dashboards",
        { dashboardId }
      );

      if (!response.success) {
        throw new Error(response.error || "Error al guardar el dashboard");
      }

      return response;
    },
    onSuccess: () => {
      // Invalidar consultas relacionadas para forzar re-fetch
      queryClient.invalidateQueries({ queryKey: ["saved-dashboards"] });
    },
  });
}
