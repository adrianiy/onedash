import React from "react";
import type { MetricTabProps } from "../types";
import { CheckboxItem } from "../components/CheckboxItem";
import { ModifiersMetadata } from "../../../../../types/metricConfig";

export const CalculationsTab: React.FC<MetricTabProps> = ({
  searchQuery,
  selectedModifiers,
  mode,
  handleModifierSelect,
  willApplyDefaultValue,
  getDefaultValue,
}) => {
  // Filtrar las opciones de modificadores basadas en la búsqueda
  const getFilteredModifierOptions = React.useCallback(() => {
    if (!searchQuery) return ModifiersMetadata.calculation.options;

    return ModifiersMetadata.calculation.options.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Handler para el CheckboxItem
  const handleChange = (value: string, isChecked: boolean) => {
    if (handleModifierSelect) {
      handleModifierSelect("calculation", value, isChecked);
    }
  };

  return (
    <div className="metric-selector__tab-content">
      <div className="metric-selector__checkbox-group">
        {getFilteredModifierOptions().map((option) => (
          <CheckboxItem
            key={option.value}
            label={option.label}
            value={option.value}
            checked={selectedModifiers.calculation.includes(option.value)}
            onChange={handleChange}
            disabled={
              mode === "single" &&
              selectedModifiers.calculation.length > 0 &&
              !selectedModifiers.calculation.includes(option.value)
            }
            hasDefaultTip={
              willApplyDefaultValue &&
              willApplyDefaultValue("calculation") &&
              getDefaultValue &&
              option.value === getDefaultValue("calculation")
            }
          />
        ))}
      </div>
    </div>
  );
};

export default CalculationsTab;
