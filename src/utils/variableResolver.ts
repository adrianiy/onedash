import type { MetricDefinition, IndicatorType } from "../types/metricConfig";
import type { DashboardVariable } from "../types/variables";
import {
  IndicatorMetadata,
  generateMetricTitle,
  generateMetricId,
} from "../types/metricConfig";

/**
 * Set a nested property value using dot notation path
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setNestedProperty(obj: any, path: string, value: unknown): void {
  const keys = path.split(".");
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== "object") {
      current[key] = {};
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
}

/**
 * Resolve variables in a metric definition
 */
export function resolveMetricDefinition(
  definition: MetricDefinition,
  variables: Record<string, unknown>
): MetricDefinition {
  if (!definition.useVariables) {
    return definition;
  }

  // Create a deep copy to avoid mutating the original
  const resolved = JSON.parse(JSON.stringify(definition)) as MetricDefinition;

  // Resolve each variable binding
  Object.entries(definition.useVariables).forEach(([path, variableId]) => {
    const value = variables[variableId];
    if (value !== undefined) {
      setNestedProperty(resolved, path, value);
    }
  });

  return resolved;
}

/**
 * Resolve variables in multiple metric definitions
 */
export function resolveMetricDefinitions(
  definitions: MetricDefinition[],
  variables: Record<string, unknown>
): MetricDefinition[] {
  return definitions.map((def) => resolveMetricDefinition(def, variables));
}

/**
 * Check if a metric definition has any variable bindings
 */
export function hasVariableBindings(definition: MetricDefinition): boolean {
  return Boolean(
    definition.useVariables && Object.keys(definition.useVariables).length > 0
  );
}

/**
 * Get all variable IDs used by a metric definition
 */
export function getUsedVariableIds(definition: MetricDefinition): string[] {
  if (!definition.useVariables) {
    return [];
  }
  return Object.values(definition.useVariables);
}

/**
 * Get active variables by type from visible variables
 * Widget scanning will be done in the hook where we have access to stores
 */
export function getActiveVariablesByType(
  visibleVariables: DashboardVariable[]
): Record<string, DashboardVariable[]> {
  const activeVariables: Record<string, DashboardVariable[]> = {};

  // Add visible variables (from FilterBar)
  visibleVariables.forEach((variable) => {
    if (!activeVariables[variable.type]) {
      activeVariables[variable.type] = [];
    }
    if (!activeVariables[variable.type].find((v) => v.id === variable.id)) {
      activeVariables[variable.type].push(variable);
    }
  });

  return activeVariables;
}

/**
 * Map modifier types to variable types
 */
export const MODIFIER_TO_VARIABLE_TYPE_MAP = {
  saleType: "sale_type",
  scope: "scope",
  timeframe: "timeframe",
  comparison: "comparison",
} as const;

/**
 * Map selector contexts to variable types
 */
export const SELECTOR_TO_VARIABLE_TYPE_MAP = {
  indicators: "indicator",
  timerange: "timeframe",
} as const;

/**
 * Dynamic option labels by context
 */
export const DYNAMIC_LABELS = {
  indicators: "Indicador Dinámico",
  timerange: "Período Dinámico",
  saleType: "Tipo de Venta Dinámico",
  scope: "Tiendas Dinámico",
  comparison: "Período Dinámico",
} as const;

/**
 * Resolve dynamic metric definition to a concrete one
 */
export function resolveDynamicMetric(
  definition: MetricDefinition,
  variables: Record<string, unknown>
): MetricDefinition {
  // Si no es dinámico, retornar tal como está
  if (!definition.dynamicResolver || definition.indicator !== "{{dynamic}}") {
    return definition;
  }

  // Resolver el valor dinámico
  const resolvedValue =
    variables[definition.dynamicResolver.variableId] ||
    definition.dynamicResolver.fallback;

  // Verificar que el valor resuelto es un indicador válido
  if (!resolvedValue || !IndicatorMetadata[resolvedValue as string]) {
    // Si no es válido, usar fallback o el primer indicador disponible
    const fallbackIndicator = definition.dynamicResolver.fallback || "importe";
    console.warn(
      `Dynamic metric could not resolve to valid indicator, using fallback: ${fallbackIndicator}`
    );

    return {
      ...definition,
      indicator: fallbackIndicator as IndicatorType,
      title: generateMetricTitle(
        fallbackIndicator as IndicatorType,
        definition.modifiers
      ),
      id: generateMetricId(
        fallbackIndicator as IndicatorType,
        definition.modifiers
      ),
    };
  }

  // Crear nueva definición con valor resuelto
  const resolvedIndicator = resolvedValue as IndicatorType;
  return {
    ...definition,
    indicator: resolvedIndicator,
    title: generateMetricTitle(resolvedIndicator, definition.modifiers),
    id: generateMetricId(resolvedIndicator, definition.modifiers),
  };
}

/**
 * Resolve dynamic metrics in multiple definitions
 */
export function resolveDynamicMetrics(
  definitions: MetricDefinition[],
  variables: Record<string, unknown>
): MetricDefinition[] {
  return definitions.map((def) => resolveDynamicMetric(def, variables));
}

/**
 * Check if a metric definition is dynamic
 */
export function isDynamicMetric(definition: MetricDefinition): boolean {
  return (
    definition.indicator === "{{dynamic}}" &&
    Boolean(definition.dynamicResolver)
  );
}

/**
 * Create a dynamic resolver for indicator type
 */
export function createIndicatorDynamicResolver(
  variableId: string,
  fallback: IndicatorType = "importe"
) {
  return {
    type: "indicator" as const,
    variableId,
    fallback,
  };
}
