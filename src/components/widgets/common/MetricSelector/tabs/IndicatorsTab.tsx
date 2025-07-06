import React from "react";
import type { MetricTabProps } from "../types";
import { CheckboxItem } from "../components/CheckboxItem";
import {
  type IndicatorType,
  IndicatorMetadata,
} from "../../../../../types/metricConfig";

export const IndicatorsTab: React.FC<MetricTabProps> = ({
  searchQuery,
  selectedIndicators,
  selectedModifiers,
  mode,
  handleIndicatorSelect,
}) => {
  // Filtrar los indicadores basados en la búsqueda
  const filteredIndicators = React.useMemo(() => {
    if (!searchQuery) return Object.keys(IndicatorMetadata);

    return Object.keys(IndicatorMetadata).filter((key) =>
      IndicatorMetadata[key].name
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Handler para el CheckboxItem
  const handleChange = (value: string, isChecked: boolean) => {
    if (handleIndicatorSelect) {
      handleIndicatorSelect(value as IndicatorType, isChecked);
    }
  };

  return (
    <div className="metric-selector__tab-content">
      <div className="metric-selector__checkbox-group">
        {filteredIndicators.map((indicator) => (
          <CheckboxItem
            key={indicator}
            label={IndicatorMetadata[indicator].name}
            value={indicator}
            checked={selectedIndicators.includes(indicator as IndicatorType)}
            onChange={handleChange}
            disabled={
              mode === "single" &&
              selectedIndicators.length > 0 &&
              !selectedIndicators.includes(indicator as IndicatorType)
            }
          />
        ))}
      </div>
    </div>
  );
};

export default IndicatorsTab;
