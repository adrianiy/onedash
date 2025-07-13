import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Widget,
  WidgetType,
  ChartWidgetConfig,
  MetricWidgetConfig,
  TableWidgetConfig,
  TextWidgetConfig,
} from "@/types/widget";
import { apiService } from "@/services/apiService";

// Tipos para la creación de widgets
type BaseWidgetInput = Omit<
  Widget,
  "_id" | "createdAt" | "updatedAt" | "type" | "config"
>;

// Tipo condicional para la configuración según el tipo de widget
type WidgetConfigByType<T extends WidgetType> = T extends "chart"
  ? ChartWidgetConfig
  : T extends "metric"
  ? MetricWidgetConfig
  : T extends "table"
  ? TableWidgetConfig
  : TextWidgetConfig;

interface CreateWidgetParams {
  widgetData: BaseWidgetInput & {
    type: WidgetType;
    config: WidgetConfigByType<WidgetType>;
  };
  dashboardId: string;
}

/**
 * Hook para crear un nuevo widget
 * @returns Mutation para crear widgets
 */
export function useCreateWidgetMutation() {
  const queryClient = useQueryClient();

  return useMutation<Widget, Error, CreateWidgetParams>({
    mutationFn: async ({ widgetData, dashboardId }) => {
      // Asegurarse de que el widget tenga el dashboardId correcto
      const widgetWithDashboard = {
        ...widgetData,
        dashboardId,
      };

      const response = await apiService.post<Widget>(
        "/widgets",
        widgetWithDashboard
      );

      if (!response.success) {
        throw new Error(response.error || "Error al crear el widget");
      }

      // Convertir fechas de string a Date
      return {
        ...response.data!,
        createdAt: new Date(response.data!.createdAt),
        updatedAt: new Date(response.data!.updatedAt),
      };
    },
    onSuccess: (_, { dashboardId }) => {
      // Invalidar consultas relacionadas para forzar re-fetch
      queryClient.invalidateQueries({ queryKey: ["widgets"] });
      queryClient.invalidateQueries({
        queryKey: ["widgets", "dashboard", dashboardId],
      });
    },
  });
}
