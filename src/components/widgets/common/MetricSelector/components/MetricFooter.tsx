import React from "react";
import { Icon } from "../../../../common/Icon";
import { Tooltip } from "react-tooltip";
import type { MetricFooterProps } from "../types";

export const MetricFooter: React.FC<MetricFooterProps> = ({
  showSidebar,
  toggleSidebar,
  generatedMetricsCount,
  isButtonEnabled,
  handleSelect,
  mode,
  generateButtonHelpMessage,
}) => {
  return (
    <div className="metric-selector__footer">
      <button
        className="metric-selector__summary-button"
        onClick={toggleSidebar}
      >
        {showSidebar ? (
          <>
            <Icon name="close" size={12} />
            <span>Ocultar resumen</span>
          </>
        ) : (
          <span>{generatedMetricsCount} métricas seleccionadas</span>
        )}
      </button>

      {mode === "single" ? (
        <button
          className="metric-selector__select-button"
          disabled={!isButtonEnabled}
          onClick={handleSelect}
          data-tooltip-id="metric-button-tooltip"
        >
          Seleccionar
        </button>
      ) : (
        <button
          className="metric-selector__add-button"
          disabled={!isButtonEnabled}
          onClick={handleSelect}
          data-tooltip-id="metric-button-tooltip"
        >
          <Icon name="plus" size={12} />
          <span>Añadir</span>
        </button>
      )}

      {/* Tooltip para el botón deshabilitado */}
      {!isButtonEnabled && (
        <Tooltip
          id="metric-button-tooltip"
          content={generateButtonHelpMessage()}
          place="top"
        />
      )}
    </div>
  );
};

export default MetricFooter;
