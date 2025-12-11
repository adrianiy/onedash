// Re-exportar todos los hooks de queries para acceso más fácil

export {
  getDatasourceFromIndicator,
  type WidgetDataParams,
  type ApiResponse,
} from "./useWidgetDataQuery";

export {
  useMetricDataQuery,
  type MetricData,
  type ApiMetricResponse,
} from "./useMetricDataQuery";

export {
  useChartDataQuery,
  type ChartData,
  type ApiChartResponse,
} from "./useChartDataQuery";

export {
  useTableDataQuery,
  type TableData,
  type ApiTableResponse,
} from "./useTableDataQuery";

export {
  useComparisonDataQuery,
  type ComparisonData,
  type ApiComparisonResponse,
} from "./useComparisonDataQuery";

// Exportar hooks de dashboards
export {
  useDashboardsQuery,
  useDashboardByIdQuery,
  useCreateDashboardMutation,
  useUpdateDashboardMutation,
  useDeleteDashboardMutation,
  useSavedDashboardsQuery,
  useSaveDashboardMutation,
  useUnsaveDashboardMutation,
  type DashboardApiResponse,
  type DashboardsListApiResponse,
  type DashboardQueryFilters,
} from "./dashboards";

// Exportar hooks de widgets
export {
  useWidgetsQuery,
  useWidgetsByDashboardIdQuery,
  useWidgetByIdQuery,
  useCreateWidgetMutation,
  useUpdateWidgetMutation,
  useDeleteWidgetMutation,
  type WidgetApiResponse,
  type WidgetsListApiResponse,
  type WidgetQueryFilters,
} from "./widgets";
