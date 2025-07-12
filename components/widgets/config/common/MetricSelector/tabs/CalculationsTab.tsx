import React from "react";
import type { MetricTabProps } from "../types";
import { CheckboxItem } from "@/components/widgets/config/common/MetricSelector/components/CheckboxItem";
import { ModifiersMetadata } from "@/types/metricConfig";

export const CalculationsTab: React.FC<MetricTabProps> = ({
  searchQuery,
  selectedModifiers,
  mode,
  handleModifierSelect,
  willApplyDefaultValue,
  getDefaultValue,
}) => {
  // Filtrar las opciones de modificadores basadas en la búsqueda para cálculos
  const getFilteredCalculationOptions = React.useCallback(() => {
    if (!searchQuery) return ModifiersMetadata.calculation.options;

    return ModifiersMetadata.calculation.options.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Handler para el CheckboxItem de cálculos
  const handleCalculationChange = (
    value: string | { type: "variable"; key: string },
    isChecked: boolean
  ) => {
    if (handleModifierSelect && typeof value === "string") {
      handleModifierSelect("calculation", value, isChecked);
    }
  };

  return (
    <div className="metric-selector__tab-content">
      {/* Solo la sección de Cálculos - las comparaciones van en el panel lateral */}
      <div className="metric-selector__checkbox-group">
        {getFilteredCalculationOptions().map((option) => (
          <CheckboxItem
            key={option.value}
            label={option.label}
            value={option.value}
            checked={
              selectedModifiers.calculation?.includes(option.value) || false
            }
            onChange={handleCalculationChange}
            mode={mode}
            radioGroupName="metric-selector-calculation"
            hasDefaultTip={
              willApplyDefaultValue &&
              willApplyDefaultValue("calculation") &&
              getDefaultValue &&
              option.value === getDefaultValue("calculation")
            }
            defaultTipText="Valor por defecto"
          />
        ))}
      </div>
    </div>
  );
};

export default CalculationsTab;
