/**
 * Punto de entrada centralizado para utilidades de generación de datos
 * Exporta todas las funciones, constantes y tipos necesarios
 */

// Constantes
export {
  KNOWN_DIMENSIONS,
  METRIC_RANGES,
  SECTION_WEIGHTS,
  SEASONALITY,
} from "./constants";

// Tipos
export type { DataFilters, DimensionValue, ChartSeriesData } from "./types";

// Funciones core
export {
  randomNormal,
  smartRound,
  getDimensionValues,
  getWeightFactor,
  generateMetricValue,
  generateDimensionCombinations,
} from "./core";
