import type { MetricDefinition, IndicatorType } from "../types/metricConfig";
import { breakdownCategories } from "../types/breakdownLevels";

// Constantes para las dimensiones conocidas
const KNOWN_DIMENSIONS = {
  product: ["Ropa", "Calzado", "Perfumería"],
  section: ["Señora", "Caballero", "Niño"],
  zone: ["Europa", "América", "Asia", "África"],
  country: [
    "España",
    "Francia",
    "Italia",
    "Alemania",
    "Reino Unido",
    "Estados Unidos",
    "México",
    "China",
    "Japón",
  ],
  city: [
    "Madrid",
    "Barcelona",
    "París",
    "Roma",
    "Berlín",
    "Londres",
    "Nueva York",
    "Ciudad de México",
    "Pekín",
    "Tokio",
  ],
  store: ["Flagship", "Centro comercial", "Calle", "Outlet", "Pop-up"],
  family: ["Básicos", "Temporada", "Colección", "Premium", "Sport"],
  buyer: ["Equipo A", "Equipo B", "Equipo C", "Equipo D"],
  day: [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ],
  week: ["Semana 1", "Semana 2", "Semana 3", "Semana 4"],
  month: [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ],
  quarter: ["Q1", "Q2", "Q3", "Q4"],
  year: ["2023", "2024", "2025"],
};

// Rangos aproximados para métricas
const METRIC_RANGES = {
  importe: { min: 500, max: 100000 },
  unidades: { min: 10, max: 5000 },
  pedidos: { min: 1, max: 500 },
};

// Pesos de venta por sección (para distribución realista)
const SECTION_WEIGHTS = {
  Señora: 0.5, // 50% de las ventas
  Caballero: 0.3, // 30% de las ventas
  Niño: 0.2, // 20% de las ventas
};

// Factores de temporada (para simular variaciones estacionales)
const SEASONALITY = {
  month: {
    Enero: 0.7, // Rebajas de invierno
    Febrero: 0.6,
    Marzo: 0.8,
    Abril: 0.9,
    Mayo: 1.0,
    Junio: 1.1,
    Julio: 1.3, // Rebajas de verano
    Agosto: 1.2,
    Septiembre: 1.0,
    Octubre: 0.9,
    Noviembre: 1.0,
    Diciembre: 1.5, // Navidad
  },
  day: {
    Lunes: 0.8,
    Martes: 0.7,
    Miércoles: 0.8,
    Jueves: 0.9,
    Viernes: 1.2,
    Sábado: 1.5, // Mayor afluencia
    Domingo: 1.1,
  },
};

/**
 * Genera un valor aleatorio con distribución normal (para datos más realistas)
 */
function randomNormal(mean: number, stdDev: number): number {
  const u = 1 - Math.random(); // Converting [0,1) to (0,1]
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdDev + mean;
}

/**
 * Redondea un número según la magnitud
 */
function smartRound(num: number): number {
  if (num < 10) return Math.round(num * 100) / 100;
  if (num < 100) return Math.round(num * 10) / 10;
  if (num < 1000) return Math.round(num);
  if (num < 10000) return Math.round(num / 10) * 10;
  if (num < 100000) return Math.round(num / 100) * 100;
  return Math.round(num / 1000) * 1000;
}

/**
 * Encuentra el valor de una dimensión por su ID
 */
function getDimensionValues(dimensionId: string): string[] {
  const knownValues =
    KNOWN_DIMENSIONS[dimensionId as keyof typeof KNOWN_DIMENSIONS];
  if (knownValues) return knownValues;

  for (const category of breakdownCategories) {
    const option = category.options.find((opt) => opt.id === dimensionId);
    if (option)
      return [`${option.name} 1`, `${option.name} 2`, `${option.name} 3`];
  }

  return ["Valor 1", "Valor 2", "Valor 3"];
}

/**
 * Obtiene un factor de ponderación basado en la dimensión y valor
 */
function getWeightFactor(dimensionId: string, value: string): number {
  if (dimensionId === "section" && value in SECTION_WEIGHTS) {
    return SECTION_WEIGHTS[value as keyof typeof SECTION_WEIGHTS];
  }

  if (dimensionId === "month" && value in SEASONALITY.month) {
    return SEASONALITY.month[value as keyof typeof SEASONALITY.month];
  }

  if (dimensionId === "day" && value in SEASONALITY.day) {
    return SEASONALITY.day[value as keyof typeof SEASONALITY.day];
  }

  return 1.0;
}

/**
 * Genera un valor para una métrica
 */
function generateMetricValue(
  indicator: IndicatorType,
  dimensions: { id: string; value: string }[]
): number {
  let indicatorName: string;
  if (typeof indicator === "string") {
    indicatorName = indicator;
  } else {
    indicatorName = "dynamic";
  }

  const range = METRIC_RANGES[indicatorName as keyof typeof METRIC_RANGES];
  let value = range
    ? randomNormal((range.min + range.max) / 2, (range.max - range.min) / 4)
    : randomNormal(5000, 2000);

  for (const dim of dimensions) {
    value *= getWeightFactor(dim.id, dim.value);
  }

  return smartRound(value);
}

/**
 * Interfaz para los filtros aplicables a la generación de datos
 */
export interface ChartDataFilters {
  dateStart?: string | null;
  dateEnd?: string | null;
  selectedProducts?: string[];
  selectedSections?: string[];
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

/**
 * Genera datos para un gráfico basados en la configuración
 */
export function generateChartData(
  xAxisDimension: string,
  series: MetricDefinition[],
  filters?: ChartDataFilters
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
