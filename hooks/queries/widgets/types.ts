import { Widget } from "@/types/widget";
import { ApiResponse } from "@/services/apiService";

// Extendemos las interfaces de ApiResponse para Widget
export interface WidgetApiResponse extends ApiResponse<Widget> {
  _widgetResponse: true; // Campo dummy para diferenciar tipos
}

// Respuesta para listado de Widgets
export interface WidgetsListApiResponse extends ApiResponse<Widget[]> {
  _widgetsListResponse: true; // Campo dummy para diferenciar tipos
}

// Tipos convenientes para parámetros de consulta
export interface WidgetQueryFilters {
  dashboardId?: string;
  type?: "chart" | "metric" | "table" | "text";
}
