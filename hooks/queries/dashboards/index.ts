// Re-exportar todos los hooks de queries de dashboards para acceso más fácil

export { useDashboardsQuery } from "./useDashboardsQuery";
export { useDashboardByIdQuery } from "./useDashboardByIdQuery";
export { useCreateDashboardMutation } from "./useCreateDashboardMutation";
export { useUpdateDashboardMutation } from "./useUpdateDashboardMutation";
export { useDeleteDashboardMutation } from "./useDeleteDashboardMutation";
export { useSavedDashboardsQuery } from "./useSavedDashboardsQuery";
export { useSaveDashboardMutation } from "./useSaveDashboardMutation";
export { useUnsaveDashboardMutation } from "./useUnsaveDashboardMutation";

// Tipos comunes para las respuestas
export type {
  DashboardApiResponse,
  DashboardsListApiResponse,
  DashboardQueryFilters,
} from "./types";
