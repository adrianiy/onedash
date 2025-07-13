import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Widget } from "@/types/widget";
import { apiService } from "@/services/apiService";

interface UpdateWidgetParams {
  widgetId: string;
  updates: Partial<Omit<Widget, "_id" | "createdAt" | "updatedAt" | "type">>;
}

/**
 * Hook para actualizar un widget existente
 * @returns Mutation para actualizar widgets
 */
export function useUpdateWidgetMutation() {
  const queryClient = useQueryClient();

  return useMutation<Widget, Error, UpdateWidgetParams>({
    mutationFn: async ({ widgetId, updates }) => {
      // Validar ID
      if (!widgetId || !/^[0-9a-f]{24}$/.test(widgetId)) {
        throw new Error("ID de widget inválido");
      }

      const response = await apiService.put<Widget>(
        `/widgets/${widgetId}`,
        updates
      );

      if (!response.success) {
        throw new Error(
          response.error || `Error al actualizar el widget ${widgetId}`
        );
      }

      // Convertir fechas de string a Date
      return {
        ...response.data!,
        createdAt: new Date(response.data!.createdAt),
        updatedAt: new Date(response.data!.updatedAt),
      };
    },
    onSuccess: (updatedWidget) => {
      // Invalidar consultas relacionadas para forzar re-fetch
      queryClient.invalidateQueries({
        queryKey: ["widget", updatedWidget._id],
      });

      // Si el widget tiene dashboardId, también invalidar esa consulta
      if (updatedWidget.dashboardId) {
        queryClient.invalidateQueries({
          queryKey: ["widgets", "dashboard", updatedWidget.dashboardId],
        });
      }

      // Invalidar la consulta general de widgets
      queryClient.invalidateQueries({ queryKey: ["widgets"] });
    },
  });
}
