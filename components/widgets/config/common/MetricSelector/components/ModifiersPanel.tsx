import React from "react";
import type { MetricModifiersPanelProps } from "../types";
import { CheckboxItem } from "./CheckboxItem";
import {
  ModifiersMetadata,
  type VariableBinding,
} from "@/types/metricConfig";

/**
 * Panel lateral para la selección de modificadores en indicadores y temporalidad
 */
export const ModifiersPanel: React.FC<MetricModifiersPanelProps> = ({
  activeTab,
  selectedModifiers,
  isCompatibleModifier,
  isStrictlyRequired,
  handleModifierSelect,
  mode,
  customValues,
  handleCustomValueChange,
  willApplyDefaultValue,
  getDefaultValue,
  shouldShowDynamicOption,
  getDynamicLabel,
}) => {
  // Handler para el CheckboxItem
  const handleChange = (
    type: string,
    value: string | VariableBinding,
    isChecked: boolean
  ) => {
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
                  (selectedModifiers.saleType?.length || 0) === 0 && (
                    <span className="metric-selector__required-indicator">
                      *
                    </span>
                  )}
              </h4>
              <div className="metric-selector__checkbox-group">
                {/* Opción dinámica para saleType */}
                {shouldShowDynamicOption &&
                  shouldShowDynamicOption("saleType") && (
                    <CheckboxItem
                      key="dynamic-saleType"
                      label={
                        getDynamicLabel
                          ? getDynamicLabel("saleType")
                          : "Tipo de Venta Dinámico"
                      }
                      value={{ type: "variable", key: "saleType" }}
                      checked={
                        selectedModifiers.saleType?.some(
                          (item) =>
                            typeof item === "object" &&
                            item !== null &&
                            "type" in item &&
                            (item as VariableBinding).type === "variable" &&
                            (item as VariableBinding).key === "saleType"
                        ) || false
                      }
                      onChange={(value, isChecked) =>
                        handleChange("saleType", value, isChecked)
                      }
                      mode={mode}
                      radioGroupName="metric-selector-saleType"
                      icon="zap"
                      iconColor="#10b981"
                      isDynamic={true}
                    />
                  )}

                {/* Opciones estáticas para saleType */}
                {ModifiersMetadata.saleType.options.map((option) => (
                  <CheckboxItem
                    key={option.value}
                    label={option.label}
                    value={option.value}
                    checked={
                      selectedModifiers.saleType?.includes(option.value) ||
                      false
                    }
                    onChange={(value, isChecked) =>
                      handleChange("saleType", value, isChecked)
                    }
                    mode={mode}
                    radioGroupName="metric-selector-saleType"
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
                  (selectedModifiers.scope?.length || 0) === 0 && (
                    <span className="metric-selector__required-indicator">
                      *
                    </span>
                  )}
              </h4>
              <div className="metric-selector__checkbox-group">
                {/* Opción dinámica para scope */}
                {shouldShowDynamicOption &&
                  shouldShowDynamicOption("scope") && (
                    <CheckboxItem
                      key="dynamic-scope"
                      label={
                        getDynamicLabel
                          ? getDynamicLabel("scope")
                          : "Tiendas Dinámico"
                      }
                      value={{ type: "variable", key: "scope" }}
                      checked={
                        selectedModifiers.scope?.some(
                          (item) =>
                            typeof item === "object" &&
                            item !== null &&
                            "type" in item &&
                            (item as VariableBinding).type === "variable" &&
                            (item as VariableBinding).key === "scope"
                        ) || false
                      }
                      onChange={(value, isChecked) =>
                        handleChange("scope", value, isChecked)
                      }
                      mode={mode}
                      radioGroupName="metric-selector-scope"
                      icon="zap"
                      iconColor="#10b981"
                      isDynamic={true}
                    />
                  )}

                {/* Opciones estáticas para scope */}
                {ModifiersMetadata.scope.options.map((option) => (
                  <CheckboxItem
                    key={option.value}
                    label={option.label}
                    value={option.value}
                    checked={
                      selectedModifiers.scope?.includes(option.value) || false
                    }
                    onChange={(value, isChecked) =>
                      handleChange("scope", value, isChecked)
                    }
                    mode={mode}
                    radioGroupName="metric-selector-scope"
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

      {/* Panel de modificadores para valores (calculations) */}
      {activeTab === "calculations" && (
        <div className="metric-selector__modifiers-section">
          <h4>{ModifiersMetadata.comparison.name}</h4>
          <div className="metric-selector__checkbox-group">
            {ModifiersMetadata.comparison.options.map((option) => (
              <div key={option.value}>
                <CheckboxItem
                  label={option.label}
                  value={option.value}
                  checked={
                    selectedModifiers.comparison?.includes(option.value) ||
                    false
                  }
                  onChange={(value, isChecked) =>
                    handleChange("comparison", value, isChecked)
                  }
                  mode={mode}
                  radioGroupName="metric-selector-comparison"
                  hasDefaultTip={
                    willApplyDefaultValue("comparison") &&
                    option.value === getDefaultValue("comparison")
                  }
                />

                {/* Campo de entrada para A-N cuando está seleccionado */}
                {option.requiresInput &&
                  option.value === "a-n" &&
                  selectedModifiers.comparison?.includes("a-n") && (
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
