import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { DataFilters } from "@/utils/dataGeneration";
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
 * Hook genérico para obtener datos de widgets según el datasource
 * @param datasource - Tipo de fuente de datos ("venta", "metric", "chart", "table")
 * @param params - Parámetros específicos para la solicitud
 * @param options - Opciones adicionales para useQuery
 */
export function useWidgetDataQuery<T>(
  datasource: string,
  params: WidgetDataParams,
  options?: UseQueryOptions<ApiResponse<T>, Error, T>
) {
  const { filters, ...restParams } = params;

  return useQuery<ApiResponse<T>, Error, T>({
    queryKey: [
      "widget-data",
      datasource,
      // Incluimos solo las propiedades que afectan al resultado para un caché óptimo
      {
        columns: params.columns?.map((c) => ({
          id: c.id,
          indicator: c.indicator,
          modifiers: c.modifiers,
        })),
        breakdownLevels: params.breakdownLevels,
        xAxisDimension: params.xAxisDimension,
        metricDefinition: params.metricDefinition
          ? {
              id: params.metricDefinition.id,
              indicator: params.metricDefinition.indicator,
              modifiers: params.metricDefinition.modifiers,
            }
          : undefined,
        filters,
      },
    ],
    queryFn: async () => {
      // Convertir los filtros al formato de la API
      const apiFilters: DataFilters = {};

      if (filters?.products?.length) {
        apiFilters.selectedProducts = filters.products;
      }

      if (filters?.sections?.length) {
        apiFilters.selectedSections = filters.sections;
      }

      if (filters?.dateRange) {
        apiFilters.dateStart = filters.dateRange.start;
        apiFilters.dateEnd = filters.dateRange.end;
      }

      const response = await fetch(`/api/widget-data/${datasource}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...restParams,
          filters: apiFilters,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Error al obtener datos: ${response.status}`
        );
      }

      return response.json();
    },
    // Transformar la respuesta para extraer solo los datos
    select: (response) => {
      if (!response.success) {
        throw new Error(response.error || "Error desconocido");
      }
      return response.data;
    },
    ...options,
  });
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
