import { useQuery } from "@tanstack/react-query";
import { MetricDefinition } from "@/types/metricConfig";
import { DataFilters } from "@/utils/dataGeneration";
import { getDatasourceFromIndicator } from "./useWidgetDataQuery";

// Interfaz para los datos de un gráfico
export interface ChartData {
  categories: string[];
  series: Array<{
    name: string;
    data: number[];
  }>;
}

// Interfaz para la respuesta de la API
export interface ApiChartResponse {
  success: boolean;
  data: ChartData;
  error?: string;
}

/**
 * Hook para obtener datos de un gráfico
 * @param xAxisDimension Dimensión del eje X
 * @param series Series del gráfico (métricas)
 * @param filters Filtros opcionales
 */
export function useChartDataQuery(
  xAxisDimension?: string,
  series: MetricDefinition[] = [],
  filters?: {
    products?: string[];
    sections?: string[];
    dateRange?: {
      start: string | null;
      end: string | null;
    };
  }
) {
  // Comprobar si hay datos suficientes para generar el gráfico
  const canFetchData = Boolean(xAxisDimension && series.length > 0);

  // Determinar el datasource basado en los indicadores de las series
  // Si hay diferentes indicadores, podríamos priorizar unos sobre otros
  const datasource =
    canFetchData && series.length > 0
      ? getDatasourceFromIndicator(series[0].indicator)
      : "chart";

  const finalDatasource =
    canFetchData && datasource === "dynamic" ? "chart" : datasource;

  // Usar useQuery directamente
  return useQuery<ApiChartResponse, Error, ChartData>({
    // La queryKey asegura que solo se hace una petición por configuración única
    queryKey: [
      "chart-data",
      finalDatasource,
      xAxisDimension,
      canFetchData
        ? series.map((s) => ({
            id: s.id,
            indicator: s.indicator,
            modifiers: s.modifiers,
          }))
        : [],
      filters,
    ],

    queryFn: async () => {
      if (!canFetchData) {
        return {
          success: true,
          data: { categories: [], series: [] },
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
          xAxisDimension,
          columns: series,
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

    // Desactivar la consulta si no hay suficientes datos
    enabled: canFetchData,

    // Valor inicial para consultas no válidas
    initialData: canFetchData
      ? undefined
      : {
          success: true,
          data: { categories: [], series: [] },
        },

    // Transformar la respuesta
    select: (response) => {
      if (!response.success) {
        throw new Error(response.error || "Error desconocido");
      }
      return response.data;
    },
  });
}
