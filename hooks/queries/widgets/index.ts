// Re-exportar todos los hooks de widgets para un acceso más fácil
export { useWidgetsQuery } from "./useWidgetsQuery";
export { useWidgetsByDashboardIdQuery } from "./useWidgetsByDashboardIdQuery";
export { useWidgetByIdQuery } from "./useWidgetByIdQuery";
export { useCreateWidgetMutation } from "./useCreateWidgetMutation";
export { useUpdateWidgetMutation } from "./useUpdateWidgetMutation";
export { useDeleteWidgetMutation } from "./useDeleteWidgetMutation";

// Re-exportar tipos
export type {
  WidgetApiResponse,
  WidgetsListApiResponse,
  WidgetQueryFilters,
} from "./types";
