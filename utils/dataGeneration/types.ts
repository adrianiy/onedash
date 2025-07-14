/**
 * Tipos centralizados para generación de datos
 * Nueva interfaz unificada para filtros de datos
 */

/**
 * Interfaz unificada para filtros aplicables a la generación de datos
 * Reemplaza a ChartDataFilters y TableDataFilters
 */
export interface DataFilters {
  dateStart?: string | null;
  dateEnd?: string | null;
  scope?: string;
  selectedProducts?: string[];
  selectedSections?: string[];
}

/**
 * Estructura para representar una dimensión con su valor
 */
export interface DimensionValue {
  id: string;
  value: string;
}

/**
 * Interfaz para los datos de gráfico con múltiples series
 */
export interface ChartSeriesData {
  categories: string[];
  series: Array<{
    name: string;
    data: number[];
  }>;
}
