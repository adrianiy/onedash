import { useMemo } from "react";
import type {
  MetricDefinition,
  MetricModifiers,
  ComparisonType,
  SaleType,
  TimeframeType,
  CalculationType,
  IndicatorType,
} from "@/types/metricConfig";
import {
  generateMetricId,
  generateMetricTitle,
  isModifierCompatible,
  IndicatorMetadata,
  ModifiersMetadata,
} from "@/types/metricConfig";
import { useVariableStore } from "@/store/variableStore";

export interface MetricGenerationOptions {
  mode: "single" | "multiple";
  selectedIndicators: (string | { type: "variable"; key: string })[];
  selectedModifiers: Record<
    string,
    (string | { type: "variable"; key: string })[]
  >;
  customValues?: Record<string, unknown>;
}

const VARIABLE_PREFIX = "var:";

const isVariable = (value: string | { type: "variable"; key: string }) =>
  typeof value === "object"
    ? value.type === "variable"
    : value.startsWith(VARIABLE_PREFIX);

const getVariableKey = (value: string | { type: "variable"; key: string }) =>
  typeof value === "object"
    ? value.key
    : value.substring(VARIABLE_PREFIX.length);

/**
 * Función de utilidad para asignar un valor a un modificador con seguridad de tipos
 */
function setModifierValue(
  modifiers: MetricModifiers,
  key: string,
  value:
    | string
    | { type: "variable"; key: string }
    | { type: string; value: number }
): void {
  if (
    typeof value === "object" &&
    "key" in value &&
    value.type === "variable"
  ) {
    modifiers[key as keyof MetricModifiers] = {
      type: "variable",
      key: value.key,
    };
    return;
  }

  if (typeof value === "string" && isVariable(value)) {
    modifiers[key as keyof MetricModifiers] = {
      type: "variable",
      key: getVariableKey(value),
    };
    return;
  }

  switch (key) {
    case "saleType":
      modifiers.saleType = value as SaleType;
      break;
    case "timeframe":
      modifiers.timeframe = value as TimeframeType;
      break;
    case "comparison":
      modifiers.comparison = value as ComparisonType;
      break;
    case "calculation":
      modifiers.calculation = value as CalculationType;
      break;
  }
}

/**
 * Verifica si un modificador tiene un valor por defecto
 */
function hasDefaultValue(modifier: string): boolean {
  return !!ModifiersMetadata[modifier]?.defaultValue;
}

/**
 * Obtiene el valor por defecto de un modificador
 */
function getDefaultValue(modifier: string): string | null {
  return ModifiersMetadata[modifier]?.defaultValue || null;
}

/**
 * Verifica si un indicador es compatible con un modificador específico
 */
function isIndicatorModifierCompatible(
  indicator: string | { type: "variable"; key: string },
  modifier: string
): boolean {
  if (isVariable(indicator)) {
    // Los indicadores dinámicos son compatibles con todos los modificadores estándar
    return [
      "saleType",
      "scope",
      "timeframe",
      "comparison",
      "calculation",
    ].includes(modifier);
  }

  const indicatorKey =
    typeof indicator === "object" ? indicator.key : indicator;
  return isModifierCompatible(indicatorKey, modifier);
}

/**
 * Verifica si un indicador cumple con todos sus requisitos de modificadores
 */
function indicatorMeetsRequirements(
  indicator: string | { type: "variable"; key: string },
  selectedModifiers: Record<
    string,
    (string | { type: "variable"; key: string })[]
  >
): boolean {
  if (isVariable(indicator)) {
    // Para indicadores dinámicos, verificamos que tengan al menos los modificadores básicos requeridos
    // Asumimos que requieren al menos saleType y calculation como los indicadores normales
    const basicRequiredModifiers = ["saleType", "calculation"];
    return basicRequiredModifiers.every(
      (modifier) =>
        selectedModifiers[modifier]?.length > 0 || hasDefaultValue(modifier)
    );
  }
  // Obtenemos los modificadores requeridos para este indicador
  const indicatorKey =
    typeof indicator === "object" ? indicator.key : indicator;
  const requiredModifiers =
    IndicatorMetadata[indicatorKey]?.requiredModifiers || [];

  // Verificamos que todos los modificadores requeridos tengan al menos un valor seleccionado
  // o tengan un valor por defecto
  return requiredModifiers.every(
    (modifier) =>
      selectedModifiers[modifier]?.length > 0 || hasDefaultValue(modifier)
  );
}

/**
 * Hook para generar métricas basadas en selecciones de indicadores y modificadores
 */
export function useMetricGeneration({
  mode,
  selectedIndicators,
  selectedModifiers,
  customValues = {},
}: MetricGenerationOptions) {
  // Obtener variables del store para pasarlas a las funciones de generación
  const { variables } = useVariableStore();
  /**
   * Generar métricas basadas en las selecciones
   */
  const generatedMetrics = useMemo(() => {
    if (selectedIndicators.length === 0) return [];

    // Filtramos primero los indicadores que cumplen los requisitos
    const validIndicators = selectedIndicators.filter((indicator) =>
      indicatorMeetsRequirements(indicator, selectedModifiers)
    );

    if (validIndicators.length === 0) return [];

    if (mode === "single" && validIndicators.length > 0) {
      // En modo single, solo generamos una métrica con la primera selección de cada tipo
      const indicator = validIndicators[0];
      const modifiers: MetricModifiers = {};

      // Tomamos el primer valor seleccionado de cada modificador (si existe)
      Object.entries(selectedModifiers).forEach(([key, values]) => {
        if (
          values.length > 0 &&
          isIndicatorModifierCompatible(indicator, key)
        ) {
          if (
            key === "comparison" &&
            values[0] === "a-n" &&
            customValues["comparison_a_n_value"]
          ) {
            // Caso especial para a-n que requiere un valor
            setModifierValue(modifiers, key, {
              type: "a-n",
              value: customValues["comparison_a_n_value"] as number,
            });
          } else {
            setModifierValue(modifiers, key, values[0]);
          }
        }
      });

      // Aplicar valores por defecto para modificadores requeridos sin selección
      let requiredModifiers: string[] = [];

      if (isVariable(indicator)) {
        // Para indicadores dinámicos, usar modificadores básicos
        requiredModifiers = ["saleType", "calculation"];
      } else {
        const indicatorKey =
          typeof indicator === "object" ? indicator.key : indicator;
        requiredModifiers =
          IndicatorMetadata[indicatorKey]?.requiredModifiers || [];
      }

      requiredModifiers.forEach((modifier) => {
        // Si el modificador es requerido, compatible, no tiene selección pero tiene valor por defecto
        if (
          isIndicatorModifierCompatible(indicator, modifier) &&
          !modifiers[modifier as keyof MetricModifiers] &&
          (selectedModifiers[modifier]?.length === 0 ||
            !selectedModifiers[modifier]) &&
          hasDefaultValue(modifier)
        ) {
          const defaultValue = getDefaultValue(modifier);
          if (defaultValue) {
            setModifierValue(modifiers, modifier, defaultValue);
          }
        }
      });

      const finalIndicator = isVariable(indicator)
        ? {
            type: "variable" as const,
            key: getVariableKey(indicator),
          }
        : indicator;

      // Generar una única métrica
      return [
        {
          id: generateMetricId(finalIndicator, modifiers),
          indicator: finalIndicator as IndicatorType,
          modifiers,
          title: generateMetricTitle(finalIndicator, modifiers, variables),
        },
      ];
    } else {
      // En modo multiple, generamos todas las combinaciones posibles
      return generateAllMetricCombinations(
        validIndicators,
        selectedModifiers,
        customValues,
        variables
      );
    }
  }, [mode, selectedIndicators, selectedModifiers, customValues, variables]);

  return {
    generatedMetrics,
    // Otras funciones de utilidad que podríamos necesitar
  };
}

/**
 * Función auxiliar para generar todas las combinaciones posibles de métricas
 * basadas en los indicadores y modificadores seleccionados
 */
function generateAllMetricCombinations(
  indicators: (string | { type: "variable"; key: string })[],
  modifierSelections: Record<
    string,
    (string | { type: "variable"; key: string })[]
  >,
  customValues: Record<string, unknown>,
  variables: Record<string, unknown> = {}
): MetricDefinition[] {
  const metrics: MetricDefinition[] = [];

  // Para cada indicador seleccionado
  for (const indicator of indicators) {
    // Obtenemos los modificadores que están seleccionados y son compatibles
    const selectedCompatibleModifiers = Object.keys(modifierSelections).filter(
      (modifier) => isIndicatorModifierCompatible(indicator, modifier)
    );

    // Agregamos también los modificadores requeridos que tienen valores por defecto
    const requiredModifiers = isVariable(indicator)
      ? ["saleType", "calculation"]
      : IndicatorMetadata[
          typeof indicator === "object" ? indicator.key : indicator
        ]?.requiredModifiers || [];

    const allRelevantModifiers = new Set([
      ...selectedCompatibleModifiers,
      ...requiredModifiers.filter(
        (modifier) =>
          isIndicatorModifierCompatible(indicator, modifier) &&
          hasDefaultValue(modifier)
      ),
    ]);

    // Generamos todas las combinaciones posibles
    const combinations = generateModifierCombinations(
      indicator,
      Array.from(allRelevantModifiers),
      modifierSelections,
      customValues,
      0,
      {},
      variables
    );

    // Añadimos todas las combinaciones a la lista
    metrics.push(...combinations);
  }

  return metrics;
}

/**
 * Genera todas las combinaciones posibles de modificadores para un indicador
 */
function generateModifierCombinations(
  indicator: string | { type: "variable"; key: string },
  compatibleModifiers: string[],
  modifierSelections: Record<
    string,
    (string | { type: "variable"; key: string })[]
  >,
  customValues: Record<string, unknown>,
  currentIndex: number = 0,
  currentModifiers: MetricModifiers = {},
  variables: Record<string, unknown> = {}
): MetricDefinition[] {
  // Si hemos procesado todos los modificadores, generamos la métrica
  if (currentIndex >= compatibleModifiers.length) {
    const finalIndicator = isVariable(indicator)
      ? { type: "variable" as const, key: getVariableKey(indicator) }
      : indicator;

    return [
      {
        id: generateMetricId(finalIndicator, currentModifiers),
        indicator: finalIndicator as IndicatorType,
        modifiers: { ...currentModifiers },
        title: generateMetricTitle(finalIndicator, currentModifiers, variables),
      },
    ];
  }

  const metrics: MetricDefinition[] = [];
  const currentModifier = compatibleModifiers[currentIndex];
  const selectedValues = modifierSelections[currentModifier];

  // Si no hay valores seleccionados para este modificador, verificar si tiene valor por defecto
  if (!selectedValues || selectedValues.length === 0) {
    // Verificar si es un modificador requerido y tiene valor por defecto
    let isRequired = false;
    if (isVariable(indicator)) {
      // Para indicadores dinámicos, saleType y calculation son requeridos
      isRequired = ["saleType", "calculation"].includes(currentModifier);
    } else {
      const indicatorKey =
        typeof indicator === "object" ? indicator.key : indicator;
      const requiredModifiers =
        IndicatorMetadata[indicatorKey]?.requiredModifiers || [];
      isRequired = requiredModifiers.includes(currentModifier);
    }

    if (isRequired && hasDefaultValue(currentModifier)) {
      // Aplicar valor por defecto y continuar
      const newModifiers = { ...currentModifiers };
      const defaultValue = getDefaultValue(currentModifier);
      if (defaultValue) {
        setModifierValue(newModifiers, currentModifier, defaultValue);
      }
      return generateModifierCombinations(
        indicator,
        compatibleModifiers,
        modifierSelections,
        customValues,
        currentIndex + 1,
        newModifiers,
        variables
      );
    } else {
      // No es requerido o no tiene valor por defecto, avanzar al siguiente
      return generateModifierCombinations(
        indicator,
        compatibleModifiers,
        modifierSelections,
        customValues,
        currentIndex + 1,
        currentModifiers,
        variables
      );
    }
  }

  // Para cada valor seleccionado para este modificador
  for (const value of selectedValues) {
    // Creamos una copia de los modificadores actuales
    const newModifiers = { ...currentModifiers };

    // Aplicamos el valor actual del modificador
    if (
      currentModifier === "comparison" &&
      value === "a-n" &&
      customValues["comparison_a_n_value"]
    ) {
      // Caso especial para a-n que requiere un valor
      setModifierValue(newModifiers, currentModifier, {
        type: "a-n",
        value: customValues["comparison_a_n_value"] as number,
      });
    } else {
      setModifierValue(newModifiers, currentModifier, value);
    }

    // Generamos las combinaciones para el siguiente modificador
    const newCombinations = generateModifierCombinations(
      indicator,
      compatibleModifiers,
      modifierSelections,
      customValues,
      currentIndex + 1,
      newModifiers,
      variables
    );

    // Añadimos las nuevas combinaciones a la lista
    metrics.push(...newCombinations);
  }

  return metrics;
}
