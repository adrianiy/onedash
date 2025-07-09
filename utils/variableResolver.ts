import type { MetricDefinition } from "../types/metricConfig";
import type { VariableBinding } from "../types/metricConfig";

/**
 * A simplified representation of a variable for use in resolver logic.
 */
export interface SimpleVariable {
  id: string;
  name: string;
  value: unknown;
  type: string;
}

/**
 * Recursively resolves variables in any part of a metric definition.
 * @param data The piece of the metric definition to resolve.
 * @param variables The current state of dashboard variables.
 * @returns The resolved piece of the metric definition.
 */
export function resolveRecursively(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  variables: Record<string, unknown>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  if (typeof data !== "object" || data === null) {
    return data;
  }

  // Check if the object is a variable binding
  if (data.type === "variable" && data.key) {
    const variableKey = data.key as string;
    return variables[variableKey] !== undefined ? variables[variableKey] : null;
  }

  // If it's an array, resolve each item
  if (Array.isArray(data)) {
    return data.map((item) => resolveRecursively(item, variables));
  }

  // If it's a regular object, resolve each property
  const resolvedObject: Record<string, unknown> = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      resolvedObject[key] = resolveRecursively(data[key], variables);
    }
  }
  return resolvedObject;
}

/**
 * Resolve variables in a metric definition
 */
export function resolveMetricDefinition(
  definition: MetricDefinition,
  variables: Record<string, unknown>
): MetricDefinition {
  // The recursive function handles deep cloning implicitly by creating new objects/arrays.
  return resolveRecursively(definition, variables) as MetricDefinition;
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
 * Recursively checks if any part of a metric definition is dynamic.
 */
function isDynamicRecursively(data: unknown): boolean {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  if (
    "type" in data &&
    (data as VariableBinding).type === "variable" &&
    "key" in data
  ) {
    return true;
  }

  if (Array.isArray(data)) {
    return data.some(isDynamicRecursively);
  }

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      if (isDynamicRecursively((data as Record<string, unknown>)[key])) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if a metric definition has any variable bindings
 */
export function hasVariableBindings(definition: MetricDefinition): boolean {
  return isDynamicRecursively(definition);
}

/**
 * Get active variables by type from a list of simple variable objects.
 */
export function getActiveVariablesByType(
  variables: SimpleVariable[]
): Record<string, SimpleVariable[]> {
  const activeVariables: Record<string, SimpleVariable[]> = {};

  variables.forEach((variable) => {
    if (!activeVariables[variable.type]) {
      activeVariables[variable.type] = [];
    }
    activeVariables[variable.type].push(variable);
  });

  return activeVariables;
}

/**
 * Map modifier types to variable types
 */
export const MODIFIER_TO_VARIABLE_TYPE_MAP = {
  saleType: "saleType",
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
