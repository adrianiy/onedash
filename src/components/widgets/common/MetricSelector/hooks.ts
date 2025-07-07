import { useState, useMemo, useCallback, useEffect } from "react";
import type {
  IndicatorType,
  MetricDefinition,
} from "../../../../types/metricConfig";
import {
  IndicatorMetadata,
  ModifiersMetadata,
} from "../../../../types/metricConfig";
import { useMetricGeneration } from "../../../../hooks/useMetricGeneration";
import { useVariableStore } from "../../../../store/variableStore";
import {
  getActiveVariablesByType,
  MODIFIER_TO_VARIABLE_TYPE_MAP,
  SELECTOR_TO_VARIABLE_TYPE_MAP,
  DYNAMIC_LABELS,
} from "../../../../utils/variableResolver";
import type { SelectedModifiers } from "./types";

/**
 * Hook personalizado para gestionar las funcionalidades del MetricSelector
 */
export const useMetricSelector = (
  mode: "single" | "multiple",
  initialTab = "indicators",
  initialMetric?: MetricDefinition
) => {
  // Estado para las pestañas
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Estado para la búsqueda
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Estado para mostrar/ocultar el sidebar con el resumen
  const [showSidebar, setShowSidebar] = useState<boolean>(false);

  // Estado para controlar si se muestra la nota informativa de campos dinámicos
  const [showDynamicTip, setShowDynamicTip] = useState<boolean>(() => {
    // Verificar si el usuario ya ocultó el tip anteriormente
    const hiddenTip = localStorage.getItem(
      "metric-selector-dynamic-tip-hidden"
    );
    return hiddenTip !== "true";
  });

  // Estado para las selecciones
  const [selectedIndicators, setSelectedIndicators] = useState<IndicatorType[]>(
    []
  );
  const [selectedModifiers, setSelectedModifiers] = useState<SelectedModifiers>(
    {
      saleType: [],
      scope: [],
      timeframe: [],
      comparison: [],
      calculation: [],
    }
  );
  const [customValues, setCustomValues] = useState<Record<string, unknown>>({
    comparison_a_n_value: 1, // Representa 1 año de diferencia (por defecto)
  });

  // Efecto para inicializar valores basándose en la métrica inicial
  useEffect(() => {
    if (initialMetric) {
      // Extraer el indicador de la métrica
      setSelectedIndicators([initialMetric.indicator]);

      // Extraer los modificadores de la métrica
      const modifiers: SelectedModifiers = {
        saleType: initialMetric.modifiers.saleType
          ? [initialMetric.modifiers.saleType]
          : [],
        scope: initialMetric.modifiers.scope
          ? [initialMetric.modifiers.scope]
          : [],
        timeframe: initialMetric.modifiers.timeframe
          ? [initialMetric.modifiers.timeframe]
          : [],
        comparison: initialMetric.modifiers.comparison
          ? [
              typeof initialMetric.modifiers.comparison === "object"
                ? "a-n"
                : initialMetric.modifiers.comparison,
            ]
          : [],
        calculation: initialMetric.modifiers.calculation
          ? [initialMetric.modifiers.calculation]
          : [],
      };
      setSelectedModifiers(modifiers);

      // Si hay un valor a-n, configurar el valor personalizado
      if (
        initialMetric.modifiers.comparison &&
        typeof initialMetric.modifiers.comparison === "object" &&
        initialMetric.modifiers.comparison.type === "a-n"
      ) {
        setCustomValues({
          ...customValues,
          comparison_a_n_value: initialMetric.modifiers.comparison.value,
        });
      }
    }
  }, [initialMetric]);

  // Usar el hook para generar métricas
  const { generatedMetrics } = useMetricGeneration({
    mode,
    selectedIndicators,
    selectedModifiers,
    customValues,
  });

  // Contadores para cada pestaña - los específicos de cada una
  const indicatorsCount = useMemo(
    () =>
      selectedIndicators.length +
      selectedModifiers.saleType.length +
      selectedModifiers.scope.length,
    [
      selectedIndicators.length,
      selectedModifiers.saleType.length,
      selectedModifiers.scope.length,
    ]
  );

  const timerangeCount = useMemo(
    () => selectedModifiers.timeframe.length,
    [selectedModifiers.timeframe.length]
  );

  const calculationsCount = useMemo(
    () => selectedModifiers.calculation.length,
    [selectedModifiers.calculation.length]
  );

  // Verificar si un indicador cumple sus requisitos específicos
  const indicatorMeetsRequirements = useCallback(
    (indicator: IndicatorType): boolean => {
      const requiredModifiers =
        IndicatorMetadata[indicator]?.requiredModifiers || [];

      // Comprobar que todos los modificadores requeridos tienen al menos una selección
      // o tienen un valor por defecto
      return requiredModifiers.every(
        (modifier) =>
          selectedModifiers[modifier as keyof SelectedModifiers]?.length > 0 ||
          hasDefaultValue(modifier)
      );
    },
    [selectedModifiers]
  );

  // Verificar si todos los indicadores seleccionados cumplen sus requisitos
  const allIndicatorsMeetRequirements = useCallback((): boolean => {
    if (selectedIndicators.length === 0) return false;

    // Comprobar que todos los indicadores seleccionados cumplen sus requisitos
    return selectedIndicators.every((indicator) =>
      indicatorMeetsRequirements(indicator)
    );
  }, [selectedIndicators, indicatorMeetsRequirements]);

  // Comprobar si una pestaña tiene elementos requeridos
  const isTabRequired = useCallback(
    (tab: string): boolean => {
      switch (tab) {
        case "calculations":
          return selectedIndicators.some((indicator) =>
            IndicatorMetadata[indicator]?.requiredModifiers.includes(
              "calculation"
            )
          );
        // Otros casos según sea necesario
        default:
          return false;
      }
    },
    [selectedIndicators]
  );

  // Comprobar si una pestaña está completa
  const isTabComplete = useCallback(
    (tab: string): boolean => {
      switch (tab) {
        case "calculations":
          return (
            !isTabRequired("calculations") ||
            selectedModifiers.calculation.length > 0
          );
        // Otros casos según sea necesario
        default:
          return true;
      }
    },
    [isTabRequired, selectedModifiers.calculation.length]
  );

  // Verificar si un modificador es requerido
  const isModifierRequired = useCallback(
    (modifier: string): boolean => {
      return selectedIndicators.some((indicator) =>
        IndicatorMetadata[indicator]?.requiredModifiers.includes(modifier)
      );
    },
    [selectedIndicators]
  );

  // Verificar si un modificador tiene un valor por defecto
  const hasDefaultValue = useCallback((modifier: string): boolean => {
    return !!ModifiersMetadata[modifier]?.defaultValue;
  }, []);

  // Obtener el valor por defecto de un modificador
  const getDefaultValue = useCallback((modifier: string): string | null => {
    return ModifiersMetadata[modifier]?.defaultValue || null;
  }, []);

  // Verificar si un modificador es estrictamente requerido (no tiene valor por defecto)
  const isStrictlyRequired = useCallback(
    (modifier: string): boolean => {
      return isModifierRequired(modifier) && !hasDefaultValue(modifier);
    },
    [isModifierRequired, hasDefaultValue]
  );

  // Verificar si se aplicará un valor por defecto para un modificador específico
  const willApplyDefaultValue = useCallback(
    (modifier: string): boolean => {
      return (
        selectedModifiers[modifier as keyof SelectedModifiers]?.length === 0 &&
        hasDefaultValue(modifier)
      );
    },
    [selectedModifiers, hasDefaultValue]
  );

  // Obtener la etiqueta del valor por defecto
  const getDefaultValueLabel = useCallback(
    (modifier: string): string => {
      const defaultValue = getDefaultValue(modifier);
      if (!defaultValue) return "";

      const options = ModifiersMetadata[modifier]?.options || [];
      const option = options.find((opt) => opt.value === defaultValue);
      return option?.label || defaultValue;
    },
    [getDefaultValue]
  );

  // Obtener los modificadores requeridos que faltan para un indicador
  const getMissingRequiredModifiers = useCallback(
    (indicator: IndicatorType): string[] => {
      const requiredModifiers =
        IndicatorMetadata[indicator]?.requiredModifiers || [];

      return requiredModifiers
        .filter(
          (modifier) =>
            selectedModifiers[modifier as keyof SelectedModifiers]?.length === 0
        )
        .map((modifier) => ModifiersMetadata[modifier]?.name || modifier);
    },
    [selectedModifiers]
  );

  // Función para manejar la selección de indicadores
  const handleIndicatorSelect = useCallback(
    (indicator: IndicatorType, isChecked: boolean) => {
      if (isChecked) {
        if (mode === "single") {
          setSelectedIndicators([indicator]);
        } else {
          setSelectedIndicators([...selectedIndicators, indicator]);
        }
      } else {
        setSelectedIndicators(
          selectedIndicators.filter((i) => i !== indicator)
        );
      }
    },
    [selectedIndicators, mode]
  );

  // Función para manejar la selección de modificadores
  const handleModifierSelect = useCallback(
    (type: string, value: string, isChecked: boolean) => {
      if (isChecked) {
        if (mode === "single") {
          setSelectedModifiers({
            ...selectedModifiers,
            [type]: [value],
          });
        } else {
          setSelectedModifiers({
            ...selectedModifiers,
            [type]: [
              ...(selectedModifiers[type as keyof SelectedModifiers] || []),
              value,
            ],
          });
        }
      } else {
        setSelectedModifiers({
          ...selectedModifiers,
          [type]: (
            selectedModifiers[type as keyof SelectedModifiers] || []
          ).filter((v) => v !== value),
        });
      }
    },
    [selectedModifiers, mode]
  );

  // Función para manejar cambios en valores personalizados
  const handleCustomValueChange = useCallback(
    (key: string, value: unknown) => {
      setCustomValues({
        ...customValues,
        [key]: value,
      });
    },
    [customValues]
  );

  const toggleSidebar = useCallback(() => {
    setShowSidebar(!showSidebar);
  }, [showSidebar]);

  // Función para ocultar el tip de campos dinámicos permanentemente
  const hideDynamicTip = useCallback(() => {
    setShowDynamicTip(false);
    localStorage.setItem("metric-selector-dynamic-tip-hidden", "true");
  }, []);

  // Función para obtener la etiqueta de un modificador
  const getModifierLabel = useCallback(
    (modKey: string, modValue: unknown): string => {
      if (!modValue) return "";

      // Si es un objeto de comparación tipo a-n
      if (
        modKey === "comparison" &&
        typeof modValue === "object" &&
        modValue !== null &&
        "type" in modValue &&
        modValue.type === "a-n" &&
        "value" in modValue
      ) {
        return `Hace ${modValue.value} años`;
      }

      // Para el resto de modificadores
      const options = ModifiersMetadata[modKey]?.options || [];
      const option = options.find((opt) => opt.value === modValue);

      return option?.label || String(modValue);
    },
    []
  );

  // Genera un mensaje explicativo de por qué no se puede añadir/seleccionar todavía
  const generateButtonHelpMessage = useCallback((): string => {
    if (selectedIndicators.length === 0) {
      return "Debes seleccionar al menos un indicador";
    }

    // Verificar qué requisitos faltan para cada indicador
    const missingRequirements: string[] = [];

    // Para cada indicador seleccionado
    selectedIndicators.forEach((indicator) => {
      const requiredModifiers =
        IndicatorMetadata[indicator]?.requiredModifiers || [];
      const missingModifiers = requiredModifiers.filter(
        (modifier) =>
          selectedModifiers[modifier as keyof SelectedModifiers]?.length === 0
      );

      // Si faltan modificadores para este indicador
      if (missingModifiers.length > 0) {
        const missingLabels = missingModifiers
          .map((modifier) => ModifiersMetadata[modifier]?.name)
          .filter(Boolean);

        if (missingLabels.length > 0) {
          missingRequirements.push(
            `Para ${
              IndicatorMetadata[indicator].name
            }, debes seleccionar: ${missingLabels.join(", ")}`
          );
        }
      }
    });

    if (missingRequirements.length > 0) {
      return missingRequirements.join("\n");
    }

    // Por si hay algún otro motivo
    return "Faltan campos requeridos";
  }, [selectedIndicators, selectedModifiers]);

  // Variable para controlar la habilitación del botón
  const isButtonEnabled = allIndicatorsMeetRequirements();

  // Obtener variables activas del store
  const { getVisibleVariables, initializeIfNeeded } = useVariableStore();

  // Asegurar que el store está inicializado
  useEffect(() => {
    initializeIfNeeded();
  }, [initializeIfNeeded]);

  const visibleVariables = getVisibleVariables();

  // Detectar variables activas por tipo
  const activeVariablesByType = useMemo(() => {
    return getActiveVariablesByType(visibleVariables);
  }, [visibleVariables]);

  // Verificar si hay variable activa de un tipo específico
  const hasActiveVariableOfType = useCallback(
    (variableType: string): boolean => {
      return activeVariablesByType[variableType]?.length > 0;
    },
    [activeVariablesByType]
  );

  // Obtener la etiqueta dinámica para un contexto
  const getDynamicLabel = useCallback((context: string): string => {
    return DYNAMIC_LABELS[context as keyof typeof DYNAMIC_LABELS] || "Dinámico";
  }, []);

  // Verificar si debe mostrar opción dinámica para un modificador
  const shouldShowDynamicOption = useCallback(
    (modifierType: string): boolean => {
      const variableType =
        MODIFIER_TO_VARIABLE_TYPE_MAP[
          modifierType as keyof typeof MODIFIER_TO_VARIABLE_TYPE_MAP
        ];
      return variableType ? hasActiveVariableOfType(variableType) : false;
    },
    [hasActiveVariableOfType]
  );

  // Verificar si debe mostrar opción dinámica para un selector (indicators, timerange)
  const shouldShowDynamicOptionForSelector = useCallback(
    (selectorType: string): boolean => {
      const variableType =
        SELECTOR_TO_VARIABLE_TYPE_MAP[
          selectorType as keyof typeof SELECTOR_TO_VARIABLE_TYPE_MAP
        ];
      return variableType ? hasActiveVariableOfType(variableType) : false;
    },
    [hasActiveVariableOfType]
  );

  // Verificar si un modificador es compatible con alguno de los indicadores seleccionados
  const isCompatibleModifier = useCallback(
    (modifier: string): boolean => {
      // Si no hay indicadores seleccionados, no hay compatibilidad
      if (selectedIndicators.length === 0) return false;

      // Verificar si hay algún indicador dinámico seleccionado
      const hasDynamicIndicator = selectedIndicators.some(
        (indicator) => String(indicator) === "{{dynamic}}"
      );

      if (hasDynamicIndicator) {
        // Para indicadores dinámicos, obtener la combinatoria de todos los modificadores
        // de todos los posibles valores que podría tener la variable
        const indicatorVariables = activeVariablesByType["indicator"] || [];

        if (indicatorVariables.length > 0) {
          // Para cada variable de tipo indicator, obtener todos los posibles valores
          // y sus modificadores compatibles
          const allPossibleModifiers = new Set<string>();

          // Obtener todos los indicadores disponibles como posibles valores
          Object.keys(IndicatorMetadata).forEach((indicatorKey) => {
            const compatibleModifiers =
              IndicatorMetadata[indicatorKey]?.compatibleModifiers || [];
            compatibleModifiers.forEach((mod) => allPossibleModifiers.add(mod));
          });

          return allPossibleModifiers.has(modifier);
        }
      }

      // Para indicadores estáticos, usar la lógica original
      return selectedIndicators
        .filter((indicator) => String(indicator) !== "{{dynamic}}")
        .some((indicator) =>
          IndicatorMetadata[indicator]?.compatibleModifiers.includes(modifier)
        );
    },
    [selectedIndicators, activeVariablesByType]
  );

  // Determinar si el panel debe ser visible (para indicadores o temporalidades)
  const isPanelVisible = useMemo(() => {
    if (activeTab === "indicators" && selectedIndicators.length > 0) {
      // Verificar si hay algún indicador dinámico seleccionado
      const hasDynamicIndicator = selectedIndicators.some(
        (indicator) => String(indicator) === "{{dynamic}}"
      );

      if (hasDynamicIndicator) {
        // Para indicadores dinámicos, siempre mostrar el panel si hay variables activas
        const indicatorVariables = activeVariablesByType["indicator"] || [];
        if (indicatorVariables.length > 0) {
          // Verificar si hay al menos algún modificador compatible en la combinatoria
          const compatibleModifierTypes = ["saleType", "scope"];
          return compatibleModifierTypes.some((modifierType) =>
            isCompatibleModifier(modifierType)
          );
        }
      }

      // Para indicadores estáticos, usar la lógica original
      const compatibleModifierTypes = ["saleType", "scope"];
      return compatibleModifierTypes.some((modifierType) => {
        return selectedIndicators
          .filter((indicator) => String(indicator) !== "{{dynamic}}")
          .some((indicator) => {
            const compatibleModifiers =
              IndicatorMetadata[indicator]?.compatibleModifiers || [];
            return compatibleModifiers.includes(modifierType);
          });
      });
    }

    if (activeTab === "timeframe" && selectedModifiers.timeframe.length > 0) {
      // Para timeframe, solo mostrar si hay modificadores de comparación disponibles
      const comparisonModifiers = ModifiersMetadata.comparison?.options || [];
      return comparisonModifiers.length > 0;
    }

    return false;
  }, [
    activeTab,
    selectedIndicators,
    selectedModifiers.timeframe.length,
    activeVariablesByType,
    isCompatibleModifier,
  ]);

  return {
    // Estados
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    showSidebar,
    toggleSidebar,
    selectedIndicators,
    selectedModifiers,
    customValues,
    // Métricas generadas
    generatedMetrics,
    // Contadores
    indicatorsCount,
    timerangeCount,
    calculationsCount,
    // Funciones de utilidad
    isTabRequired,
    isTabComplete,
    isModifierRequired,
    hasDefaultValue,
    getDefaultValue,
    isStrictlyRequired,
    willApplyDefaultValue,
    getDefaultValueLabel,
    getMissingRequiredModifiers,
    isButtonEnabled,
    generateButtonHelpMessage,
    // Handlers
    handleIndicatorSelect,
    handleModifierSelect,
    handleCustomValueChange,
    // Estado del panel
    isPanelVisible,
    isCompatibleModifier,
    getModifierLabel,
    // Variables dinámicas
    activeVariablesByType,
    hasActiveVariableOfType,
    getDynamicLabel,
    shouldShowDynamicOption,
    shouldShowDynamicOptionForSelector,
    // Tip dinámico
    showDynamicTip,
    hideDynamicTip,
  };
};
