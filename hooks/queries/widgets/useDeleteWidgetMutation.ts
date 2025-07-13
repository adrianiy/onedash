import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/services/apiService";

interface DeleteWidgetParams {
  widgetId: string;
  dashboardId?: string; // Opcional, pero útil para actualizar la caché
}

/**
 * Hook para eliminar un widget
 * @returns Mutation para eliminar widgets
 */
export function useDeleteWidgetMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, DeleteWidgetParams>({
    mutationFn: async ({ widgetId }) => {
      // Validar ID
      if (!widgetId || !/^[0-9a-f]{24}$/.test(widgetId)) {
        throw new Error("ID de widget inválido");
      }

      const response = await apiService.delete(`/widgets/${widgetId}`);

      if (!response.success) {
        throw new Error(
          response.error || `Error al eliminar el widget ${widgetId}`
        );
      }
    },
    onSuccess: (_, { widgetId, dashboardId }) => {
      // Invalidar consultas relacionadas para forzar re-fetch
      queryClient.invalidateQueries({ queryKey: ["widget", widgetId] });

      // Si el widget tiene dashboardId, también invalidar esa consulta
      if (dashboardId) {
        queryClient.invalidateQueries({
          queryKey: ["widgets", "dashboard", dashboardId],
        });
      }

      // Invalidar la consulta general de widgets
      queryClient.invalidateQueries({ queryKey: ["widgets"] });
    },
  });
}
