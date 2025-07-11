import type { IndicatorType } from "@/types/metricConfig";
import { breakdownCategories } from "@/types/breakdownLevels";
import {
  KNOWN_DIMENSIONS,
  METRIC_RANGES,
  SECTION_WEIGHTS,
  SEASONALITY,
} from "./constants";
import type { DimensionValue } from "./types";

/**
 * Genera un valor aleatorio con distribución normal (para datos más realistas)
 * @param mean Media de la distribución
 * @param stdDev Desviación estándar
 */
export function randomNormal(mean: number, stdDev: number): number {
  const u = 1 - Math.random(); // Converting [0,1) to (0,1]
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdDev + mean;
}

/**
 * Redondea un número según la magnitud para obtener valores más realistas
 */
export function smartRound(num: number): number {
  if (num < 10) return Math.round(num * 100) / 100; // 2 decimales
  if (num < 100) return Math.round(num * 10) / 10; // 1 decimal
  if (num < 1000) return Math.round(num); // Sin decimales
  if (num < 10000) return Math.round(num / 10) * 10; // Decenas
  if (num < 100000) return Math.round(num / 100) * 100; // Centenas
  return Math.round(num / 1000) * 1000; // Miles
}

/**
 * Encuentra los posibles valores de una dimensión por su ID
 */
export function getDimensionValues(dimensionId: string): string[] {
  // Buscar en las dimensiones conocidas
  const knownValues =
    KNOWN_DIMENSIONS[dimensionId as keyof typeof KNOWN_DIMENSIONS];
  if (knownValues) return knownValues;

  // Si no está en las conocidas, buscar en las categorías de desglose
  for (const category of breakdownCategories) {
    const option = category.options.find((opt) => opt.id === dimensionId);
    if (option)
      return [`${option.name} 1`, `${option.name} 2`, `${option.name} 3`];
  }

  // Valor por defecto si no se encuentra
  return ["Valor 1", "Valor 2", "Valor 3"];
}

/**
 * Obtiene un factor de ponderación basado en la dimensión y valor
 * Para simular distribuciones realistas de datos
 */
export function getWeightFactor(dimensionId: string, value: string): number {
  if (dimensionId === "section" && value in SECTION_WEIGHTS) {
    return SECTION_WEIGHTS[value as keyof typeof SECTION_WEIGHTS];
  }

  if (dimensionId === "month" && value in SEASONALITY.month) {
    return SEASONALITY.month[value as keyof typeof SEASONALITY.month];
  }

  if (dimensionId === "day" && value in SEASONALITY.day) {
    return SEASONALITY.day[value as keyof typeof SEASONALITY.day];
  }

  return 1.0; // Factor neutral por defecto
}

/**
 * Genera un valor para una métrica basada en las dimensiones y otros factores
 */
export function generateMetricValue(
  indicator: IndicatorType,
  dimensions: DimensionValue[],
  baseValue: number | null = null,
  calculation: string = "valor"
): number {
  // Valor base de la métrica
  let value: number;

  if (baseValue !== null) {
    value = baseValue; // Usar valor base si se proporciona (para cálculos relacionados)
  } else {
    // Determinar el nombre del indicador para buscar en METRIC_RANGES
    let indicatorName: string;
    if (typeof indicator === "string") {
      indicatorName = indicator;
    } else {
      // Para VariableBinding, usar un nombre genérico
      indicatorName = "dynamic";
    }

    // Generar valor base según el indicador
    const range = METRIC_RANGES[indicatorName as keyof typeof METRIC_RANGES];

    // Si no se encuentra el rango (por ejemplo, para indicadores dinámicos), usar valores por defecto
    if (!range) {
      // Para indicadores dinámicos o desconocidos, usar un rango general
      value = randomNormal(5000, 2000); // Valor medio con variación
    } else {
      value = randomNormal(
        (range.min + range.max) / 2,
        (range.max - range.min) / 4
      );
    }

    // Ajustar según las dimensiones
    for (const dim of dimensions) {
      const factor = getWeightFactor(dim.id, dim.value);
      value *= factor;
    }
  }

  // Aplicar cálculo específico si no es "valor"
  if (calculation === "crecimiento") {
    // Para crecimiento, generar un valor más realista basado en un valor A-1 simulado
    // En un caso real, este valor vendría de datos históricos
    const lastYearValue = value * (1 - randomNormal(0.1, 0.15)); // Simular valor del año anterior
    const growth = ((value - lastYearValue) / lastYearValue) * 100;
    return Number(growth.toFixed(1)); // 1 decimal para porcentajes
  } else if (calculation === "peso") {
    value = Math.min(100, Math.max(0, value / 10)); // Porcentaje máximo 100%
    return Number(value.toFixed(1)); // 1 decimal para porcentajes
  }

  // Redondear de manera inteligente según magnitud
  return smartRound(value);
}

/**
 * Genera combinaciones de valores para las dimensiones especificadas
 * Útil para generar datos tabulares complejos
 */
export function generateDimensionCombinations(
  dimensionIds: string[],
  currentIndex = 0,
  currentCombination: DimensionValue[] = []
): DimensionValue[][] {
  if (currentIndex === dimensionIds.length) {
    return [currentCombination];
  }

  const dimensionId = dimensionIds[currentIndex];
  const values = getDimensionValues(dimensionId);

  let combinations: DimensionValue[][] = [];

  for (const value of values) {
    const newCombination = [...currentCombination, { id: dimensionId, value }];

    const subCombinations = generateDimensionCombinations(
      dimensionIds,
      currentIndex + 1,
      newCombination
    );
    combinations = [...combinations, ...subCombinations];
  }

  return combinations;
}
