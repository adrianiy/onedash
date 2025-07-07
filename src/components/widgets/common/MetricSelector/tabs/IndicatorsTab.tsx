import React from "react";
import type { MetricTabProps } from "../types";
import { CheckboxItem } from "../components/CheckboxItem";
import {
  type IndicatorType,
  IndicatorMetadata,
} from "../../../../../types/metricConfig";

interface ExtendedMetricTabProps extends MetricTabProps {
  shouldShowDynamicOptionForSelector?: (selectorType: string) => boolean;
  getDynamicLabel?: (context: string) => string;
}

export const IndicatorsTab: React.FC<ExtendedMetricTabProps> = ({
  searchQuery,
  selectedIndicators,
  mode,
  handleIndicatorSelect,
  shouldShowDynamicOptionForSelector,
  getDynamicLabel,
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

  // Verificar si debe mostrar opción dinámica
  const showDynamicOption = shouldShowDynamicOptionForSelector
    ? shouldShowDynamicOptionForSelector("indicators")
    : false;

  // Verificar si la opción dinámica está seleccionada
  const isDynamicSelected = selectedIndicators.includes(
    "{{dynamic}}" as IndicatorType
  );

  return (
    <div className="metric-selector__tab-content">
      <div className="metric-selector__checkbox-group">
        {/* Opción dinámica (primera si existe) */}
        {showDynamicOption && (
          <CheckboxItem
            key="dynamic-indicator"
            label={
              getDynamicLabel
                ? getDynamicLabel("indicators")
                : "Indicador Dinámico"
            }
            value="{{dynamic}}"
            checked={isDynamicSelected}
            onChange={handleChange}
            mode={mode}
            radioGroupName="metric-selector-indicators"
            icon="zap"
            iconColor="#10b981"
            isDynamic={true}
          />
        )}

        {/* Indicadores estáticos */}
        {filteredIndicators.map((indicator) => (
          <CheckboxItem
            key={indicator}
            label={IndicatorMetadata[indicator].name}
            value={indicator}
            checked={selectedIndicators.includes(indicator as IndicatorType)}
            onChange={handleChange}
            mode={mode}
            radioGroupName="metric-selector-indicators"
          />
        ))}
      </div>
    </div>
  );
};

export default IndicatorsTab;
