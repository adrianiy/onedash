import { useMemo } from "react";
import type {
  IndicatorType,
  MetricDefinition,
  MetricModifiers,
  ComparisonType,
} from "../types/metricConfig";
import {
  generateMetricId,
  generateMetricTitle,
  isModifierCompatible,
  IndicatorMetadata,
  ModifiersMetadata,
} from "../types/metricConfig";

export interface MetricGenerationOptions {
  mode: "single" | "multiple";
  selectedIndicators: IndicatorType[];
  selectedModifiers: Record<string, string[]>;
  customValues?: Record<string, unknown>;
}

/**
 * Función de utilidad para asignar un valor a un modificador con seguridad de tipos
 */
function setModifierValue(
  modifiers: MetricModifiers,
  key: string,
  value: string | { type: string; value: number }
): void {
  switch (key) {
    case "saleType":
      modifiers.saleType = value as any;
      break;
    case "scope":
      modifiers.scope = value as any;
      break;
    case "timeframe":
      modifiers.timeframe = value as any;
      break;
    case "comparison":
      if (typeof value === "object") {
        modifiers.comparison = value as ComparisonType;
      } else {
        modifiers.comparison = value as any;
      }
      break;
    case "calculation":
      modifiers.calculation = value as any;
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
 * Verifica si un indicador cumple con todos sus requisitos de modificadores
 */
function indicatorMeetsRequirements(
  indicator: IndicatorType,
  selectedModifiers: Record<string, string[]>
): boolean {
  // Obtenemos los modificadores requeridos para este indicador
  const requiredModifiers =
    IndicatorMetadata[indicator]?.requiredModifiers || [];

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
        if (values.length > 0 && isModifierCompatible(indicator, key)) {
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
      const requiredModifiers =
        IndicatorMetadata[indicator]?.requiredModifiers || [];
      requiredModifiers.forEach((modifier) => {
        // Si el modificador es requerido, compatible, no tiene selección pero tiene valor por defecto
        if (
          isModifierCompatible(indicator, modifier) &&
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

      // Generar una única métrica
      return [
        {
          id: generateMetricId(indicator, modifiers),
          indicator,
          modifiers,
          title: generateMetricTitle(indicator, modifiers),
        },
      ];
    } else {
      // En modo multiple, generamos todas las combinaciones posibles
      return generateAllMetricCombinations(
        validIndicators, // Usamos solo los indicadores válidos
        selectedModifiers,
        customValues
      );
    }
  }, [mode, selectedIndicators, selectedModifiers, customValues]);

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
  indicators: IndicatorType[],
  modifierSelections: Record<string, string[]>,
  customValues: Record<string, unknown>
): MetricDefinition[] {
  const metrics: MetricDefinition[] = [];

  // Para cada indicador seleccionado
  for (const indicator of indicators) {
    // Obtenemos los modificadores compatibles con este indicador
    const compatibleModifiers = Object.keys(modifierSelections).filter(
      (modifier) => isModifierCompatible(indicator, modifier)
    );

    // Generamos todas las combinaciones posibles
    const combinations = generateModifierCombinations(
      indicator,
      compatibleModifiers,
      modifierSelections,
      customValues
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
  indicator: IndicatorType,
  compatibleModifiers: string[],
  modifierSelections: Record<string, string[]>,
  customValues: Record<string, unknown>,
  currentIndex: number = 0,
  currentModifiers: MetricModifiers = {}
): MetricDefinition[] {
  // Si hemos procesado todos los modificadores, generamos la métrica
  if (currentIndex >= compatibleModifiers.length) {
    return [
      {
        id: generateMetricId(indicator, currentModifiers),
        indicator,
        modifiers: { ...currentModifiers },
        title: generateMetricTitle(indicator, currentModifiers),
      },
    ];
  }

  const metrics: MetricDefinition[] = [];
  const currentModifier = compatibleModifiers[currentIndex];
  const selectedValues = modifierSelections[currentModifier];

  // Si no hay valores seleccionados para este modificador, avanzamos al siguiente
  if (!selectedValues || selectedValues.length === 0) {
    return generateModifierCombinations(
      indicator,
      compatibleModifiers,
      modifierSelections,
      customValues,
      currentIndex + 1,
      currentModifiers
    );
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
      newModifiers
    );

    // Añadimos las nuevas combinaciones a la lista
    metrics.push(...newCombinations);
  }

  return metrics;
}
