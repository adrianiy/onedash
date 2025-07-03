import React from "react";
import { useDashboardStore } from "../../store/dashboardStore";
import { useWidgetStore } from "../../store/widgetStore";
import { Icon } from "../common/Icon";
import { BarChart } from "../charts/BarChart";
import type { Widget } from "../../types/widget";

interface WidgetContainerProps {
  widget: Widget;
}

export const WidgetContainer: React.FC<WidgetContainerProps> = ({ widget }) => {
  const { isEditing } = useDashboardStore();
  const { deleteWidget } = useWidgetStore();

  const handleDelete = () => {
    deleteWidget(widget.id);
  };

  const renderWidgetContent = () => {
    switch (widget.type) {
      case "chart":
        if (widget.config.chartType === "bar") {
          return (
            <BarChart
              data={widget.config.data}
              title={widget.title}
              height="100%"
            />
          );
        }
        return <div className="text-muted">Chart type not implemented</div>;

      case "metric":
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-2xl font-bold text-primary mb-xs">
              {widget.config.value}
              {widget.config.unit && (
                <span className="text-lg text-secondary ml-xs">
                  {widget.config.unit}
                </span>
              )}
            </div>
            {widget.config.trend && (
              <div className="flex items-center gap-xs text-sm">
                <Icon
                  name={`trending-${widget.config.trend}`}
                  size={16}
                  color={
                    widget.config.trend === "up"
                      ? "var(--color-success)"
                      : widget.config.trend === "down"
                      ? "var(--color-danger)"
                      : "var(--color-text-secondary)"
                  }
                />
                {widget.config.trendValue && (
                  <span
                    className={
                      widget.config.trend === "up"
                        ? "text-green-600"
                        : widget.config.trend === "down"
                        ? "text-red-600"
                        : "text-secondary"
                    }
                  >
                    {widget.config.trendValue}%
                  </span>
                )}
              </div>
            )}
          </div>
        );

      case "table":
        return (
          <div className="overflow-auto h-full">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {widget.config.columns.map((col) => (
                    <th key={col.key} className="text-left p-xs font-medium">
                      {col.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {widget.config.data.map((row, index) => (
                  <tr key={index} className="border-b border-opacity-50">
                    {widget.config.columns.map((col) => (
                      <td key={col.key} className="p-xs">
                        {row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "text":
        return (
          <div
            className="h-full overflow-auto"
            style={{
              fontSize: widget.config.fontSize || 14,
              textAlign: widget.config.textAlign || "left",
            }}
          >
            {widget.config.content}
          </div>
        );

      default:
        return <div className="text-muted">Unknown widget type</div>;
    }
  };

  return (
    <div className="widget-container">
      <div className="widget-header">
        <h4 className="widget-title">{widget.title}</h4>
        {isEditing && (
          <div className="widget-actions">
            <button
              className="widget-action-btn"
              onClick={handleDelete}
              title="Delete widget"
            >
              <Icon name="trash" size={16} />
            </button>
          </div>
        )}
      </div>
      <div className="widget-content">{renderWidgetContent()}</div>
    </div>
  );
};
