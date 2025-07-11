import React from "react";
import type { TabsListProps } from "../types";

/**
 * Componente que muestra las pestañas del selector de métricas
 */
export const TabsList: React.FC<TabsListProps> = ({
  activeTab,
  setActiveTab,
  indicatorsCount,
  timerangeCount,
  calculationsCount,
  isTabRequired,
  isTabComplete,
}) => {
  return (
    <div className="metric-selector__tabs">
      <div className="metric-selector__tab-list">
        <button
          className={`metric-selector__tab ${
            activeTab === "indicators" ? "metric-selector__tab--active" : ""
          }`}
          onClick={() => setActiveTab("indicators")}
        >
          <span className="metric-selector__tab-label">
            Indicadores
            {isTabRequired("indicators") && !isTabComplete("indicators") && (
              <span className="metric-selector__required-indicator">*</span>
            )}
          </span>
          <span className="metric-selector__tab-counter">
            {indicatorsCount}
          </span>
        </button>
        <button
          className={`metric-selector__tab ${
            activeTab === "timerange" ? "metric-selector__tab--active" : ""
          }`}
          onClick={() => setActiveTab("timerange")}
        >
          <span className="metric-selector__tab-label">Temporalidad</span>
          <span className="metric-selector__tab-counter">{timerangeCount}</span>
        </button>
        <button
          className={`metric-selector__tab ${
            activeTab === "calculations" ? "metric-selector__tab--active" : ""
          }`}
          onClick={() => setActiveTab("calculations")}
        >
          <span className="metric-selector__tab-label">Valores</span>
          <span className="metric-selector__tab-counter">
            {calculationsCount}
          </span>
        </button>
      </div>
    </div>
  );
};

export default TabsList;
