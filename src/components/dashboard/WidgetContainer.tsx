import React from "react";
import { useDashboardStore } from "../../store/dashboardStore";
import { useWidgetStore } from "../../store/widgetStore";
import { Icon } from "../common/Icon";
import {
  ChartWidget,
  MetricWidget,
  TableWidget,
  TextWidget,
  ErrorWidget,
} from "../widgets/render";
import type { Widget } from "../../types/widget";

interface WidgetContainerProps {
  widget: Widget;
  isSelected?: boolean;
}

export const WidgetContainer: React.FC<WidgetContainerProps> = ({
  widget,
  isSelected = false,
}) => {
  const { isEditing, selectWidget, openConfigSidebar } = useDashboardStore();
  const { deleteWidget, addWidget } = useWidgetStore();

  const handleDelete = () => {
    deleteWidget(widget.id);
  };

  const handleCopy = () => {
    const newWidget = addWidget({
      type: widget.type,
      title: `${widget.title} (Copy)`,
      config: { ...widget.config },
    });

    // Add to current dashboard or temp dashboard if in editing mode
    const {
      currentDashboard,
      tempDashboard,
      isEditing,
      updateDashboard,
      updateTempDashboard,
    } = useDashboardStore.getState();

    const targetDashboard = isEditing ? tempDashboard : currentDashboard;

    if (targetDashboard) {
      const newLayout = {
        i: newWidget.id,
        x: 0,
        y: 0,
        w: 4,
        h: 3,
      };

      if (isEditing) {
        // En modo edición, actualizar el dashboard temporal
        updateTempDashboard({
          widgets: [...targetDashboard.widgets, newWidget.id],
          layout: [...targetDashboard.layout, newLayout],
        });
      } else {
        // Fuera del modo edición, actualizar directamente
        updateDashboard(targetDashboard.id, {
          widgets: [...targetDashboard.widgets, newWidget.id],
          layout: [...targetDashboard.layout, newLayout],
        });
      }
    }
  };

  const handleEdit = () => {
    selectWidget(widget.id);
    openConfigSidebar();
  };

  const handleWidgetClick = (e: React.MouseEvent) => {
    // Solo manejar selección en modo edición
    if (isEditing) {
      e.stopPropagation(); // Evitar propagación para no interferir con grid layout
      if (!isSelected) {
        selectWidget(widget.id); // Seleccionar solo si no está ya seleccionado
      }
    }
  };

  const handleButtonMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const renderWidgetContent = () => {
    switch (widget.type) {
      case "chart":
        return <ChartWidget widget={widget} />;
      case "metric":
        return <MetricWidget widget={widget} />;
      case "table":
        return <TableWidget widget={widget} />;
      case "text":
        return <TextWidget widget={widget} />;
      default:
        return <ErrorWidget />;
    }
  };

  return (
    <div
      className={`widget-container ${isSelected ? "widget-selected" : ""}`}
      onClick={handleWidgetClick}
    >
      {isEditing && (
        <div className="floating-widget-header draggable-handle">
          <div className="floating-widget-title-section">
            <Icon name="grip-vertical" size={14} className="drag-icon" />
            <h4 className="floating-widget-title">{widget.title}</h4>
          </div>
          <div
            className="floating-widget-actions no-drag"
            onMouseDown={handleButtonMouseDown}
          >
            <button
              className="floating-action-btn copy"
              onClick={handleCopy}
              onMouseDown={handleButtonMouseDown}
              title="Copy widget"
            >
              <Icon name="copy" size={14} />
            </button>
            <button
              className="floating-action-btn edit"
              onClick={handleEdit}
              onMouseDown={handleButtonMouseDown}
              title="Edit widget"
            >
              <Icon name="edit" size={14} />
            </button>
            <button
              className="floating-action-btn delete"
              onClick={handleDelete}
              onMouseDown={handleButtonMouseDown}
              title="Delete widget"
            >
              <Icon name="trash" size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Solo mostrar el encabezado si el widget tiene título y la configuración permite mostrarlo */}
      {(() => {
        // Para widgets de tabla, verificar la configuración de visualización
        if (widget.type === "table") {
          const visualization = widget.config.visualization || {};
          const showTitle = visualization.showTitle !== false;

          return widget.title && showTitle ? (
            <div className="widget-header">
              <h4 className="widget-title">{widget.title}</h4>
            </div>
          ) : null;
        }

        // Para widgets de métrica, verificar la configuración de visualización
        if (widget.type === "metric") {
          const visualization = widget.config.visualization || {};
          const showTitle =
            visualization.showTitle !== undefined
              ? visualization.showTitle
              : false; // Por defecto false

          return widget.title && showTitle ? (
            <div className="widget-header">
              <h4 className="widget-title">{widget.title}</h4>
            </div>
          ) : null;
        }

        // Para otros tipos de widgets, mostrar el título si existe
        return widget.title ? (
          <div className="widget-header">
            <h4 className="widget-title">{widget.title}</h4>
          </div>
        ) : null;
      })()}

      {(() => {
        // Determinar si debemos mostrar el título del widget
        let shouldShowTitle = false;

        if (widget.type === "table") {
          const visualization = widget.config.visualization || {};
          const showTitle = visualization.showTitle !== false;
          shouldShowTitle = !!(widget.title && showTitle);
        } else if (widget.type === "metric") {
          const visualization = widget.config.visualization || {};
          const showTitle =
            visualization.showTitle !== undefined
              ? visualization.showTitle
              : false; // Por defecto false
          shouldShowTitle = !!(widget.title && showTitle);
        } else {
          shouldShowTitle = !!widget.title;
        }

        // Determinar si necesitamos padding para el floating header
        const needsFloatingPadding =
          isEditing && isSelected && !shouldShowTitle;

        return (
          <div
            className={`widget-content ${
              needsFloatingPadding ? "widget-content--floating-padding" : ""
            }`}
          >
            {renderWidgetContent()}
          </div>
        );
      })()}
    </div>
  );
};
