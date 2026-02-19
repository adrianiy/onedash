import { useQuery } from "@tanstack/react-query";
import { MetricDefinition } from "@/types/metricConfig";
import { ComparisonWidgetConfig } from "@/types/widget";
import { DataFilters } from "@/utils/dataGeneration";
import { getDatasourceFromIndicator } from "./useWidgetDataQuery";
import { resolveMetricDefinition } from "@/utils/variableResolver";
import { useVariableStore } from "@/store/variableStore";
import { useMemo } from "react";

// Tipos de datos para la respuesta de la API
export interface ApiComparisonResponse {
  categories: string[];
  series: Array<{
    name: string;
    data: number[];
    type: "primary" | "secondary";
  }>;
}

// Tipos para los datos procesados
export interface ComparisonData {
  categories: string[];
  series: Array<{
    name: string;
    data: number[];
    type: "primary" | "secondary";
  }>;
  comparisonType?: "dimension" | "custom";
}

// Parámetros para los filtros
interface ComparisonDataParams {
  products?: string[];
  sections?: string[];
  dateRange?: {
    start: string | null;
    end: string | null;
  };
}

/**
 * Hook para obtener datos de comparación para los widgets de tipo comparison
 */
export const useComparisonDataQuery = (
  config: ComparisonWidgetConfig,
  params?: ComparisonDataParams
) => {
  const { dimension, primaryMetric, secondaryMetric, comparisonMetrics } =
    config;

  // Obtener variables para resolver métricas
  const variables = useVariableStore((state) => state.variables);

  // Resolver métricas con variables
  const resolvedPrimaryMetric = useMemo(() => {
    if (!primaryMetric) return null;
    return resolveMetricDefinition(primaryMetric, variables);
  }, [primaryMetric, variables]);

  const resolvedSecondaryMetric = useMemo(() => {
    if (!secondaryMetric) return null;
    return resolveMetricDefinition(secondaryMetric, variables);
  }, [secondaryMetric, variables]);

  const resolvedComparisonMetrics = useMemo(() => {
    if (!comparisonMetrics) return [];
    return comparisonMetrics.map((metricGroup) => {
      return {
        ...metricGroup,
        primaryMetric: metricGroup.primaryMetric
          ? resolveMetricDefinition(metricGroup.primaryMetric, variables)
          : undefined,
        secondaryMetric: metricGroup.secondaryMetric
          ? resolveMetricDefinition(metricGroup.secondaryMetric, variables)
          : undefined,
      };
    });
  }, [comparisonMetrics, variables]);

  // Determinar si hay métricas para consultar
  const hasMetrics = useMemo(() => {
    if (dimension === "custom") {
      return resolvedComparisonMetrics.length > 0;
    }
    return !!(resolvedPrimaryMetric || resolvedSecondaryMetric);
  }, [
    dimension,
    resolvedPrimaryMetric,
    resolvedSecondaryMetric,
    resolvedComparisonMetrics,
  ]);

  // Construir payload para la consulta API
  const queryPayload = useMemo(() => {
    return {
      dimension,
      primaryMetric: resolvedPrimaryMetric,
      secondaryMetric: resolvedSecondaryMetric,
      comparisonMetrics: resolvedComparisonMetrics,
      filters: {
        products: params?.products || [],
        sections: params?.sections || [],
        dateRange: params?.dateRange || { start: null, end: null },
      },
    };
  }, [
    dimension,
    resolvedPrimaryMetric,
    resolvedSecondaryMetric,
    resolvedComparisonMetrics,
    params,
  ]);

  // Para desarrollo, generamos datos simulados directamente
  const getMockData = () => {
    // En caso de dimensión regular
    if (dimension && dimension !== "custom") {
      const categories = ["Enero", "Febrero", "Marzo", "Abril", "Mayo"];
      const series: ComparisonData["series"] = [];

      if (resolvedPrimaryMetric) {
        series.push({
          name: resolvedPrimaryMetric.title || "Métrica Principal",
          data: [120, 132, 101, 134, 90],
          type: "primary",
        });
      }

      if (resolvedSecondaryMetric) {
        series.push({
          name: resolvedSecondaryMetric.title || "Métrica Secundaria",
          data: [220, 182, 191, 234, 290],
          type: "secondary",
        });
      }

      return {
        categories,
        series,
        comparisonType: "dimension",
      } as ComparisonData;
    }

    // En caso de métricas de comparación customizadas
    if (resolvedComparisonMetrics.length > 0) {
      const groups = resolvedComparisonMetrics.map((group) => group.group);
      const series: ComparisonData["series"] = [];

      // Generar datos para métricas primarias
      if (resolvedComparisonMetrics.some((group) => group.primaryMetric)) {
        series.push({
          name: "Valor Actual",
          data: resolvedComparisonMetrics.map(() =>
            Math.floor(Math.random() * 500)
          ),
          type: "primary",
        });
      }

      // Generar datos para métricas secundarias
      if (resolvedComparisonMetrics.some((group) => group.secondaryMetric)) {
        series.push({
          name: "Valor Comparativo",
          data: resolvedComparisonMetrics.map(() =>
            Math.floor(Math.random() * 500)
          ),
          type: "secondary",
        });
      }

      return {
        categories: groups,
        series,
        comparisonType: "custom",
      } as ComparisonData;
    }

    return {
      categories: [],
      series: [],
    } as ComparisonData;
  };

  // Si no hay métricas para consultar, no ejecutar la consulta
  const enabled = hasMetrics;

  // Utilizar React Query para gestionar la consulta
  // Determinar el datasource basado en los indicadores
  const datasource = enabled
    ? primaryMetric
      ? getDatasourceFromIndicator(primaryMetric.indicator)
      : "comparison"
    : "comparison";

  const finalDatasource = datasource === "dynamic" ? "comparison" : datasource;

  // Usar useQuery con la nueva sintaxis de Tanstack Query v4+
  return useQuery<ApiComparisonResponse, Error, ComparisonData>({
    // La queryKey asegura que solo se hace una petición por configuración única
    queryKey: [
      "comparison-data",
      finalDatasource,
      dimension,
      enabled ? queryPayload : null,
    ],

    queryFn: async () => {
      // En un entorno real, hacer la consulta a la API
      /*
      // Convertir los filtros combinados al formato de la API
      const apiFilters: DataFilters = {};
      
      if (queryPayload.filters.products?.length) {
        apiFilters.selectedProducts = queryPayload.filters.products;
      }
      
      if (queryPayload.filters.sections?.length) {
        apiFilters.selectedSections = queryPayload.filters.sections;
      }
      
      if (queryPayload.filters.dateRange) {
        apiFilters.dateStart = queryPayload.filters.dateRange.start;
        apiFilters.dateEnd = queryPayload.filters.dateRange.end;
      }

      const response = await fetch(`/api/widget-data/${finalDatasource}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...queryPayload,
          filters: apiFilters,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Error al obtener datos: ${response.status}`
        );
      }

      const data = await response.json();
      
      return {
        ...data.data,
        comparisonType: dimension === "custom" ? "custom" : "dimension",
      };
      */

      // Por ahora, usar datos mock para desarrollo
      return getMockData();
    },

    // Desactivar la consulta si no hay suficientes datos
    enabled,

    // Valor inicial para consultas no válidas
    initialData: enabled
      ? undefined
      : ({
          categories: [],
          series: [],
        } as ApiComparisonResponse),

    // Transformar la respuesta si es necesario
    select: (response) => {
      // En caso de estar usando mock data, no necesitamos transformación
      return response as ComparisonData;
    },
  });
};
