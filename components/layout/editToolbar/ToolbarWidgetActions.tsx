import React from "react";
import { Icon } from "@/common/Icon";
import { ToolbarWidgetActionsProps } from "./types";
import { Tooltip } from "react-tooltip";
import { useDragAndDrop } from "./hooks";
import { useWidgetCreator } from "./hooks/useWidgetCreator";
import { ConfigDropdown } from "@/components/widgets/config/common/ui/ConfigDropdown";

// Opciones de gráficos disponibles con handlers de drag
const CHART_OPTIONS = [
  {
    id: "bar",
    label: "Gráfico de Barras",
    icon: "bar-chart" as const,
    dragHandler: "handleBarChartDragStart" as const,
  },
  {
    id: "line",
    label: "Gráfico de Líneas", 
    icon: "line-chart" as const,
    dragHandler: "handleLineChartDragStart" as const,
  },
  {
    id: "pie",
    label: "Gráfico Circular",
    icon: "pie-chart" as const,
    dragHandler: "handlePieChartDragStart" as const,
  },
  {
    id: "area",
    label: "Gráfico de Área",
    icon: "chart-bar" as const,
    dragHandler: "handleAreaChartDragStart" as const,
  },
  {
    id: "comparison",
    label: "Widget de Comparativa",
    icon: "trending-up" as const,
    dragHandler: "handleComparisonDragStart" as const,
  },
] as const;

/**
 * Componente para las acciones de widgets en la barra de herramientas
 */
export const ToolbarWidgetActions: React.FC<ToolbarWidgetActionsProps> = () => {
  // Hooks para creación de widgets y drag & drop
  const {
    handleMetricDragStart,
    handleTableDragStart,
    handleTextDragStart,
    handleBarChartDragStart,
    handleLineChartDragStart,
    handlePieChartDragStart,
    handleAreaChartDragStart,
    handleComparisonDragStart,
  } = useDragAndDrop();

  // Hook de creación de widgets utilizando el nuevo patrón
  const {
    addMetricWidget,
    addTableWidget,
    addTextWidget,
    addSpecificChartWidget,
    addComparisonWidget,
  } = useWidgetCreator();

  // Manejar selección de tipo de gráfico
  const handleChartOptionSelect = (chartType: string) => {
    if (chartType === "comparison") {
      addComparisonWidget();
    } else {
      addSpecificChartWidget(
        chartType as "bar" | "line" | "pie" | "scatter" | "area"
      );
    }
  };

  // Obtener el handler de drag correspondiente
  const getDragHandler = (dragHandlerName: string) => {
    const handlers = {
      handleBarChartDragStart,
      handleLineChartDragStart,
      handlePieChartDragStart,
      handleAreaChartDragStart,
      handleComparisonDragStart,
    };
    return handlers[dragHandlerName as keyof typeof handlers];
  };

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

        {/* Desplegable de gráficos */}
        <ConfigDropdown
          placement="bottom"
          offsetDistance={8}
          className="edit-toolbar__chart-dropdown"
          triggerElement={({ ref, onClick, referenceProps }) => (
            <div className="edit-toolbar__dropdown">
              <button
                ref={ref}
                className="edit-toolbar__button"
                onClick={onClick}
                data-tooltip-id="chart-dropdown-tooltip"
                {...referenceProps}
              >
                <Icon name="bar-chart" size={20} />
                <span>Gráfico</span>
              </button>
              <Icon
                name="chevron-down"
                size={12}
                className="edit-toolbar__dropdown-chevron"
              />
            </div>
          )}
        >
          <div className="edit-toolbar__dropdown-menu">
            {CHART_OPTIONS.map((option) => (
              <button
                key={option.id}
                className="edit-toolbar__dropdown-item"
                onClick={() => handleChartOptionSelect(option.id)}
                onDragStart={getDragHandler(option.dragHandler)}
                draggable="true"
              >
                <Icon name={option.icon} size={20} />
                <span>{option.label}</span>
              </button>
            ))}
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
        id="chart-dropdown-tooltip"
        content="Selecciona el tipo de gráfico"
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
