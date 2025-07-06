import React from "react";
import type { MetricSidebarProps } from "../types";
import { Icon } from "../../../../common/Icon";
import { IndicatorMetadata } from "../../../../../types/metricConfig";

/**
 * Sidebar lateral que muestra el resumen de métricas seleccionadas
 */
export const MetricSidebar: React.FC<MetricSidebarProps> = ({
  showSidebar,
  toggleSidebar,
  generatedMetrics,
  selectedIndicators,
  getMissingRequiredModifiers,
  getModifierLabel,
}) => {
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
                  return missingMods.length > 0 ? (
                    <li
                      key={indicator}
                      className="metric-selector__requirement-item"
                    >
                      {IndicatorMetadata[indicator].name} requiere:{" "}
                      {missingMods.join(", ")}
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
                  {metric.title}
                </div>
                <div className="metric-selector__chip-modifiers">
                  {Object.entries(metric.modifiers).map(([modKey, modValue]) =>
                    modValue ? (
                      <span
                        className={`metric-selector__chip-tag metric-selector__chip-tag--${modKey}`}
                        key={`${metric.id}-${modKey}`}
                      >
                        {getModifierLabel(modKey, modValue)}
                      </span>
                    ) : null
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
