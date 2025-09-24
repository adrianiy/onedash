import React from "react";
import { Icon } from "@/common/Icon";
import { ToolbarWidgetActionsProps } from "./types";
import { Tooltip } from "react-tooltip";
import { useDragAndDrop } from "./hooks";
import { useWidgetCreator } from "./hooks/useWidgetCreator";
import { ConfigDropdown } from "@/components/widgets/config/common/ui/ConfigDropdown";

/**
 * Componente para las acciones de widgets en la barra de herramientas
 */
export const ToolbarWidgetActions: React.FC<ToolbarWidgetActionsProps> = () => {
  // Hooks para creación de widgets y drag & drop
  const {
    handleMetricDragStart,
    handleTableDragStart,
    handleChartDragStart,
    handleTextDragStart,
    handleComparisonDragStart,
  } = useDragAndDrop();

  // Hook de creación de widgets utilizando el nuevo patrón
  const {
    addMetricWidget,
    addTableWidget,
    addChartWidget,
    addTextWidget,
    addComparisonWidget,
  } = useWidgetCreator();

  return (
    <div className="edit-toolbar__section toolbar-widget-actions">
      <div className="edit-toolbar__section-buttons">
        <button
          className="edit-toolbar__button"
          onClick={addMetricWidget}
          onDragStart={handleMetricDragStart}
          draggable="true"
          data-tooltip-id="metric-tooltip"
        >
          <Icon name="target" size={20} />
          <span>Métrica</span>
        </button>

        <button
          className="edit-toolbar__button"
          onClick={addTableWidget}
          onDragStart={handleTableDragStart}
          draggable="true"
          data-tooltip-id="table-tooltip"
        >
          <Icon name="table" size={20} />
          <span>Tabla</span>
        </button>

        <ConfigDropdown
          triggerElement={({ ref, onClick, referenceProps }) => (
            <button
              ref={ref}
              className="edit-toolbar__button edit-toolbar__button--with-dropdown"
              onClick={() => {
                // Ocultar tooltip al hacer clic
                onClick();
              }}
              {...referenceProps}
            >
              <Icon name="bar-chart" size={20} />
              <span>Gráfico</span>
              <Icon
                name="chevron-down"
                size={14}
                className="edit-toolbar__button-chevron"
              />
            </button>
          )}
          placement="bottom"
          offsetDistance={4}
          className="chart-dropdown"
        >
          <div className="edit-toolbar__dropdown-menu edit-toolbar__dropdown-menu--grid">
            <button
              className="edit-toolbar__dropdown-item edit-toolbar__dropdown-item--grid"
              onClick={addChartWidget}
              onDragStart={handleChartDragStart}
              data-tooltip-id="chart-tooltip"
              draggable="true"
            >
              <Icon name="bar-chart" size={20} />
              <span>Barras</span>
            </button>
            <button
              className="edit-toolbar__dropdown-item edit-toolbar__dropdown-item--grid"
              onClick={addComparisonWidget}
              onDragStart={handleComparisonDragStart}
              data-tooltip-id="chart-tooltip"
              draggable="true"
            >
              <Icon name="git-compare-arrows" size={20} />
              <span>Comparativa</span>
            </button>
          </div>
        </ConfigDropdown>

        <button
          className="edit-toolbar__button"
          onClick={addTextWidget}
          onDragStart={handleTextDragStart}
          draggable="true"
          data-tooltip-id="text-tooltip"
        >
          <Icon name="edit" size={20} />
          <span>Texto</span>
        </button>
      </div>
      <span className="edit-toolbar__section-title">Widgets</span>

      {/* Tooltips */}
      <Tooltip
        id="metric-tooltip"
        content="Haz clic para añadir o arrastra al grid"
        place="bottom"
      />
      <Tooltip
        id="table-tooltip"
        content="Haz clic para añadir o arrastra al grid"
        place="bottom"
      />
      <Tooltip
        id="chart-tooltip"
        content="Haz clic para añadir o arrastra al grid"
        place="bottom"
      />
      <Tooltip
        id="text-tooltip"
        content="Haz clic para añadir o arrastra al grid"
        place="bottom"
      />
      <Tooltip
        id="comparison-tooltip"
        content="Haz clic para añadir o arrastra al grid"
        place="bottom"
      />
    </div>
  );
};
