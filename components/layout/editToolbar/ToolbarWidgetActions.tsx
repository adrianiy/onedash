import React from "react";
import { Icon } from "@/common/Icon";
import { ToolbarWidgetActionsProps } from "./types";
import { Tooltip } from "react-tooltip";
import { useDragAndDrop } from "./hooks";
import { useWidgetStore } from "@/store/widgetStore";

/**
 * Componente para las acciones de widgets en la barra de herramientas
 */
export const ToolbarWidgetActions: React.FC<ToolbarWidgetActionsProps> = ({
  addWidgetToBoard,
}) => {
  // Hooks para creación de widgets y drag & drop
  const {
    handleMetricDragStart,
    handleTableDragStart,
    handleChartDragStart,
    handleTextDragStart,
  } = useDragAndDrop();

  /**
   * Maneja la creación de un widget de métrica
   */
  const handleAddMetric = () => {
    const { addWidget } = useWidgetStore.getState();

    // Crear widget de métrica
    const newMetricWidget = addWidget({
      type: "metric",
      title: "Nueva métrica",
      config: {},
      isConfigured: false,
    });

    addWidgetToBoard(newMetricWidget, { w: 4, h: 4 });

    // Disparar evento para el wizard
    document.dispatchEvent(new Event("widget-create"));
  };

  /**
   * Maneja la creación de un widget de tabla
   */
  const handleAddTable = () => {
    const { addWidget } = useWidgetStore.getState();

    // Crear widget de tabla
    const newTableWidget = addWidget({
      type: "table",
      title: "Nueva tabla",
      config: {},
      isConfigured: false,
    });

    addWidgetToBoard(newTableWidget, { w: 6, h: 6 });

    // Disparar evento para el wizard
    document.dispatchEvent(new Event("widget-create"));
  };

  /**
   * Maneja la creación de un widget de gráfico
   */
  const handleAddChart = () => {
    const { addWidget } = useWidgetStore.getState();

    // Crear widget de gráfico
    const newChartWidget = addWidget({
      type: "chart",
      title: "Nuevo gráfico",
      config: {
        chartType: "bar",
        data: [],
      },
      isConfigured: false,
    });

    addWidgetToBoard(newChartWidget, { w: 6, h: 4 });

    // Disparar evento para el wizard
    document.dispatchEvent(new Event("widget-create"));
  };

  /**
   * Maneja la creación de un widget de texto
   */
  const handleAddText = () => {
    const { addWidget } = useWidgetStore.getState();

    // Crear widget de texto
    const newTextWidget = addWidget({
      type: "text",
      title: "",
      config: {},
      isConfigured: true,
    });

    addWidgetToBoard(newTextWidget, { w: 4, h: 3 });

    // Disparar evento para el wizard
    document.dispatchEvent(new Event("widget-create"));
  };

  return (
    <div className="edit-toolbar__section toolbar-widget-actions">
      <div className="edit-toolbar__section-buttons">
        <button
          className="edit-toolbar__button"
          onClick={handleAddMetric}
          onDragStart={handleMetricDragStart}
          draggable="true"
          data-tooltip-id="metric-tooltip"
        >
          <Icon name="target" size={20} />
          <span>Métrica</span>
        </button>

        <button
          className="edit-toolbar__button"
          onClick={handleAddTable}
          onDragStart={handleTableDragStart}
          draggable="true"
          data-tooltip-id="table-tooltip"
        >
          <Icon name="table" size={20} />
          <span>Tabla</span>
        </button>

        <button
          className="edit-toolbar__button"
          onClick={handleAddChart}
          onDragStart={handleChartDragStart}
          draggable="true"
          data-tooltip-id="chart-tooltip"
        >
          <Icon name="bar-chart" size={20} />
          <span>Gráfico</span>
        </button>

        <button
          className="edit-toolbar__button"
          onClick={handleAddText}
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
    </div>
  );
};
