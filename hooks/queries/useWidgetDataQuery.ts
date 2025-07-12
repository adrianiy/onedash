import { MetricDefinition } from "@/types/metricConfig";

// Tipos para las respuestas API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface WidgetDataParams {
  columns?: MetricDefinition[];
  breakdownLevels?: string[];
  xAxisDimension?: string;
  metricDefinition?: MetricDefinition;
  filters?: {
    products?: string[];
    sections?: string[];
    dateRange?: {
      start: string | null;
      end: string | null;
    };
  };
}

/**
 * Determina el datasource basado en el indicador de la métrica
 * @param indicator - Indicador de la métrica
 */
export function getDatasourceFromIndicator(indicator: unknown): string {
  // Si es un string simple, hacemos la asignación directa
  if (typeof indicator === "string") {
    switch (indicator) {
      case "importe":
      case "unidades":
      case "pedidos":
        return "venta";
      // Aquí podríamos añadir otros indicadores
      default:
        return "general";
    }
  }

  // Si es un objeto de variable, dependerá del contexto
  return "dynamic";
}
