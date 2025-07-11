import React from "react";
import type { MetricTabProps } from "../types";
import { CheckboxItem } from "@/components/widgets/config/common/MetricSelector/components/CheckboxItem";
import { ModifiersMetadata } from "@/types/metricConfig";

export const TimerangeTab: React.FC<MetricTabProps> = ({
  searchQuery,
  selectedModifiers,
  mode,
  handleModifierSelect,
  willApplyDefaultValue,
  getDefaultValue,
}) => {
  // Filtrar las opciones de modificadores basadas en la búsqueda
  const getFilteredModifierOptions = React.useCallback(() => {
    if (!searchQuery) return ModifiersMetadata.timeframe.options;

    return ModifiersMetadata.timeframe.options.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Handler para el CheckboxItem
  const handleChange = (
    value: string | { type: "variable"; key: string },
    isChecked: boolean
  ) => {
    if (handleModifierSelect && typeof value === "string") {
      handleModifierSelect("timeframe", value, isChecked);
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
            checked={
              selectedModifiers.timeframe?.includes(option.value) || false
            }
            onChange={handleChange}
            mode={mode}
            radioGroupName="metric-selector-timeframe"
            hasDefaultTip={
              willApplyDefaultValue &&
              willApplyDefaultValue("timeframe") &&
              getDefaultValue &&
              option.value === getDefaultValue("timeframe")
            }
          />
        ))}
      </div>
    </div>
  );
};

export default TimerangeTab;
