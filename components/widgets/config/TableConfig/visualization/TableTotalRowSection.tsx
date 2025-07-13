import React from "react";
import { VisualizationToggleButton } from "../../common/controls/VisualizationToggleButton";
import type { TableWidget } from "@/types/widget";
import { useGridStore } from "@/store/gridStore";

interface TableTotalRowSectionProps {
  widget: TableWidget;
  totalRow: "top" | "bottom" | "none";
}

export const TableTotalRowSection: React.FC<TableTotalRowSectionProps> = ({
  widget,
  totalRow,
}) => {
  const { updateWidget } = useGridStore();

  const handleChangeTotalRow = (position: "top" | "bottom" | "none") => {
    const visualization = widget.config.visualization || {};
    updateWidget(widget._id, {
      config: {
        ...widget.config,
        visualization: {
          ...visualization,
          totalRow: position,
        },
      },
    });
  };

  const handleToggleTotalTop = () => {
    const newPosition = totalRow === "top" ? "none" : "top";
    handleChangeTotalRow(newPosition);
  };

  const handleToggleTotalBottom = () => {
    const newPosition = totalRow === "bottom" ? "none" : "bottom";
    handleChangeTotalRow(newPosition);
  };

  return (
    <div className="viz-config-section viz-total-row">
      <div className="viz-section-header viz-total-row-header">
        <h3 className="viz-section-title">Posición del Total</h3>
        <div className="viz-total-row-controls">
          <VisualizationToggleButton
            isActive={totalRow === "top"}
            onClick={handleToggleTotalTop}
            icon="panel-top"
            tooltipId="total-top-tooltip"
            tooltipContent="Mostrar total arriba"
          />
          <VisualizationToggleButton
            isActive={totalRow === "bottom"}
            onClick={handleToggleTotalBottom}
            icon="panel-bottom"
            tooltipId="total-bottom-tooltip"
            tooltipContent="Mostrar total abajo"
          />
        </div>
      </div>
    </div>
  );
};
