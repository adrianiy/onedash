import { useWidgetStore } from "@/store/widgetStore";
import type { ChartWidget } from "@/types/widget";
import { VisualizationToggleButton } from "@/widgets/config/common/controls/VisualizationToggleButton";
import React from "react";

interface ChartTypeSectionProps {
  widget: ChartWidget;
  chartOrientation: "horizontal" | "vertical";
}

export const ChartTypeSection: React.FC<ChartTypeSectionProps> = ({
  widget,
  chartOrientation,
}) => {
  const { updateWidget } = useWidgetStore();

  const handleChangeOrientation = (orientation: "horizontal" | "vertical") => {
    const visualization = widget.config.visualization || {};
    updateWidget(widget._id, {
      config: {
        ...widget.config,
        visualization: {
          ...visualization,
          chartOrientation: orientation,
        },
      },
    });
  };

  return (
    <div className="viz-config-section viz-chart-type">
      <div className="viz-section-header viz-chart-type-header">
        <h3 className="viz-section-title">Tipo de Grafico</h3>
        <div className="viz-chart-type-controls">
          <VisualizationToggleButton
            isActive={chartOrientation === "vertical"}
            onClick={() => handleChangeOrientation("vertical")}
            icon="bar-chart-3"
            tooltipId="columns-tooltip"
            tooltipContent="Grafico de columnas"
          />
          <VisualizationToggleButton
            isActive={chartOrientation === "horizontal"}
            onClick={() => handleChangeOrientation("horizontal")}
            icon="chart-bar-decreasing"
            tooltipId="bars-tooltip"
            tooltipContent="Grafico de barras"
          />
        </div>
      </div>
    </div>
  );
};
