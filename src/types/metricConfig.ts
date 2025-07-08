// --- Tipos Base y de Vinculación ---
import { interpolateText } from "../utils/textInterpolation";

export type VariableBinding = {
  type: "variable";
  key: string;
};

// Tipos de valores estáticos para indicadores y modificadores
export type IndicatorValue = "importe" | "unidades" | "pedidos";
export type SaleValue = "bruto" | "neto" | "devos";
export type ScopeValue = "mismas_tiendas" | "total_tiendas";
export type TimeframeValue = "hoy" | "ayer" | "semana" | "mes" | "año";
export type ComparisonValue =
  | "actual"
  | "anterior"
  | "a-2"
  | { type: "a-n"; value: number };
export type CalculationValue = "valor" | "crecimiento" | "peso";

// --- Tipos Flexibles (Estático o Vinculado a Variable) ---

export type IndicatorType = IndicatorValue | VariableBinding;
export type SaleType = SaleValue | VariableBinding;
export type ScopeType = ScopeValue | VariableBinding;
export type TimeframeType = TimeframeValue | VariableBinding;
export type ComparisonType = ComparisonValue | VariableBinding;
export type CalculationType = CalculationValue | VariableBinding;

// --- Interfaces Principales ---

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
  displayName?: string; // Nombre personalizado por el usuario (tiene prioridad)
  width?: number; // Para columnas de tabla
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
  indicator: IndicatorValue | string | VariableBinding, // Acepta string o VariableBinding
  modifiers: MetricModifiers,
  variables?: Record<string, unknown> // Variables opcionales para resolver dinámicos
): string {
  const isDynamic = (value: unknown) =>
    typeof value === "object" && value !== null && "type" in value;

  const getOptionLabel = (
    modifierKey: string,
    value: string
  ): string | undefined => {
    return ModifiersMetadata[modifierKey]?.options.find(
      (o) => o.value === value
    )?.label;
  };

  let indicatorName: string;
  let isDynamicIndicator: boolean = false; // Flag para identificar indicadores dinámicos

  if (
    (typeof indicator === "string" && indicator.startsWith("var:")) ||
    (typeof indicator === "object" &&
      indicator !== null &&
      "type" in indicator &&
      indicator.type === "variable")
  ) {
    const variableKey =
      typeof indicator === "string" ? indicator.substring(4) : indicator.key;

    // Resolver el valor actual de la variable si se proporcionaron variables
    const resolvedValue = variables ? variables[variableKey] : undefined;
    indicatorName =
      resolvedValue !== undefined && resolvedValue !== null
        ? String(resolvedValue)
        : `Dinámico (${variableKey})`;

    isDynamicIndicator = true;
  } else {
    indicatorName =
      IndicatorMetadata[indicator as string]?.name || (indicator as string);
    isDynamicIndicator = false;
  }

  const parts: string[] = [indicatorName];

  // Añadir modificadores en orden lógico
  Object.entries(modifiers).forEach(([key, value]) => {
    // Para indicadores dinámicos, incluir todos los modificadores
    // Para indicadores estáticos, verificar compatibilidad
    const shouldIncludeModifier =
      isDynamicIndicator || isModifierCompatible(indicator as string, key);

    if (value && shouldIncludeModifier) {
      if (isDynamic(value)) {
        const variableKey = (value as VariableBinding).key;

        // Resolver el valor actual de la variable si se proporcionaron variables
        const resolvedValue = variables ? variables[variableKey] : undefined;

        if (resolvedValue !== undefined && resolvedValue !== null) {
          // Traducir el valor resuelto usando los metadatos del modificador
          const label = getOptionLabel(key, String(resolvedValue));
          if (label) {
            if (key === "comparison") {
              parts.push(`vs ${label}`);
            } else {
              parts.push(label);
            }
          } else {
            // Si no hay traducción disponible, usar el valor tal como está
            parts.push(String(resolvedValue));
          }
        } else {
          // Si no se puede resolver la variable, mostrar como dinámico
          parts.push(`Dinámico (${variableKey})`);
        }
      } else if (typeof value === "string") {
        const label = getOptionLabel(key, value);
        if (label) {
          // Para indicadores dinámicos, incluir siempre los modificadores para diferenciar
          // Para indicadores estáticos, excluir "valor" y "actual" como antes
          if (isDynamicIndicator || (value !== "valor" && value !== "actual")) {
            if (key === "comparison") {
              parts.push(`vs ${label}`);
            } else {
              parts.push(label);
            }
          }
        }
      } else if (typeof value === "object" && "value" in value) {
        // Caso especial para comparison a-n
        parts.push(`vs Hace ${value.value} años`);
      }
    }
  });

  return parts.join(" ");
}

/**
 * Obtiene el título para mostrar según la lógica de prioridad:
 * 1. displayName (nombre personalizado por el usuario) - con interpolación de variables @variable
 * 2. título generado automáticamente (si hay elementos dinámicos)
 * 3. title (título por defecto)
 */
export function getDisplayTitle(
  column: MetricDefinition,
  variables?: Record<string, unknown>
): string {
  // 1. Si hay displayName personalizado, procesarlo con interpolación de variables
  if (column.displayName && column.displayName.trim() !== "") {
    return interpolateText(column.displayName, variables || {}, column);
  }

  // 2. Si hay elementos dinámicos, generar título automáticamente
  const hasDynamicElements =
    (typeof column.indicator === "object" &&
      column.indicator !== null &&
      "type" in column.indicator &&
      column.indicator.type === "variable") ||
    Object.values(column.modifiers).some(
      (value) =>
        typeof value === "object" &&
        value !== null &&
        "type" in value &&
        value.type === "variable"
    );

  if (hasDynamicElements && variables) {
    try {
      return generateMetricTitle(column.indicator, column.modifiers, variables);
    } catch (error) {
      console.warn("Error generando título dinámico:", error);
    }
  }

  // 3. Fallback al título por defecto
  return column.title;
}

/**
 * Genera un ID único para una métrica basado en sus propiedades
 */
export function generateMetricId(
  indicator: IndicatorValue | string | { type: "variable"; key: string }, // Acepta todos los tipos
  modifiers: MetricModifiers
): string {
  let id: string;
  let isIndicatorDynamic = false;

  // Determinar el ID base del indicador
  if (typeof indicator === "object" && indicator.type === "variable") {
    id = `dynamic_${indicator.key}`;
    isIndicatorDynamic = true;
  } else {
    id = indicator as string;
  }

  // Añadir modificadores al ID
  Object.entries(modifiers).forEach(([key, value]) => {
    if (value) {
      // Para indicadores dinámicos, siempre añadir modificadores compatibles
      // Para indicadores estáticos, verificar compatibilidad
      const shouldAddModifier =
        isIndicatorDynamic ||
        (typeof indicator === "string" && isModifierCompatible(indicator, key));

      if (shouldAddModifier) {
        if (typeof value === "object") {
          if ("type" in value && value.type === "variable") {
            id += `_${key}_var:${value.key}`;
          } else if ("type" in value && "value" in value) {
            id += `_${key}_${value.type}_${value.value}`;
          }
        } else {
          id += `_${key}_${value}`;
        }
      }
    }
  });

  return id;
}
