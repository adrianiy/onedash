// Re-exportar todos los hooks de queries para acceso más fácil

export {
  useWidgetDataQuery,
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
