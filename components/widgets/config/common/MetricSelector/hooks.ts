import { useState, useMemo, useCallback, useEffect } from "react";
import type { MetricDefinition } from "@/types/metricConfig";
import { IndicatorMetadata, ModifiersMetadata } from "@/types/metricConfig";
import { useMetricGeneration } from "@/hooks/useMetricGeneration";
import { useGridStore } from "@/store/gridStore";
import {
  MODIFIER_TO_VARIABLE_TYPE_MAP,
  SELECTOR_TO_VARIABLE_TYPE_MAP,
  DYNAMIC_LABELS,
} from "@/utils/variableResolver";
import type { SelectedModifiers } from "./types";
import type { Widget } from "@/types/widget";

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
  const [selectedIndicators, setSelectedIndicators] = useState<
    (string | { type: "variable"; key: string })[]
  >([]);
  const [selectedModifiers, setSelectedModifiers] = useState<SelectedModifiers>(
    {}
  );
  const [customValues, setCustomValues] = useState<Record<string, unknown>>({
    comparison_a_n_value: 1, // Representa 1 año de diferencia (por defecto)
  });

  // Efecto para inicializar valores basándose en la métrica inicial
  useEffect(() => {
    if (initialMetric) {
      // --- Extraer el indicador ---
      const indicator = initialMetric.indicator;
      if (typeof indicator === "object" && indicator.type === "variable") {
        setSelectedIndicators([{ type: "variable", key: indicator.key }]);
      } else {
        setSelectedIndicators([indicator as string]);
      }

      // --- Extraer los modificadores ---
      const newModifiers: SelectedModifiers = {};
      for (const key in initialMetric.modifiers) {
        const modKey = key as keyof typeof initialMetric.modifiers;
        const value = initialMetric.modifiers[modKey];

        if (value) {
          if (Array.isArray(value)) {
            // Si es un array, procesar cada elemento
            newModifiers[modKey] = value.map((item) => {
              if (
                typeof item === "object" &&
                "type" in item &&
                item.type === "variable"
              ) {
                return { type: "variable", key: item.key };
              }
              return item;
            });
          } else if (typeof value === "object") {
            if ("type" in value && value.type === "variable") {
              // Mantener el formato VariableBinding original
              newModifiers[modKey] = [{ type: "variable", key: value.key }];
            } else if ("type" in value && value.type === "a-n") {
              // Caso especial para comparison a-n
              newModifiers[modKey] = ["a-n"];
              setCustomValues((prev) => ({
                ...prev,
                comparison_a_n_value: value.value,
              }));
            }
          } else {
            newModifiers[modKey] = [value];
          }
        }
      }
      setSelectedModifiers(newModifiers);
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
      (selectedModifiers.saleType?.length || 0) +
      (selectedModifiers.scope?.length || 0),
    [selectedIndicators, selectedModifiers.saleType, selectedModifiers.scope]
  );

  const timerangeCount = useMemo(
    () => selectedModifiers.timeframe?.length || 0,
    [selectedModifiers.timeframe]
  );

  const calculationsCount = useMemo(
    () =>
      (selectedModifiers.calculation?.length || 0) +
      (selectedModifiers.comparison?.length || 0),
    [selectedModifiers.calculation, selectedModifiers.comparison]
  );

  // Verificar si un modificador tiene un valor por defecto
  const hasDefaultValue = useCallback((modifier: string): boolean => {
    return !!ModifiersMetadata[modifier]?.defaultValue;
  }, []);

  // Verificar si un indicador cumple sus requisitos específicos
  const indicatorMeetsRequirements = useCallback(
    (indicator: string | { type: "variable"; key: string }): boolean => {
      if (typeof indicator === "object" && indicator.type === "variable")
        return true; // Asumimos que los dinámicos cumplen
      if (typeof indicator !== "string") return false;
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
    [selectedModifiers, hasDefaultValue]
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
          return selectedIndicators.some(
            (indicator) =>
              typeof indicator === "string" &&
              !indicator.startsWith("var:") &&
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
            (selectedModifiers.calculation?.length || 0) > 0
          );
        // Otros casos según sea necesario
        default:
          return true;
      }
    },
    [isTabRequired, selectedModifiers.calculation]
  );

  // Verificar si un modificador es requerido
  const isModifierRequired = useCallback(
    (modifier: string): boolean => {
      return selectedIndicators.some(
        (indicator) =>
          typeof indicator === "string" &&
          !indicator.startsWith("var:") &&
          IndicatorMetadata[indicator]?.requiredModifiers.includes(modifier)
      );
    },
    [selectedIndicators]
  );

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
      const modifierSelections =
        selectedModifiers[modifier as keyof SelectedModifiers];
      return (
        (!modifierSelections || modifierSelections.length === 0) &&
        hasDefaultValue(modifier)
      );
    },
    [selectedModifiers, hasDefaultValue]
  );

  // Obtener el valor por defecto de un modificador
  const getDefaultValue = useCallback((modifier: string): string | null => {
    return ModifiersMetadata[modifier]?.defaultValue || null;
  }, []);

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
    (indicator: string | { type: "variable"; key: string }): string[] => {
      if (typeof indicator === "object" && indicator.type === "variable")
        return [];
      if (typeof indicator !== "string") return [];
      const requiredModifiers =
        IndicatorMetadata[indicator]?.requiredModifiers || [];

      return requiredModifiers
        .filter(
          (modifier) =>
            !selectedModifiers[modifier] ||
            selectedModifiers[modifier].length === 0
        )
        .map((modifier) => ModifiersMetadata[modifier]?.name || modifier);
    },
    [selectedModifiers]
  );

  // Función para comparar indicadores (soporta string y objeto variable)
  function isSameIndicator(
    a: string | { type: "variable"; key: string },
    b: string | { type: "variable"; key: string }
  ) {
    if (typeof a === "string" && typeof b === "string") return a === b;
    if (typeof a === "object" && typeof b === "object")
      return a.type === b.type && a.key === b.key;
    return false;
  }

  // Función para manejar la selección de indicadores
  const handleIndicatorSelect = useCallback(
    (
      indicator: string | { type: "variable"; key: string },
      isChecked: boolean
    ) => {
      if (isChecked) {
        if (mode === "single") {
          setSelectedIndicators([indicator]);
        } else {
          setSelectedIndicators([...selectedIndicators, indicator]);
        }
      } else {
        setSelectedIndicators(
          selectedIndicators.filter((i) => !isSameIndicator(i, indicator))
        );
      }
    },
    [selectedIndicators, mode]
  );

  // Función para manejar la selección de modificadores
  const handleModifierSelect = useCallback(
    (
      type: string,
      value: string | { type: "variable"; key: string },
      isChecked: boolean
    ) => {
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
      if (typeof indicator === "object" && indicator.type === "variable")
        return;
      if (typeof indicator !== "string") return;
      const requiredModifiers =
        IndicatorMetadata[indicator]?.requiredModifiers || [];
      const missingModifiers = requiredModifiers.filter(
        (modifier) =>
          !selectedModifiers[modifier] ||
          selectedModifiers[modifier].length === 0
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

  // Obtener datos del dashboard y widgets
  const { dashboard, widgets: allWidgets } = useGridStore();

  // Función para obtener variables que pueden ser seteadas por widgets del dashboard
  const getSetteableVariables = useCallback((widgets: Widget[]): string[] => {
    const setteableVars = new Set<string>();

    widgets.forEach((widget) => {
      widget.events?.forEach((event) => {
        if (event.trigger === "click" && event.setVariables) {
          Object.keys(event.setVariables).forEach((varKey) => {
            setteableVars.add(varKey);
          });
        }
      });
    });

    return Array.from(setteableVars);
  }, []);

  // Obtener widgets del dashboard actual y detectar variables seteables
  const setteableVariables = useMemo(() => {
    // Usar siempre currentDashboard
    const activeDashboard = dashboard;

    if (!activeDashboard || !activeDashboard.widgets) {
      return [];
    }

    // Filtrar solo los widgets que pertenecen al dashboard activo
    const dashboardWidgets = Object.values(allWidgets || {}).filter((widget) =>
      activeDashboard.widgets?.includes(widget._id)
    );

    return getSetteableVariables(dashboardWidgets);
  }, [dashboard, allWidgets, getSetteableVariables]);

  // Verificar si una variable específica puede ser seteada por algún widget
  const isVariableSetteable = useCallback(
    (variableType: string): boolean => {
      return setteableVariables.includes(variableType);
    },
    [setteableVariables]
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
      return variableType ? isVariableSetteable(variableType) : false;
    },
    [isVariableSetteable]
  );

  // Verificar si debe mostrar opción dinámica para un selector (indicators, timerange)
  const shouldShowDynamicOptionForSelector = useCallback(
    (selectorType: string): boolean => {
      const variableType =
        SELECTOR_TO_VARIABLE_TYPE_MAP[
          selectorType as keyof typeof SELECTOR_TO_VARIABLE_TYPE_MAP
        ];
      return variableType ? isVariableSetteable(variableType) : false;
    },
    [isVariableSetteable]
  );

  // Verificar si un modificador es compatible con alguno de los indicadores seleccionados
  const isCompatibleModifier = useCallback(
    (modifier: string): boolean => {
      if (selectedIndicators.length === 0) return false;

      // Si hay un indicador dinámico, asumimos compatibilidad para simplificar.
      // La lógica de generación final se encargará de la compatibilidad real.
      const hasDynamicIndicator = selectedIndicators.some(
        (ind) => typeof ind === "object" && ind.type === "variable"
      );
      if (hasDynamicIndicator) return true;

      // Para indicadores estáticos, usar la lógica original
      return selectedIndicators.some(
        (indicator) =>
          typeof indicator === "string" &&
          !indicator.startsWith("var:") &&
          IndicatorMetadata[indicator]?.compatibleModifiers.includes(modifier)
      );
    },
    [selectedIndicators]
  );

  // Determinar si el panel debe ser visible
  const isPanelVisible = useMemo(() => {
    if (activeTab === "indicators" && selectedIndicators.length > 0) {
      const compatibleModifierTypes = ["saleType"];
      return compatibleModifierTypes.some(isCompatibleModifier);
    }

    if (activeTab === "calculations") {
      // Para la pestaña valores, mostrar el panel si hay selecciones de calculation
      // El panel mostrará las opciones de comparación disponibles
      const hasCalculationSelected = selectedModifiers.calculation?.length > 0;
      return hasCalculationSelected;
    }

    return false;
  }, [
    activeTab,
    selectedIndicators,
    selectedModifiers.calculation,
    selectedModifiers.comparison,
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
    getDynamicLabel,
    shouldShowDynamicOption,
    shouldShowDynamicOptionForSelector,
    // Tip dinámico
    showDynamicTip,
    hideDynamicTip,
  };
};
