import React from "react";
import { VisualizationToggleButton } from "./VisualizationToggleButton";
import type { TableWidget } from "@/types/widget";
import { useWidgetStore } from "@/store/widgetStore";

interface TableDisplayModeSectionProps {
  widget: TableWidget;
  isCompact: boolean;
}

export const TableDisplayModeSection: React.FC<
  TableDisplayModeSectionProps
> = ({ widget, isCompact }) => {
  const { updateWidget } = useWidgetStore();

  const handleToggleCompact = (compact: boolean) => {
    const visualization = widget.config.visualization || {};
    updateWidget(widget._id, {
      config: {
        ...widget.config,
        visualization: {
          ...visualization,
          compact,
        },
      },
    });
  };

  return (
    <div className="viz-config-section viz-display-mode">
      <div className="viz-section-header viz-display-mode-header">
        <h3 className="viz-section-title">Modo de Visualización</h3>
        <div className="viz-display-mode-controls">
          <VisualizationToggleButton
            isActive={!isCompact}
            onClick={() => handleToggleCompact(false)}
            icon="rows-3"
            tooltipId="relaxed-mode-tooltip"
            tooltipContent="Modo relajado"
          />
          <VisualizationToggleButton
            isActive={isCompact}
            onClick={() => handleToggleCompact(true)}
            icon="rows-4"
            tooltipId="compact-mode-tooltip"
            tooltipContent="Modo compacto"
          />
        </div>
      </div>
    </div>
  );
};
