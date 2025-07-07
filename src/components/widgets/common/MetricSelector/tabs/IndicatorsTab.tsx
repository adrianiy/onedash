import React from "react";
import type { MetricTabProps } from "../types";
import { CheckboxItem } from "../components/CheckboxItem";
import {
  type IndicatorType,
  IndicatorMetadata,
} from "../../../../../types/metricConfig";
import type { VariableBinding } from "../../../../../types/metricConfig";

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
  // Adaptar selectedIndicators para aceptar string | VariableBinding
  const selectedIndicatorsTyped = selectedIndicators as (
    | string
    | VariableBinding
  )[];
  // Filtrar los indicadores basados en la bรบsqueda
  const filteredIndicators = React.useMemo(() => {
    if (!searchQuery) return Object.keys(IndicatorMetadata);

    return Object.keys(IndicatorMetadata).filter((key) =>
      IndicatorMetadata[key].name
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Handler para el CheckboxItem
  const handleChange = (
    value: string | VariableBinding,
    isChecked: boolean
  ) => {
    if (handleIndicatorSelect) {
      handleIndicatorSelect(value as IndicatorType, isChecked);
    }
  };

  // Verificar si debe mostrar opciรณn dinรกmica
  const showDynamicOption = shouldShowDynamicOptionForSelector
    ? shouldShowDynamicOptionForSelector("indicators")
    : false;

  // Definir el objeto VariableBinding para la opciรณn dinรกmica
  const dynamicIndicator: VariableBinding = {
    type: "variable",
    key: "indicator",
  };

  // Verificar si la opciรณn dinรกmica estรก seleccionada (comparaciรณn por referencia)
  const isDynamicSelected = selectedIndicatorsTyped.some(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      "type" in item &&
      (item as VariableBinding).type === "variable" &&
      (item as VariableBinding).key === "indicator"
  );

  return (
    <div className="metric-selector__tab-content">
      <div className="metric-selector__checkbox-group">
        {/* Opciรณn dinรกmica (primera si existe) */}
        {showDynamicOption && (
          <CheckboxItem
            key="dynamic-indicator"
            label={
              getDynamicLabel
                ? getDynamicLabel("indicators")
                : "Indicador Dinámico"
            }
            value={dynamicIndicator}
            checked={isDynamicSelected}
            onChange={handleChange}
            mode={mode}
            radioGroupName="metric-selector-indicators"
            icon="zap"
            iconColor="#10b981"
            isDynamic={true}
          />
        )}

        {/* Indicadores estรกticos */}
        {filteredIndicators.map((indicator) => (
          <CheckboxItem
            key={indicator}
            label={IndicatorMetadata[indicator].name}
            value={indicator}
            checked={selectedIndicatorsTyped.includes(indicator)}
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
