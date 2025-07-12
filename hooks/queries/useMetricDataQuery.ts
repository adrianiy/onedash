import { useQuery } from "@tanstack/react-query";
import { MetricDefinition } from "@/types/metricConfig";
import { getDatasourceFromIndicator } from "./useWidgetDataQuery";
import { DataFilters } from "@/utils/dataGeneration";

// Interfaz para la respuesta de datos de métrica
export interface MetricData {
  value: number;
  label: string;
  calculation: string;
}

// Interfaz para la respuesta de la API
export interface ApiMetricResponse {
  success: boolean;
  data: MetricData;
  error?: string;
}

/**
 * Hook para obtener datos de una métrica específica
 * Determina automáticamente el datasource en base al indicador
 */
export function useMetricDataQuery(
  metricDefinition?: MetricDefinition,
  filters?: {
    products?: string[];
    sections?: string[];
    dateRange?: {
      start: string | null;
      end: string | null;
    };
  }
) {
  // Determinar si podemos procesar la métrica y preparar los datos
  const isValidMetric = Boolean(metricDefinition && metricDefinition.indicator);

  // Preparar el datasource y los parámetros solo si la métrica es válida
  const datasource = isValidMetric
    ? getDatasourceFromIndicator(metricDefinition!.indicator)
    : "metric";

  const finalDatasource =
    isValidMetric && datasource === "dynamic" ? "metric" : datasource;

  // Usar useQuery directamente con la configuración adecuada
  return useQuery<ApiMetricResponse, Error, MetricData>({
    // La queryKey es siempre consistente, pero cambia según los parámetros
    queryKey: [
      "metric-data",
      finalDatasource,
      isValidMetric
        ? {
            indicator: metricDefinition!.indicator,
            modifiers: metricDefinition!.modifiers,
            filters,
          }
        : "empty",
    ],

    // La función de consulta solo se ejecuta si la métrica es válida
    queryFn: async () => {
      if (!isValidMetric) {
        return {
          success: true,
          data: { value: 0, label: "", calculation: "valor" },
        };
      }

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

      const response = await fetch(`/api/widget-data/${finalDatasource}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          metricDefinition,
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

    // Desactivar la consulta si no es válida
    enabled: isValidMetric,

    // Valor inicial para métricas no válidas
    initialData: isValidMetric
      ? undefined
      : {
          success: true,
          data: { value: 0, label: "", calculation: "valor" },
        },

    // Transformar la respuesta para extraer solo los datos
    select: (response) => {
      if (!response.success) {
        throw new Error(response.error || "Error desconocido");
      }
      return response.data;
    },
  });
}
