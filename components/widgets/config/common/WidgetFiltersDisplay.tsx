import React from "react";
import { Tooltip } from "react-tooltip";
import { Icon } from "@/common/Icon";

interface WidgetFilters {
  products?: string[];
  sections?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
}

interface WidgetFiltersDisplayProps {
  filters: WidgetFilters;
  mode?: "hidden" | "badges" | "info";
  widgetId: string;
  className?: string;
  widgetType?: "metric" | "chart" | "table" | "text";
}

export const WidgetFiltersDisplay: React.FC<WidgetFiltersDisplayProps> = ({
  filters,
  mode = "hidden",
  widgetId,
  className = "",
  widgetType = "chart", // Por defecto asumimos que no es una métrica
}) => {
  // Check if there are any filters configured
  const hasFilters =
    (filters.products && filters.products.length > 0) ||
    (filters.sections && filters.sections.length > 0) ||
    (filters.dateRange && (filters.dateRange.start || filters.dateRange.end));

  if (!hasFilters || mode === "hidden") {
    return null;
  }

  // Badge mode: show filter tags with values
  if (mode === "badges") {
    // Usamos clases diferentes según el tipo de widget
    const filterContainerClass =
      widgetType === "metric"
        ? `metric-widget__filters metric-widget__filters--badges ${className}`
        : `widget-filters-container ${className}`;

    return (
      <>
        <div className={filterContainerClass}>
          {filters.products && filters.products.length > 0 && (
            <span
              className={
                widgetType === "metric"
                  ? "metric-widget__filter-badge metric-widget__filter-badge--product"
                  : "widget-filter-badge widget-filter-badge--product"
              }
              data-tooltip-id={`filter-products-tooltip-${widgetId}`}
              data-tooltip-content={`Productos: ${filters.products.join(", ")}`}
            >
              <span>
                {filters.products.length === 1
                  ? filters.products[0]
                  : `${filters.products.length} Productos`}
              </span>
            </span>
          )}

          {filters.sections && filters.sections.length > 0 && (
            <span
              className={
                widgetType === "metric"
                  ? "metric-widget__filter-badge metric-widget__filter-badge--section"
                  : "widget-filter-badge widget-filter-badge--section"
              }
              data-tooltip-id={`filter-sections-tooltip-${widgetId}`}
              data-tooltip-content={`Secciones: ${filters.sections.join(", ")}`}
            >
              <span>
                {filters.sections.length === 1
                  ? filters.sections[0]
                  : `${filters.sections.length} Secciones`}
              </span>
            </span>
          )}

          {filters.dateRange &&
            (filters.dateRange.start || filters.dateRange.end) && (
              <span
                className={
                  widgetType === "metric"
                    ? "metric-widget__filter-badge metric-widget__filter-badge--date"
                    : "widget-filter-badge widget-filter-badge--date"
                }
                data-tooltip-id={`filter-date-tooltip-${widgetId}`}
                data-tooltip-content={`Fechas: ${
                  filters.dateRange.start || ""
                } - ${filters.dateRange.end || ""}`}
              >
                <span>Fecha</span>
              </span>
            )}
        </div>

        {/* Tooltips for badges */}
        <Tooltip id={`filter-date-tooltip-${widgetId}`} place="top" />
        <Tooltip id={`filter-products-tooltip-${widgetId}`} place="top" />
        <Tooltip id={`filter-sections-tooltip-${widgetId}`} place="top" />
      </>
    );
  }

  // Info mode: show only a filter icon with tooltip
  if (mode === "info") {
    const tooltipContent = [
      filters.products?.length
        ? `Productos: ${filters.products.join(", ")}`
        : "",
      filters.sections?.length
        ? `Secciones: ${filters.sections.join(", ")}`
        : "",
      filters.dateRange && (filters.dateRange.start || filters.dateRange.end)
        ? `Fechas: ${filters.dateRange.start || ""} - ${
            filters.dateRange.end || ""
          }`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    return (
      <>
        <div
          className={
            widgetType === "metric"
              ? `metric-widget__filters metric-widget__filters--info ${className}`
              : `widget-filter-indicator ${className}`
          }
          data-tooltip-id={`metric-filters-tooltip-${widgetId}`}
          data-tooltip-content={tooltipContent}
        >
          <div
            className={
              widgetType === "metric" ? "metric-widget__filter-indicator" : ""
            }
          >
            <Icon name="filter" size={12} />
          </div>
        </div>

        <Tooltip
          id={`metric-filters-tooltip-${widgetId}`}
          place="top"
          style={{ whiteSpace: "pre-line" }}
        />
      </>
    );
  }

  return null;
};
