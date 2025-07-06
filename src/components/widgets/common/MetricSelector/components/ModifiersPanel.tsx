import React from "react";
import type { MetricModifiersPanelProps } from "../types";
import { CheckboxItem } from "./CheckboxItem";
import { ModifiersMetadata } from "../../../../../types/metricConfig";

/**
 * Panel lateral para la selección de modificadores en indicadores y temporalidad
 */
export const ModifiersPanel: React.FC<MetricModifiersPanelProps> = ({
  activeTab,
  selectedIndicators,
  selectedModifiers,
  isCompatibleModifier,
  isStrictlyRequired,
  handleModifierSelect,
  mode,
  customValues,
  handleCustomValueChange,
  willApplyDefaultValue,
  getDefaultValue,
}) => {
  // Handler para el CheckboxItem
  const handleChange = (type: string, value: string, isChecked: boolean) => {
    handleModifierSelect(type, value, isChecked);
  };

  return (
    <div className="metric-selector__modifiers-panel">
      {/* Panel de modificadores para Indicadores */}
      {activeTab === "indicators" && (
        <>
          {/* Sección de Tipo de Venta */}
          {isCompatibleModifier("saleType") && (
            <div className="metric-selector__modifiers-section">
              <h4>
                {ModifiersMetadata.saleType.name}
                {isStrictlyRequired("saleType") &&
                  selectedModifiers.saleType.length === 0 && (
                    <span className="metric-selector__required-indicator">
                      *
                    </span>
                  )}
              </h4>
              <div className="metric-selector__checkbox-group">
                {ModifiersMetadata.saleType.options.map((option) => (
                  <CheckboxItem
                    key={option.value}
                    label={option.label}
                    value={option.value}
                    checked={selectedModifiers.saleType.includes(option.value)}
                    onChange={(value, isChecked) =>
                      handleChange("saleType", value, isChecked)
                    }
                    disabled={
                      mode === "single" &&
                      selectedModifiers.saleType.length > 0 &&
                      !selectedModifiers.saleType.includes(option.value)
                    }
                    hasDefaultTip={
                      willApplyDefaultValue("saleType") &&
                      option.value === getDefaultValue("saleType")
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sección de Alcance */}
          {isCompatibleModifier("scope") && (
            <div className="metric-selector__modifiers-section">
              <h4>
                {ModifiersMetadata.scope.name}
                {isStrictlyRequired("scope") &&
                  selectedModifiers.scope.length === 0 && (
                    <span className="metric-selector__required-indicator">
                      *
                    </span>
                  )}
              </h4>
              <div className="metric-selector__checkbox-group">
                {ModifiersMetadata.scope.options.map((option) => (
                  <CheckboxItem
                    key={option.value}
                    label={option.label}
                    value={option.value}
                    checked={selectedModifiers.scope.includes(option.value)}
                    onChange={(value, isChecked) =>
                      handleChange("scope", value, isChecked)
                    }
                    disabled={
                      mode === "single" &&
                      selectedModifiers.scope.length > 0 &&
                      !selectedModifiers.scope.includes(option.value)
                    }
                    hasDefaultTip={
                      willApplyDefaultValue("scope") &&
                      option.value === getDefaultValue("scope")
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Panel de modificadores para temporalidades */}
      {activeTab === "timerange" && (
        <div className="metric-selector__modifiers-section">
          <h4>{ModifiersMetadata.comparison.name}</h4>
          <div className="metric-selector__checkbox-group">
            {ModifiersMetadata.comparison.options.map((option) => (
              <div key={option.value}>
                <CheckboxItem
                  label={option.label}
                  value={option.value}
                  checked={selectedModifiers.comparison.includes(option.value)}
                  onChange={(value, isChecked) =>
                    handleChange("comparison", value, isChecked)
                  }
                  disabled={
                    mode === "single" &&
                    selectedModifiers.comparison.length > 0 &&
                    !selectedModifiers.comparison.includes(option.value)
                  }
                  hasDefaultTip={
                    willApplyDefaultValue("comparison") &&
                    option.value === getDefaultValue("comparison")
                  }
                />

                {/* Campo de entrada para A-N cuando está seleccionado */}
                {option.requiresInput &&
                  option.value === "a-n" &&
                  selectedModifiers.comparison.includes("a-n") && (
                    <input
                      type="number"
                      value={customValues["comparison_a_n_value"] as number}
                      onChange={(e) =>
                        handleCustomValueChange(
                          "comparison_a_n_value",
                          parseInt(e.target.value)
                        )
                      }
                      className="metric-selector__custom-input"
                      min={1}
                      max={20}
                    />
                  )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModifiersPanel;
