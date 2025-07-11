import React from "react";
import { VisualizationToggleButton } from "../../common/controls/VisualizationToggleButton";
import type { TableWidget } from "@/types/widget";
import { useWidgetStore } from "@/store/widgetStore";

interface TableStyleControlsSectionProps {
  widget: TableWidget;
  showHeaderBackground: boolean;
  alternateRows: boolean;
  showBorders: boolean;
}

export const TableStyleControlsSection: React.FC<
  TableStyleControlsSectionProps
> = ({ widget, showHeaderBackground, alternateRows, showBorders }) => {
  const { updateWidget } = useWidgetStore();

  const handleToggleOption = (option: string, value: boolean) => {
    const visualization = widget.config.visualization || {};
    updateWidget(widget._id, {
      config: {
        ...widget.config,
        visualization: {
          ...visualization,
          [option]: value,
        },
      },
    });
  };

  return (
    <>
      <VisualizationToggleButton
        isActive={showHeaderBackground}
        onClick={() =>
          handleToggleOption("showHeaderBackground", !showHeaderBackground)
        }
        icon="table-row"
        tooltipId="header-bg-tooltip"
        tooltipContent="Fondo de cabecera"
      />

      <VisualizationToggleButton
        isActive={alternateRows}
        onClick={() => handleToggleOption("alternateRowColors", !alternateRows)}
        icon="table-striped"
        tooltipId="alternate-tooltip"
        tooltipContent="Filas alternadas"
      />

      <VisualizationToggleButton
        isActive={showBorders}
        onClick={() => handleToggleOption("showBorders", !showBorders)}
        icon="border-grid"
        tooltipId="borders-tooltip"
        tooltipContent="Mostrar bordes"
      />
    </>
  );
};
