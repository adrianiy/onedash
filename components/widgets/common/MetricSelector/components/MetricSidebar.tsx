import React from "react";
import type { MetricSidebarProps } from "../types";
import { Icon } from "../../../../common/Icon";
import {
  IndicatorMetadata,
  type MetricDefinition,
} from "../../../../../types/metricConfig";
import { useVariableStore } from "../../../../../store/variableStore";
import { resolveRecursively } from "../../../../../utils/variableResolver";

/**
 * Sidebar lateral que muestra el resumen de métricas seleccionadas
 */
export const MetricSidebar: React.FC<MetricSidebarProps> = ({
  toggleSidebar,
  generatedMetrics,
  selectedIndicators,
  getMissingRequiredModifiers,
  getModifierLabel,
}) => {
  const { variables } = useVariableStore();

  // Función para determinar si un valor es dinámico
  const isDynamic = (value: unknown) =>
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    value.type === "variable";

  // Función para obtener el valor resuelto de una variable
  const getResolvedValue = (value: unknown) => {
    if (isDynamic(value)) {
      const resolved = resolveRecursively(value, variables);
      return resolved !== undefined && resolved !== null
        ? String(resolved)
        : null;
    }
    return null;
  };

  // Función para renderizar el título de la métrica con valores dinámicos resueltos
  const renderMetricTitle = (metric: MetricDefinition) => {
    // Si el indicador es dinámico, mostrar su valor resuelto
    if (isDynamic(metric.indicator)) {
      const resolvedIndicator = getResolvedValue(metric.indicator);
      if (resolvedIndicator) {
        return (
          <span className="metric-selector__chip-title-dynamic">
            <Icon
              name="zap"
              size={12}
              className="metric-selector__dynamic-icon"
            />
            {resolvedIndicator}
          </span>
        );
      }
    }

    // Si no es dinámico o no se pudo resolver, usar el título original
    return metric.title;
  };

  // Función para renderizar un modificador con valor dinámico resuelto
  const renderModifierTag = (
    metricId: string,
    modKey: string,
    modValue: unknown
  ) => {
    if (isDynamic(modValue)) {
      const resolvedValue = getResolvedValue(modValue);
      if (resolvedValue) {
        return (
          <span
            className={`metric-selector__chip-tag metric-selector__chip-tag--${modKey} metric-selector__chip-tag--dynamic`}
            key={`${metricId}-${modKey}`}
          >
            <Icon
              name="zap"
              size={10}
              className="metric-selector__dynamic-icon"
            />
            {resolvedValue}
          </span>
        );
      }
    }

    // Si no es dinámico, usar la función de etiqueta original
    return (
      <span
        className={`metric-selector__chip-tag metric-selector__chip-tag--${modKey}`}
        key={`${metricId}-${modKey}`}
      >
        {getModifierLabel(modKey, modValue)}
      </span>
    );
  };
  return (
    <div className="metric-selector__sidebar">
      <div className="metric-selector__sidebar-header">
        <h3>Resumen de métricas</h3>
        <button
          className="metric-selector__close-button"
          onClick={toggleSidebar}
        >
          <Icon name="close" size={16} />
        </button>
      </div>

      {generatedMetrics.length === 0 ? (
        <div className="metric-selector__empty-state">
          <p className="metric-selector__no-selections">
            No hay métricas seleccionadas
          </p>
          {selectedIndicators.length > 0 ? (
            <div className="metric-selector__requirements-info">
              <p className="metric-selector__empty-hint">
                Para generar métricas, completa los modificadores requeridos:
              </p>
              <ul className="metric-selector__requirements-list">
                {selectedIndicators.map((indicator) => {
                  const missingMods = getMissingRequiredModifiers(indicator);
                  const indicatorKey =
                    typeof indicator === "string" ? indicator : indicator.key;
                  const indicatorName =
                    typeof indicator === "string"
                      ? IndicatorMetadata[indicator]?.name || indicator
                      : `Variable (${indicator.key})`;

                  return missingMods.length > 0 ? (
                    <li
                      key={indicatorKey}
                      className="metric-selector__requirement-item"
                    >
                      {indicatorName} requiere: {missingMods.join(", ")}
                    </li>
                  ) : null;
                })}
              </ul>
            </div>
          ) : (
            <p className="metric-selector__empty-hint">
              Selecciona indicadores y sus modificadores para crear métricas
            </p>
          )}
        </div>
      ) : (
        <div className="metric-selector__sidebar-content">
          {/* Resumen estadístico superior - STICKY */}
          <div className="metric-selector__summary-stats-sticky">
            <div className="metric-selector__summary-stats">
              <div className="metric-selector__stat-item">
                <span className="metric-selector__stat-value">
                  {generatedMetrics.length}
                </span>
                <span className="metric-selector__stat-label">
                  Métricas seleccionadas
                </span>
              </div>
            </div>
          </div>

          {/* Lista de métricas como chips */}
          <div className="metric-selector__chips-container">
            {generatedMetrics.map((metric) => (
              <div className="metric-selector__chip" key={metric.id}>
                {/* Título completo de la métrica */}
                <div className="metric-selector__chip-title">
                  {renderMetricTitle(metric)}
                </div>
                <div className="metric-selector__chip-modifiers">
                  {Object.entries(metric.modifiers).map(([modKey, modValue]) =>
                    modValue
                      ? renderModifierTag(metric.id, modKey, modValue)
                      : null
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricSidebar;
