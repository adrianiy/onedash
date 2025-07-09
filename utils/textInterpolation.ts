import type { MetricDefinition } from "../types/metricConfig";
import { ModifiersMetadata } from "../types/metricConfig";

export interface VariableOption {
  key: string;
  label: string;
  category: string;
  description?: string;
}

/**
 * Interpola un texto reemplazando variables @variable con sus valores resueltos
 */
export function interpolateText(
  template: string,
  variables: Record<string, unknown>,
  metric?: MetricDefinition
): string {
  if (!template) return "";

  return template.replace(/@(\w+)/g, (match, key) => {
    const value = resolveVariable(key, variables, metric);
    return value !== undefined && value !== null ? String(value) : match;
  });
}

/**
 * Extrae todas las variables @variable de un texto
 */
export function extractVariables(text: string): string[] {
  const matches = text.match(/@(\w+)/g);
  return matches ? matches.map((m) => m.slice(1)) : [];
}

/**
 * Verifica si un texto contiene variables de interpolación
 */
export function hasVariables(text: string): boolean {
  return /@(\w+)/.test(text);
}

/**
 * Resuelve el valor de una variable específica
 */
export function resolveVariable(
  key: string,
  variables: Record<string, unknown>,
  metric?: MetricDefinition
): unknown {
  // Primero verificar en las variables del store
  if (variables[key] !== undefined) {
    return resolveVariableValue(variables[key], key);
  }

  // Luego verificar en la métrica si está disponible
  if (metric) {
    if (key === "indicator") {
      return resolveVariableValue(metric.indicator, key);
    }

    if (metric.modifiers[key as keyof typeof metric.modifiers]) {
      return resolveVariableValue(
        metric.modifiers[key as keyof typeof metric.modifiers],
        key
      );
    }
  }

  return undefined;
}

/**
 * Resuelve un valor de variable, manejando tanto valores estáticos como dinámicos
 */
function resolveVariableValue(value: unknown, key: string): string {
  if (!value) return "";

  // Si es un valor dinámico (variable binding)
  if (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    (value as { type: string }).type === "variable"
  ) {
    return "Variable Dinámica";
  }

  // Si es un valor estático, buscar la etiqueta amigable
  if (typeof value === "string") {
    const metadata = ModifiersMetadata[key as keyof typeof ModifiersMetadata];
    if (metadata) {
      const option = metadata.options.find((opt) => opt.value === value);
      return option ? option.label : value;
    }
    return value;
  }

  return String(value);
}

/**
 * Obtiene todas las variables disponibles para interpolación
 */
export function getAvailableVariables(
  variables: Record<string, unknown>,
  metric?: MetricDefinition
): VariableOption[] {
  const options: VariableOption[] = [];

  // Variables dinámicas de la métrica (solo las que sean variable bindings)
  if (metric) {
    // Indicador dinámico
    if (
      metric.indicator &&
      typeof metric.indicator === "object" &&
      metric.indicator !== null &&
      "type" in metric.indicator &&
      metric.indicator.type === "variable"
    ) {
      const variableBinding = metric.indicator as {
        type: "variable";
        key: string;
      };
      const resolvedValue = variables[variableBinding.key];
      if (resolvedValue !== undefined && resolvedValue !== null) {
        const label = String(resolvedValue);
        options.push({
          key: "indicator",
          label: `Indicador`,
          category: "Variables Dinámicas",
          description: `Valor actual: ${label}`,
        });
      }
    }

    // Modificadores dinámicos
    Object.entries(metric.modifiers).forEach(([key, value]) => {
      if (
        value &&
        typeof value === "object" &&
        value !== null &&
        "type" in value &&
        (value as { type: string }).type === "variable"
      ) {
        const variableBinding = value as { type: "variable"; key: string };
        const resolvedValue = variables[variableBinding.key];
        if (resolvedValue !== undefined && resolvedValue !== null) {
          const displayName = getVariableDisplayName(key);
          const metadata =
            ModifiersMetadata[key as keyof typeof ModifiersMetadata];
          let label = String(resolvedValue);

          // Si hay metadatos, buscar la etiqueta amigable
          if (metadata) {
            const option = metadata.options.find(
              (opt) => opt.value === resolvedValue
            );
            label = option ? option.label : label;
          }

          options.push({
            key,
            label: `${displayName}`,
            category: "Variables Dinámicas",
            description: `Valor actual: ${label}`,
          });
        }
      }
    });
  }

  return options;
}

/**
 * Obtiene el nombre amigable para mostrar de una variable
 */
function getVariableDisplayName(key: string): string {
  const displayNames: Record<string, string> = {
    indicator: "Indicador",
    saleType: "Tipo de Venta",
    scope: "Alcance",
    timeframe: "Período",
    comparison: "Comparación",
    calculation: "Cálculo",
  };

  return displayNames[key] || key;
}

/**
 * Filtra variables basándose en un texto de búsqueda
 */
export function filterVariables(
  variables: VariableOption[],
  searchText: string
): VariableOption[] {
  if (!searchText) return variables;

  const search = searchText.toLowerCase();
  return variables.filter(
    (variable) =>
      variable.key.toLowerCase().includes(search) ||
      variable.label.toLowerCase().includes(search) ||
      variable.category.toLowerCase().includes(search)
  );
}

/**
 * Inserta una variable en una posición específica del texto
 */
export function insertVariableAtPosition(
  text: string,
  variable: string,
  position: number
): { newText: string; newPosition: number } {
  const before = text.substring(0, position);
  const after = text.substring(position);
  const variableText = `@${variable}`;
  const newText = before + variableText + after;
  const newPosition = position + variableText.length;

  return { newText, newPosition };
}

/**
 * Encuentra la posición donde debería insertarse una variable basándose en el trigger @
 */
export function findInsertPosition(
  text: string,
  cursorPosition: number
): { startPos: number; endPos: number; searchText: string } | null {
  // Buscar hacia atrás desde la posición del cursor para encontrar @
  let startPos = cursorPosition - 1;
  while (startPos >= 0 && text[startPos] !== "@" && text[startPos] !== " ") {
    startPos--;
  }

  if (startPos < 0 || text[startPos] !== "@") {
    return null;
  }

  const searchText = text.substring(startPos + 1, cursorPosition);
  return {
    startPos,
    endPos: cursorPosition,
    searchText,
  };
}
