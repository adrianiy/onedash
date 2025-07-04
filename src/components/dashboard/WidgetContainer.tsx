import React from "react";
import { useDashboardStore } from "../../store/dashboardStore";
import { useWidgetStore } from "../../store/widgetStore";
import { Icon } from "../common/Icon";
import { BarChart } from "../charts/BarChart";
import type { Widget } from "../../types/widget";

interface WidgetContainerProps {
  widget: Widget;
  isSelected?: boolean;
}

export const WidgetContainer: React.FC<WidgetContainerProps> = ({
  widget,
  isSelected = false,
}) => {
  const { isEditing, selectWidget, clearSelection } = useDashboardStore();
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

    // Add to current dashboard
    const { currentDashboard, updateDashboard } = useDashboardStore.getState();
    if (currentDashboard) {
      const newLayout = {
        i: newWidget.id,
        x: 0,
        y: 0,
        w: 4,
        h: 3,
        minW: 3,
        minH: 3,
      };

      updateDashboard(currentDashboard.id, {
        widgets: [...currentDashboard.widgets, newWidget.id],
        layout: [...currentDashboard.layout, newLayout],
      });
    }
  };

  const handleEdit = () => {
    // TODO: Implement edit functionality
    console.log("Edit widget:", widget.id);
  };

  const handleWidgetClick = (e: React.MouseEvent) => {
    // Solo manejar selección en modo edición
    if (isEditing) {
      e.stopPropagation(); // Evitar propagación para no interferir con grid layout
      if (isSelected) {
        clearSelection(); // Deseleccionar si ya está seleccionado
      } else {
        selectWidget(widget.id); // Seleccionar si no está seleccionado
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
        if (widget.config.chartType === "bar") {
          return (
            <div className="chart-widget">
              <BarChart data={widget.config.data} title="" height="100%" />
            </div>
          );
        }
        return (
          <div className="widget-error">
            <Icon name="alert-circle" size={24} />
            <span>Chart type not implemented</span>
          </div>
        );

      case "metric":
        return (
          <div className="metric-widget">
            <div className="metric-value">
              {widget.config.value}
              {widget.config.unit && (
                <span className="metric-unit">{widget.config.unit}</span>
              )}
            </div>
            {widget.config.trend && (
              <div className={`metric-trend ${widget.config.trend}`}>
                <Icon name={`trending-${widget.config.trend}`} size={16} />
                {widget.config.trendValue && (
                  <span>{widget.config.trendValue}%</span>
                )}
              </div>
            )}
          </div>
        );

      case "table":
        return (
          <div className="table-widget">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    {widget.config.columns.map((col) => (
                      <th key={col.key}>{col.title}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {widget.config.data.map((row: any, index: number) => (
                    <tr key={index}>
                      {widget.config.columns.map((col: any) => (
                        <td key={col.key}>{String(row[col.key] || "")}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "text":
        return (
          <div
            className="text-widget"
            style={{
              fontSize: widget.config.fontSize || 16,
              textAlign: widget.config.textAlign || "left",
            }}
          >
            {String(widget.config.content)}
          </div>
        );

      default:
        return (
          <div className="widget-error">
            <Icon name="alert-circle" size={24} />
            <span>Unknown widget type</span>
          </div>
        );
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

      <div className="widget-header">
        <h4 className="widget-title">{widget.title}</h4>
      </div>
      <div className="widget-content">{renderWidgetContent()}</div>
    </div>
  );
};
