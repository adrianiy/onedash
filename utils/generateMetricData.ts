import type { MetricDefinition } from "@/types/metricConfig";
import { generateMetricValue, type DataFilters } from "./dataGeneration";

/**
 * Re-exportar tipos para compatibilidad
 */
export type { DataFilters as MetricDataFilters };

/**
 * Genera datos para una métrica individual
 *
 * @param metricDefinition - Definición de la métrica a generar
 * @param filters - Filtros opcionales (productos, secciones, fechas)
 * @returns Objeto con valor, etiqueta y tipo de cálculo
 */
export function generateMetricData(
  metricDefinition: MetricDefinition,
  filters?: DataFilters
) {
  const { indicator, modifiers, title } = metricDefinition;

  // El tipo de cálculo (valor, crecimiento, peso)
  const calculation = modifiers.calculation || "valor";

  // Generar el valor de la métrica con nuestras utilidades existentes
  // Usamos array vacío porque no estamos desglosando por dimensiones
  const value = generateMetricValue(indicator, []);

  // Ajustar el valor según los filtros si es necesario
  let adjustedValue = value;

  // Si hay filtros de productos o secciones, reducir el valor proporcionalmente
  // para simular el efecto de filtrar
  if (filters) {
    const hasProductFilter =
      filters.selectedProducts && filters.selectedProducts.length > 0;
    const hasSectionFilter =
      filters.selectedSections && filters.selectedSections.length > 0;

    // Simulamos que cada filtro reduce el ámbito y por tanto el valor
    if (hasProductFilter) {
      const filterRatio = Math.min(filters.selectedProducts!.length / 5, 1);
      adjustedValue *= filterRatio;
    }

    if (hasSectionFilter) {
      const filterRatio = Math.min(filters.selectedSections!.length / 3, 1);
      adjustedValue *= filterRatio;
    }
  }

  // Para tipos de cálculo de crecimiento, asegurar variación entre -100 y 100
  if (calculation === "crecimiento") {
    if (Math.abs(adjustedValue) > 100) {
      adjustedValue = Math.sign(adjustedValue) * (Math.random() * 50 + 5);
    }
  }

  return {
    value: adjustedValue,
    label: title,
    calculation: calculation as string,
  };
}
