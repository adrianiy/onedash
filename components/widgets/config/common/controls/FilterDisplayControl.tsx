import React from "react";
import { Icon } from "@/common/Icon";
import { Tooltip } from "react-tooltip";
import type {
  Widget,
  TableWidgetConfig,
  MetricWidgetConfig,
  ChartWidgetConfig,
} from "@/types/widget";

interface FilterDisplayControlProps {
  widget: Widget;
  filterDisplayMode?: "badges" | "info" | "hidden";
  onFilterDisplayModeChange: (mode: "badges" | "info") => void;
  className?: string;
}

// Helper para obtener widgetFilters según el tipo de widget
const getWidgetFilters = (widget: Widget) => {
  const config = widget.config || {};

  switch (widget.type) {
    case "table":
      return (config as TableWidgetConfig).widgetFilters || {};
    case "metric":
      return (config as MetricWidgetConfig).widgetFilters || {};
    case "chart":
      return (config as ChartWidgetConfig).widgetFilters || {};
    default:
      return {};
  }
};

export const FilterDisplayControl: React.FC<FilterDisplayControlProps> = ({
  widget,
  filterDisplayMode,
  onFilterDisplayModeChange,
  className = "",
}) => {
  // Verificar si hay filtros de widget configurados
  const widgetFilters = getWidgetFilters(widget);
  const hasWidgetFilters =
    widgetFilters &&
    ((widgetFilters.products && widgetFilters.products.length > 0) ||
      (widgetFilters.sections && widgetFilters.sections.length > 0) ||
      (widgetFilters.dateRange &&
        (widgetFilters.dateRange.start || widgetFilters.dateRange.end)));

  // Solo renderizar si hay filtros de widget configurados
  if (!hasWidgetFilters) {
    return null;
  }

  return (
    <div
      className={`viz-config-section viz-filters-display ${className}`.trim()}
    >
      <div className="viz-section-header viz-filters-display-header">
        <h3 className="viz-section-title">Visibilidad de Filtros</h3>
        <div className="viz-filters-display-controls">
          <button
            className={`viz-control-btn ${
              filterDisplayMode === "badges" ? "viz-control-btn--active" : ""
            }`}
            onClick={() => onFilterDisplayModeChange("badges")}
            data-tooltip-id="badges-mode-tooltip"
          >
            <Icon name="label" size={16} />
          </button>
          <button
            className={`viz-control-btn ${
              filterDisplayMode === "info" ? "viz-control-btn--active" : ""
            }`}
            onClick={() => onFilterDisplayModeChange("info")}
            data-tooltip-id="info-mode-tooltip"
          >
            <Icon name="filter" size={16} />
          </button>
        </div>
      </div>

      <Tooltip
        id="badges-mode-tooltip"
        content="Mostrar filtros como etiquetas"
      />
      <Tooltip id="info-mode-tooltip" content="Mostrar filtros como iconos" />
    </div>
  );
};
