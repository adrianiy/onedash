import type { MetricDefinition } from "@/types/metricConfig";
import {
  getDimensionValues,
  generateMetricValue,
  type DataFilters,
  type ChartSeriesData,
} from "./dataGeneration";

// Re-exportar tipos para compatibilidad
export type { ChartSeriesData, DataFilters as ChartDataFilters };

/**
 * Genera datos para un gráfico basados en la configuración
 * Refactorizado para usar utilidades centralizadas
 */
export function generateChartData(
  xAxisDimension: string,
  series: MetricDefinition[],
  filters?: DataFilters
): ChartSeriesData {
  if (!xAxisDimension || !series.length) {
    return { categories: [], series: [] };
  }

  const dimensionValues = getDimensionValues(xAxisDimension);

  // Aplicar filtros a las categorías
  let filteredCategories = dimensionValues;
  if (filters) {
    if (
      xAxisDimension === "product" &&
      filters.selectedProducts &&
      filters.selectedProducts.length > 0
    ) {
      filteredCategories = filteredCategories.filter((category) =>
        filters.selectedProducts?.includes(category)
      );
    }
    if (
      xAxisDimension === "section" &&
      filters.selectedSections &&
      filters.selectedSections.length > 0
    ) {
      filteredCategories = filteredCategories.filter((category) =>
        filters.selectedSections?.includes(category)
      );
    }
  }

  // Generar datos para cada serie
  const chartSeries = series.map((serie) => {
    const serieData = filteredCategories.map((dimValue) => {
      const value = generateMetricValue(serie.indicator, [
        { id: xAxisDimension, value: dimValue },
      ]);
      return value;
    });

    return {
      name: serie.title,
      data: serieData,
    };
  });

  return {
    categories: filteredCategories,
    series: chartSeries,
  };
}
