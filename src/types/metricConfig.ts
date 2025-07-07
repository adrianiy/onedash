// Tipos de indicadores base
export type IndicatorType = "importe" | "unidades" | "pedidos";

// Tipo que incluye indicadores dinámicos
export type IndicatorTypeOrDynamic = IndicatorType | "{{dynamic}}";

// Tipos de modificadores
export type SaleType = "bruto" | "neto" | "devos";
export type ScopeType = "mismas_tiendas" | "total_tiendas";
export type TimeframeType = "hoy" | "ayer" | "semana" | "mes" | "año";
export type ComparisonType =
  | "actual"
  | "anterior"
  | "a-2"
  | { type: "a-n"; value: number };
export type CalculationType = "valor" | "crecimiento" | "peso";

// Interfaz para los modificadores de una métrica
export interface MetricModifiers {
  saleType?: SaleType;
  scope?: ScopeType;
  timeframe?: TimeframeType;
  comparison?: ComparisonType;
  calculation?: CalculationType;
}

// Interfaz para la definición completa de una métrica
export interface MetricDefinition {
  id: string;
  indicator: IndicatorType;
  modifiers: MetricModifiers;
  title: string;
  width?: number; // Para columnas de tabla
  useVariables?: Record<string, string>; // property path → variable ID
}

// Interfaz para una opción de modificador en la UI
export interface ModifierOption {
  value: string;
  label: string;
  requiresInput?: boolean;
}

// Metadatos para indicadores y sus compatibilidades
export const IndicatorMetadata: Record<
  string,
  {
    name: string;
    compatibleModifiers: string[];
    requiredModifiers: string[]; // Modificadores obligatorios para habilitar la selección
  }
> = {
  importe: {
    name: "Importe",
    compatibleModifiers: [
      "saleType",
      "scope",
      "timeframe",
      "comparison",
      "calculation",
    ],
    requiredModifiers: ["saleType", "calculation"],
  },
  unidades: {
    name: "Unidades",
    compatibleModifiers: [
      "saleType",
      "scope",
      "timeframe",
      "comparison",
      "calculation",
    ],
    requiredModifiers: ["saleType", "calculation"],
  },
  pedidos: {
    name: "Pedidos",
    compatibleModifiers: ["timeframe", "comparison", "calculation"], // No incluye 'saleType'
    requiredModifiers: ["calculation"],
  },
};

// Metadatos para modificadores y sus opciones
export const ModifiersMetadata: Record<
  string,
  {
    name: string;
    options: ModifierOption[];
    defaultValue?: string; // Valor por defecto opcional
  }
> = {
  saleType: {
    name: "Tipo de Venta",
    options: [
      { value: "bruto", label: "Bruto" },
      { value: "neto", label: "Neto" },
      { value: "devos", label: "Devoluciones" },
    ],
  },
  scope: {
    name: "Tiendas",
    options: [
      { value: "mismas_tiendas", label: "Mismas Tiendas" },
      { value: "total_tiendas", label: "Total Tiendas" },
    ],
  },
  timeframe: {
    name: "Período",
    options: [
      { value: "hoy", label: "Hoy" },
      { value: "ayer", label: "Ayer" },
      { value: "semana", label: "Semana" },
      { value: "mes", label: "Mes" },
      { value: "año", label: "Año" },
    ],
  },
  comparison: {
    name: "Periodo",
    options: [
      { value: "actual", label: "Actual" },
      { value: "anterior", label: "Año anterior (A-1)" },
      { value: "a-2", label: "Hace dos años (A-2)" },
      { value: "a-n", label: "Hace N años", requiresInput: true },
    ],
    defaultValue: "actual",
  },
  calculation: {
    name: "Cálculos",
    options: [
      { value: "valor", label: "Valor" },
      { value: "crecimiento", label: "Crecimiento" },
      { value: "peso", label: "Peso" },
    ],
    defaultValue: "valor",
  },
};

// Funciones utilitarias

/**
 * Verifica si un modificador es compatible con un indicador específico
 */
export function isModifierCompatible(
  indicator: string,
  modifier: string
): boolean {
  return (
    IndicatorMetadata[indicator]?.compatibleModifiers.includes(modifier) ??
    false
  );
}

/**
 * Genera un título descriptivo para una métrica basado en sus propiedades
 */
export function generateMetricTitle(
  indicator: IndicatorType,
  modifiers: MetricModifiers
): string {
  const indicatorName = IndicatorMetadata[indicator]?.name || indicator;
  const parts: string[] = [indicatorName];

  // Añadir modificadores en orden lógico
  if (modifiers.saleType && isModifierCompatible(indicator, "saleType")) {
    const option = ModifiersMetadata.saleType.options.find(
      (o) => o.value === modifiers.saleType
    );
    if (option) parts.push(option.label);
  }

  if (modifiers.scope && isModifierCompatible(indicator, "scope")) {
    const option = ModifiersMetadata.scope.options.find(
      (o) => o.value === modifiers.scope
    );
    if (option) parts.push(option.label);
  }

  if (modifiers.timeframe && isModifierCompatible(indicator, "timeframe")) {
    const option = ModifiersMetadata.timeframe.options.find(
      (o) => o.value === modifiers.timeframe
    );
    if (option) parts.push(option.label);
  }

  if (modifiers.comparison && isModifierCompatible(indicator, "comparison")) {
    let comparisonText = "";
    if (typeof modifiers.comparison === "string") {
      const option = ModifiersMetadata.comparison.options.find(
        (o) => o.value === modifiers.comparison
      );
      comparisonText = option?.label || modifiers.comparison;
    } else {
      comparisonText = `Hace ${modifiers.comparison.value} años`;
    }
    if (comparisonText !== "Actual") parts.push(`vs ${comparisonText}`);
  }

  if (modifiers.calculation && isModifierCompatible(indicator, "calculation")) {
    const option = ModifiersMetadata.calculation.options.find(
      (o) => o.value === modifiers.calculation
    );
    if (option && option.value !== "valor") parts.push(`(${option.label})`);
  }

  return parts.join(" ");
}

/**
 * Genera un ID único para una métrica basado en sus propiedades
 */
export function generateMetricId(
  indicator: IndicatorType,
  modifiers: MetricModifiers
): string {
  let id = indicator;

  Object.entries(modifiers).forEach(([key, value]) => {
    if (value && isModifierCompatible(indicator, key)) {
      if (typeof value === "object" && "type" in value && "value" in value) {
        id += `_${key}_${value.type}_${value.value}`;
      } else {
        id += `_${key}_${value}`;
      }
    }
  });

  return id;
}
