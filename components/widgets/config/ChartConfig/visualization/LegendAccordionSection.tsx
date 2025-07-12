import React, { useState } from "react";
import { Icon } from "@/common/Icon";
import { Tooltip } from "react-tooltip";
import type { ChartWidget } from "@/types/widget";
import { useWidgetStore } from "@/store/widgetStore";

interface LegendAccordionSectionProps {
  widget: ChartWidget;
  showLegend: boolean;
  legendPosition:
    | {
        vertical: "top" | "center" | "bottom";
        horizontal: "left" | "center" | "right";
      }
    | string;
}

export const LegendAccordionSection: React.FC<LegendAccordionSectionProps> = ({
  widget,
  showLegend,
  legendPosition,
}) => {
  const { updateWidget } = useWidgetStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const visualization = widget.config.visualization || {};

  const handleChangeLegendPosition = (
    vertical: "top" | "center" | "bottom",
    horizontal: "left" | "center" | "right"
  ) => {
    updateWidget(widget._id, {
      config: {
        ...widget.config,
        visualization: {
          ...visualization,
          legendPosition: { vertical, horizontal },
        },
      },
    });
  };

  const handleLegendVerticalChange = (
    vertical: "top" | "center" | "bottom"
  ) => {
    const currentHorizontal =
      typeof legendPosition === "object" ? legendPosition.horizontal : "center";
    handleChangeLegendPosition(vertical, currentHorizontal);
  };

  const handleLegendHorizontalChange = (
    horizontal: "left" | "center" | "right"
  ) => {
    const currentVertical =
      typeof legendPosition === "object" ? legendPosition.vertical : "bottom";
    handleChangeLegendPosition(currentVertical, horizontal);
  };

  const handleLegendOrientationHorizontal = () => {
    updateWidget(widget._id, {
      config: {
        ...widget.config,
        visualization: {
          ...visualization,
          legendOrientation: "horizontal",
        },
      },
    });
  };

  const handleLegendOrientationVertical = () => {
    updateWidget(widget._id, {
      config: {
        ...widget.config,
        visualization: {
          ...visualization,
          legendOrientation: "vertical",
        },
      },
    });
  };

  const getCurrentLegendOrientation = () => {
    return visualization.legendOrientation || "horizontal";
  };

  const generateLegendSummary = () => {
    const vertical =
      typeof legendPosition === "object"
        ? legendPosition.vertical === "top"
          ? "Arriba"
          : legendPosition.vertical === "bottom"
          ? "Abajo"
          : "Centro"
        : legendPosition === "top"
        ? "Arriba"
        : "Abajo";

    const horizontal =
      typeof legendPosition === "object"
        ? legendPosition.horizontal === "left"
          ? "Izquierda"
          : legendPosition.horizontal === "right"
          ? "Derecha"
          : "Centro"
        : legendPosition === "left"
        ? "Izquierda"
        : legendPosition === "right"
        ? "Derecha"
        : "Centro";

    const orientation =
      typeof legendPosition === "object" &&
      (legendPosition.horizontal === "left" ||
        legendPosition.horizontal === "right")
        ? "Vertical"
        : "Horizontal";

    return `${vertical}, ${horizontal}, ${orientation}`;
  };

  if (!showLegend) {
    return null;
  }

  return (
    <div className="viz-config-section viz-legend-position">
      <div
        className="viz-legend-accordion"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="viz-section-header viz-legend-position-header">
          <h3 className="viz-section-title">
            <Icon
              name={isExpanded ? "chevron-down" : "chevron-right"}
              size={16}
            />
            Posicion de Leyenda
          </h3>
          <div className="viz-legend-accordion-summary">
            <span className="viz-legend-summary-text">
              {generateLegendSummary()}
            </span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="viz-legend-accordion-content">
          {/* Seccion: Posicion Vertical */}
          <div className="viz-legend-section">
            <h4 className="viz-legend-section-title">
              <Icon name="move-vertical" size={14} />
              Posicion Vertical
            </h4>
            <div className="viz-legend-section-controls">
              <button
                className={`viz-legend-control-btn ${
                  (typeof legendPosition === "object" &&
                    legendPosition.vertical === "top") ||
                  legendPosition === "top"
                    ? "viz-legend-control-btn--active"
                    : ""
                }`}
                onClick={() => handleLegendVerticalChange("top")}
                data-tooltip-id="legend-vertical-top-tooltip"
              >
                <Icon name="arrow-up" size={16} />
                <span>Arriba</span>
              </button>
              <button
                className={`viz-legend-control-btn ${
                  typeof legendPosition === "object" &&
                  legendPosition.vertical === "center"
                    ? "viz-legend-control-btn--active"
                    : ""
                }`}
                onClick={() => handleLegendVerticalChange("center")}
                data-tooltip-id="legend-vertical-center-tooltip"
              >
                <Icon name="circle" size={16} />
                <span>Centro</span>
              </button>
              <button
                className={`viz-legend-control-btn ${
                  (typeof legendPosition === "object" &&
                    legendPosition.vertical === "bottom") ||
                  legendPosition === "bottom"
                    ? "viz-legend-control-btn--active"
                    : ""
                }`}
                onClick={() => handleLegendVerticalChange("bottom")}
                data-tooltip-id="legend-vertical-bottom-tooltip"
              >
                <Icon name="arrow-down" size={16} />
                <span>Abajo</span>
              </button>
            </div>
          </div>

          {/* Seccion: Posicion Horizontal */}
          <div className="viz-legend-section">
            <h4 className="viz-legend-section-title">
              <Icon name="move-horizontal" size={14} />
              Posicion Horizontal
            </h4>
            <div className="viz-legend-section-controls">
              <button
                className={`viz-legend-control-btn ${
                  (typeof legendPosition === "object" &&
                    legendPosition.horizontal === "left") ||
                  legendPosition === "left"
                    ? "viz-legend-control-btn--active"
                    : ""
                }`}
                onClick={() => handleLegendHorizontalChange("left")}
                data-tooltip-id="legend-horizontal-left-tooltip"
              >
                <Icon name="arrow-left" size={16} />
                <span>Izquierda</span>
              </button>
              <button
                className={`viz-legend-control-btn ${
                  (typeof legendPosition === "object" &&
                    legendPosition.horizontal === "center") ||
                  !legendPosition ||
                  (typeof legendPosition === "string" &&
                    legendPosition !== "left" &&
                    legendPosition !== "right")
                    ? "viz-legend-control-btn--active"
                    : ""
                }`}
                onClick={() => handleLegendHorizontalChange("center")}
                data-tooltip-id="legend-horizontal-center-tooltip"
              >
                <Icon name="circle" size={16} />
                <span>Centro</span>
              </button>
              <button
                className={`viz-legend-control-btn ${
                  (typeof legendPosition === "object" &&
                    legendPosition.horizontal === "right") ||
                  legendPosition === "right"
                    ? "viz-legend-control-btn--active"
                    : ""
                }`}
                onClick={() => handleLegendHorizontalChange("right")}
                data-tooltip-id="legend-horizontal-right-tooltip"
              >
                <Icon name="arrow-right" size={16} />
                <span>Derecha</span>
              </button>
            </div>
          </div>

          {/* Seccion: Alineacion */}
          <div className="viz-legend-section">
            <h4 className="viz-legend-section-title">
              <Icon name="layout-grid" size={14} />
              Alineacion
            </h4>
            <div className="viz-legend-section-controls">
              <button
                className={`viz-legend-control-btn ${
                  getCurrentLegendOrientation() === "horizontal"
                    ? "viz-legend-control-btn--active"
                    : ""
                }`}
                onClick={() => handleLegendOrientationHorizontal()}
                data-tooltip-id="legend-orientation-horizontal-tooltip"
              >
                <Icon name="more-horizontal" size={16} />
                <span>Horizontal</span>
              </button>
              <button
                className={`viz-legend-control-btn ${
                  getCurrentLegendOrientation() === "vertical"
                    ? "viz-legend-control-btn--active"
                    : ""
                }`}
                onClick={() => handleLegendOrientationVertical()}
                data-tooltip-id="legend-orientation-vertical-tooltip"
              >
                <Icon
                  name="more-horizontal"
                  size={16}
                  style={{ transform: "rotate(90deg)" }}
                />
                <span>Vertical</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tooltips */}
      <Tooltip id="legend-vertical-top-tooltip" content="Leyenda arriba" />
      <Tooltip
        id="legend-vertical-center-tooltip"
        content="Leyenda centro vertical"
      />
      <Tooltip id="legend-vertical-bottom-tooltip" content="Leyenda abajo" />
      <Tooltip
        id="legend-horizontal-left-tooltip"
        content="Leyenda izquierda"
      />
      <Tooltip id="legend-horizontal-center-tooltip" content="Leyenda centro" />
      <Tooltip id="legend-horizontal-right-tooltip" content="Leyenda derecha" />
      <Tooltip
        id="legend-orientation-horizontal-tooltip"
        content="Orientacion horizontal"
      />
      <Tooltip
        id="legend-orientation-vertical-tooltip"
        content="Orientacion vertical"
      />
    </div>
  );
};
