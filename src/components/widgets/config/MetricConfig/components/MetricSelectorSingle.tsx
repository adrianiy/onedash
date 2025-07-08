import React, { useRef } from "react";
import type { MetricDefinition } from "../../../../../types/metricConfig";
import MetricSelector from "../../../common/MetricSelector/MetricSelector";
import { ConfigDropdown } from "../../../common/ConfigDropdown";
import { Icon } from "../../../../common/Icon";
import { Tooltip } from "react-tooltip";

interface MetricSelectorSingleProps {
  value?: MetricDefinition;
  onChange: (metric: MetricDefinition | undefined) => void;
  placeholder?: string;
}

export const MetricSelectorSingle: React.FC<MetricSelectorSingleProps> = ({
  value,
  onChange,
  placeholder = "Seleccionar métrica",
}) => {
  const setDropdownOpenRef = useRef<((isOpen: boolean) => void) | null>(null);

  const handleMetricSelect = (metric: MetricDefinition) => {
    onChange(metric);
    // Cerrar el dropdown
    if (setDropdownOpenRef.current) {
      setDropdownOpenRef.current(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  };

  return (
    <ConfigDropdown
      className="metric-selector-single"
      setIsOpenRef={setDropdownOpenRef}
      triggerElement={({ ref, onClick, referenceProps }) => (
        <button
          ref={ref}
          className={`metric-selector-single__trigger ${
            value ? "metric-selector-single__trigger--selected" : ""
          }`}
          onClick={onClick}
          type="button"
          {...referenceProps}
        >
          <div className="metric-selector-single__content">
            {value ? (
              <span className="metric-selector-single__selected">
                {value.title}
              </span>
            ) : (
              <span className="metric-selector-single__placeholder">
                {placeholder}
              </span>
            )}
          </div>
          <div className="metric-selector-single__actions">
            {value && (
              <button
                type="button"
                className="metric-selector-single__clear"
                onClick={handleClear}
                data-tooltip-id="metric-selector-clear-tooltip"
                data-tooltip-content="Limpiar selección"
              >
                <Icon name="close" size={14} />
              </button>
            )}
            <Icon
              name="chevron-down"
              size={14}
              className="metric-selector-single__chevron"
            />
          </div>
        </button>
      )}
    >
      <MetricSelector
        mode="single"
        selectedMetric={value}
        onSelectMetric={handleMetricSelect}
        onClose={() =>
          setDropdownOpenRef.current && setDropdownOpenRef.current(false)
        }
      />

      {/* Tooltip */}
      <Tooltip id="metric-selector-clear-tooltip" place="top" />
    </ConfigDropdown>
  );
};
