import type { MetricDefinition } from "@/types/metricConfig";
import {
  generateMetricValue,
  generateDimensionCombinations,
  smartRound,
  type DataFilters,
} from "./dataGeneration";

/**
 * Re-exportar tipos para compatibilidad hacia atrás
 */
export type { DataFilters as TableDataFilters };

/**
 * Genera datos coherentes para una tabla basados en la configuración
 * Refactorizado para usar utilidades centralizadas
 */
export function generateTableData(
  columns: MetricDefinition[],
  breakdownLevels: string[],
  filters?: DataFilters | number,
  rowCount: number = 50
): Record<string, unknown>[] {
  // Si no hay columnas o niveles de desglose, devolver array vacío
  if (!columns.length || !breakdownLevels.length) return [];

  // Compatibilidad con versiones anteriores
  if (typeof filters === "number") {
    rowCount = filters;
    filters = undefined;
  }

  // Limitar el número de filas para evitar explosión combinatoria
  const safeRowCount = Math.min(rowCount, 100);

  // Extraer filtros si están disponibles
  const filterProducts =
    filters && Array.isArray(filters.selectedProducts)
      ? filters.selectedProducts
      : [];

  const filterSections =
    filters && Array.isArray(filters.selectedSections)
      ? filters.selectedSections
      : [];

  // Generar todas las combinaciones posibles de valores de dimensión
  const combinations = generateDimensionCombinations(breakdownLevels);

  // Tomar un subconjunto aleatorio si hay demasiadas combinaciones
  let selectedCombinations = combinations;
  if (combinations.length > safeRowCount) {
    selectedCombinations = [];
    const indices = new Set<number>();
    while (indices.size < safeRowCount) {
      indices.add(Math.floor(Math.random() * combinations.length));
    }
    for (const index of indices) {
      selectedCombinations.push(combinations[index]);
    }
  }

  // Generar datos para cada combinación
  let data = selectedCombinations.map((dimensionCombo) => {
    const row: Record<string, unknown> = {};

    // Añadir dimensiones al row
    for (const { id, value } of dimensionCombo) {
      row[id] = value;
    }

    // Generar métricas base (valores)
    const baseMetrics: Record<string, number> = {};
    for (const column of columns) {
      const { id, indicator, modifiers } = column;

      // Solo generar valor base para métricas de tipo valor
      if (modifiers.calculation === "valor" || !modifiers.calculation) {
        let value = generateMetricValue(indicator, dimensionCombo);

        // Asegurar que las columnas de bruto nunca sean negativas
        if (modifiers.saleType === "bruto" && value < 0) {
          value = Math.abs(value);
        }

        baseMetrics[id] = value;
        row[id] = value;
      }
    }

    // Añadir métricas derivadas (crecimiento, peso)
    for (const column of columns) {
      const { id, indicator, modifiers } = column;

      // Procesar métricas de crecimiento y peso
      if (modifiers.calculation && modifiers.calculation !== "valor") {
        const baseId = columns.find(
          (c) =>
            c.indicator === indicator &&
            (!c.modifiers.calculation || c.modifiers.calculation === "valor") &&
            c.modifiers.saleType === modifiers.saleType &&
            c.modifiers.scope === modifiers.scope
        )?.id;

        const baseValue = baseId ? baseMetrics[baseId] : null;
        const calculationType =
          typeof modifiers.calculation === "string"
            ? modifiers.calculation
            : "valor"; // Fallback para VariableBinding
        row[id] = generateMetricValue(
          indicator,
          dimensionCombo,
          baseValue,
          calculationType
        );
      }
    }

    // Procesar casos especiales para hacer los datos más coherentes
    if ("product" in row && "section" in row) {
      // Ajustar valores según producto y sección
      const product = row["product"] as string;
      const section = row["section"] as string;

      for (const column of columns) {
        if (
          column.indicator === "importe" &&
          (!column.modifiers.calculation ||
            column.modifiers.calculation === "valor")
        ) {
          // Ajustar importes: Perfumería vende mejor en Señora, Calzado mejor en Caballero
          if (product === "Perfumería" && section === "Señora") {
            row[column.id] = (row[column.id] as number) * 1.2;
          } else if (product === "Calzado" && section === "Caballero") {
            row[column.id] = (row[column.id] as number) * 1.15;
          }
        }
      }
    }

    return row;
  });

  // Aplicar filtros a los datos generados
  if (filters && typeof filters !== "number") {
    // Filtrar por productos si hay seleccionados
    if (filterProducts.length > 0) {
      data = data.filter((row) => {
        const rowProduct = row["product"] as string;
        return !rowProduct || filterProducts.includes(rowProduct);
      });
    }

    // Filtrar por secciones si hay seleccionadas
    if (filterSections.length > 0) {
      data = data.filter((row) => {
        const rowSection = row["section"] as string;
        return !rowSection || filterSections.includes(rowSection);
      });
    }
  }

  return data;
}

/**
 * Calcula totales para columnas numéricas
 */
export function calculateTotals(
  data: Record<string, unknown>[],
  columns: MetricDefinition[]
): Record<string, unknown> {
  const totals: Record<string, unknown> = {};

  // Inicializar totales para columnas numéricas
  for (const column of columns) {
    totals[column.id] = 0;
  }

  // Sumar valores
  for (const row of data) {
    for (const column of columns) {
      const value = row[column.id];
      if (typeof value === "number") {
        totals[column.id] = (totals[column.id] as number) + value;
      }
    }
  }

  // Redondear totales usando la función centralizada
  for (const key of Object.keys(totals)) {
    if (typeof totals[key] === "number") {
      totals[key] = smartRound(totals[key] as number);
    }
  }

  return totals;
}
