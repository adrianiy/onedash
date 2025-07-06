import type { MetricDefinition } from "../types/metricConfig";
import { IndicatorMetadata } from "../types/metricConfig";
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

// Factores para calcular crecimiento
const GROWTH_RANGE = { min: -30, max: 50 }; // Porcentaje de crecimiento entre -30% y +50%

// Relación entre métricas (para generar datos coherentes)
const METRIC_RELATIONS = {
  // Precio medio aproximado por unidad según producto
  avgPricePerUnit: {
    Ropa: { min: 20, max: 60 },
    Calzado: { min: 40, max: 120 },
    Perfumería: { min: 30, max: 80 },
  },
  // Unidades promedio por pedido
  avgUnitsPerOrder: { min: 2, max: 8 },
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
 * Genera un número aleatorio entre min y max (inclusive)
 */
function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Genera un valor aleatorio con distribución normal (para datos más realistas)
 * @param mean Media de la distribución
 * @param stdDev Desviación estándar
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
  if (num < 10) return Math.round(num * 100) / 100; // 2 decimales
  if (num < 100) return Math.round(num * 10) / 10; // 1 decimal
  if (num < 1000) return Math.round(num); // Sin decimales
  if (num < 10000) return Math.round(num / 10) * 10; // Decenas
  if (num < 100000) return Math.round(num / 100) * 100; // Centenas
  return Math.round(num / 1000) * 1000; // Miles
}

/**
 * Encuentra el valor de una dimensión por su ID
 */
function getDimensionValues(dimensionId: string): string[] {
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

  return 1.0; // Factor neutral por defecto
}

/**
 * Genera un valor para una métrica basada en las dimensiones y otros factores
 */
function generateMetricValue(
  indicator: string,
  dimensions: { id: string; value: string }[],
  baseValue: number | null = null,
  calculation: string = "valor"
): number {
  // Valor base de la métrica
  let value: number;

  if (baseValue !== null) {
    value = baseValue; // Usar valor base si se proporciona (para cálculos relacionados)
  } else {
    // Generar valor base según el indicador
    const range = METRIC_RANGES[indicator as keyof typeof METRIC_RANGES];
    value = randomNormal(
      (range.min + range.max) / 2,
      (range.max - range.min) / 4
    );

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
 * Genera combinaciones de valores para las dimensiones
 */
function generateDimensionCombinations(
  dimensionIds: string[],
  currentIndex = 0,
  currentCombination: { id: string; value: string }[] = []
): { id: string; value: string }[][] {
  if (currentIndex === dimensionIds.length) {
    return [currentCombination];
  }

  const dimensionId = dimensionIds[currentIndex];
  const values = getDimensionValues(dimensionId);

  let combinations: { id: string; value: string }[][] = [];

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

/**
 * Genera datos coherentes para una tabla basados en la configuración
 */
export function generateTableData(
  columns: MetricDefinition[],
  breakdownLevels: string[],
  rowCount: number = 50
): Record<string, unknown>[] {
  // Si no hay columnas o niveles de desglose, devolver array vacío
  if (!columns.length || !breakdownLevels.length) return [];

  // Limitar el número de filas para evitar explosión combinatoria
  const safeRowCount = Math.min(rowCount, 100);

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
  const data = selectedCombinations.map((dimensionCombo) => {
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
        row[id] = generateMetricValue(
          indicator,
          dimensionCombo,
          baseValue,
          modifiers.calculation
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

  // Redondear totales
  for (const key of Object.keys(totals)) {
    if (typeof totals[key] === "number") {
      totals[key] = smartRound(totals[key] as number);
    }
  }

  return totals;
}
