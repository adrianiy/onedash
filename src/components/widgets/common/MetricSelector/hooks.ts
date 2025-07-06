import { useState, useMemo, useCallback } from "react";
import type {
  IndicatorType,
  MetricDefinition,
} from "../../../../types/metricConfig";
import {
  IndicatorMetadata,
  ModifiersMetadata,
} from "../../../../types/metricConfig";
import { useMetricGeneration } from "../../../../hooks/useMetricGeneration";
import type { SelectedModifiers } from "./types";

/**
 * Hook personalizado para gestionar las funcionalidades del MetricSelector
 */
export const useMetricSelector = (
  mode: "single" | "multiple",
  initialTab = "indicators"
) => {
  // Estado para las pestañas
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Estado para la búsqueda
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Estado para mostrar/ocultar el sidebar con el resumen
  const [showSidebar, setShowSidebar] = useState<boolean>(false);

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

  // Verificar si un modificador es compatible con alguno de los indicadores seleccionados
  const isCompatibleModifier = useCallback(
    (modifier: string): boolean => {
      // El modificador es compatible si al menos uno de los indicadores seleccionados lo soporta
      return selectedIndicators.some((indicator) =>
        IndicatorMetadata[indicator]?.compatibleModifiers.includes(modifier)
      );
    },
    [selectedIndicators]
  );

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

  // Determinar si el panel debe ser visible (para indicadores o temporalidades)
  const isPanelVisible = useMemo(
    () =>
      (activeTab === "indicators" && selectedIndicators.length > 0) ||
      (activeTab === "timerange" && selectedModifiers.timeframe.length > 0),
    [activeTab, selectedIndicators.length, selectedModifiers.timeframe.length]
  );

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
  };
};
