import React from "react";
import { VisualizationToggleButton } from "./VisualizationToggleButton";
import type { TableWidget } from "@/types/widget";
import { useWidgetStore } from "@/store/widgetStore";

interface TableAlignmentSectionProps {
  widget: TableWidget;
  textAlign: "left" | "center" | "right";
}

export const TableAlignmentSection: React.FC<TableAlignmentSectionProps> = ({
  widget,
  textAlign,
}) => {
  const { updateWidget } = useWidgetStore();

  const handleChangeAlignment = (alignment: "left" | "center" | "right") => {
    const visualization = widget.config.visualization || {};
    updateWidget(widget._id, {
      config: {
        ...widget.config,
        visualization: {
          ...visualization,
          textAlign: alignment,
        },
      },
    });
  };

  return (
    <div className="viz-alignment-controls">
      <VisualizationToggleButton
        isActive={textAlign === "left"}
        onClick={() => handleChangeAlignment("left")}
        icon="align-left"
        tooltipId="align-left-tooltip"
        tooltipContent="Alinear a la izquierda"
      />
      <VisualizationToggleButton
        isActive={textAlign === "center"}
        onClick={() => handleChangeAlignment("center")}
        icon="align-center"
        tooltipId="align-center-tooltip"
        tooltipContent="Centrar"
      />
      <VisualizationToggleButton
        isActive={textAlign === "right"}
        onClick={() => handleChangeAlignment("right")}
        icon="align-right"
        tooltipId="align-right-tooltip"
        tooltipContent="Alinear a la derecha"
      />
    </div>
  );
};
