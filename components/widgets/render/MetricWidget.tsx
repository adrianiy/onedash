import React, { useMemo, useState } from "react";
import { Icon } from "../../common/Icon";
import type { MetricWidget as MetricWidgetType } from "../../../types/widget";
import { formatValue } from "../../../utils/format";
import { useVariableStore } from "../../../store/variableStore";
import { useVariablePersistence } from "../../../hooks/useVariablePersistence";
import { useDashboardStore } from "../../../store/dashboardStore";
import { useResolvedMetric } from "../../../hooks/useResolvedMetric";
import { Tooltip } from "react-tooltip";

interface MetricWidgetProps {
  widget: MetricWidgetType;
}

export const MetricWidget: React.FC<MetricWidgetProps> = ({ widget }) => {
  const { currentDashboard } = useDashboardStore();
  const { persistMultiple } = useVariablePersistence(
    currentDashboard?._id || null
  );
  const [isClicked, setIsClicked] = useState(false);

  const size = widget.config.size || "medium";
  const alignment = widget.config.alignment || "center";
  const conditionalFormats =
    widget.config.visualization?.conditionalFormats || [];
  const filterDisplayMode = widget.config.visualization?.filterDisplayMode;
  const widgetFilters = widget.config.widgetFilters || {};

  // Verificar si hay filtros configurados para mostrar
  const hasFilters =
    (widgetFilters.products && widgetFilters.products.length > 0) ||
    (widgetFilters.sections && widgetFilters.sections.length > 0) ||
    (widgetFilters.dateRange &&
      (widgetFilters.dateRange.start || widgetFilters.dateRange.end));

  // Detectar si el widget tiene eventos de click configurados
  const clickEvent = useMemo(() => {
    return widget.events?.find((event) => event.trigger === "click");
  }, [widget.events]);

  const isClickable = Boolean(
    clickEvent &&
      clickEvent.setVariables &&
      Object.keys(clickEvent.setVariables).length > 0
  );

  // Verificar si el KPI está "activo" (sus variables coinciden con el estado actual)
  const variables = useVariableStore((state) => state.variables);
  const isActive = useMemo(() => {
    if (!isClickable || !clickEvent || !clickEvent.setVariables) return false;

    // Verificar si alguna de las variables del evento coincide con el estado actual
    return Object.entries(clickEvent.setVariables).some(
      ([variableId, value]) => {
        return variables[variableId] === value;
      }
    );
  }, [isClickable, clickEvent, variables]);

  // Función para manejar el click en el widget
  const handleWidgetClick = () => {
    if (!isClickable || !clickEvent || !clickEvent.setVariables) return;

    // Activar animación de click
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 200);

    // Actualizar y persistir variables
    persistMultiple(clickEvent.setVariables);
  };

  // Resolver las métricas usando el hook
  const primaryMetricData = useResolvedMetric(widget.config.primaryMetric);
  const secondaryMetricData = useResolvedMetric(widget.config.secondaryMetric);

  // Función para obtener el estilo condicional
  const getConditionalStyle = (
    metricType: "primaryMetric" | "secondaryMetric",
    value: number
  ): React.CSSProperties => {
    let finalStyle: React.CSSProperties = {};

    for (const format of conditionalFormats) {
      if (!format.isEnabled || format.columnId !== metricType) {
        continue;
      }

      const numericRuleValue = Number(format.value);
      let conditionMet = false;

      switch (format.condition) {
        case "greater_than":
          if (!isNaN(numericRuleValue)) {
            conditionMet = value > numericRuleValue;
          }
          break;
        case "less_than":
          if (!isNaN(numericRuleValue)) {
            conditionMet = value < numericRuleValue;
          }
          break;
        case "equals":
          conditionMet = value === numericRuleValue;
          break;
        case "contains":
          conditionMet = String(value).includes(String(format.value));
          break;
      }

      if (conditionMet) {
        finalStyle = {
          backgroundColor: format.style.backgroundColor,
          color: format.style.textColor,
          fontWeight: format.style.fontWeight,
          fontStyle: format.style.fontStyle,
        };
        // Romper el bucle después de aplicar el primer formato que coincida
        break;
      }
    }

    return finalStyle;
  };

  // Función para renderizar los filtros según el modo
  const renderFilters = () => {
    if (!hasFilters || !filterDisplayMode || filterDisplayMode === "hidden") {
      return null;
    }

    // Modo badge: mostrar etiquetas con los valores de los filtros
    if (filterDisplayMode === "badges") {
      return (
        <div className="metric-widget__filters metric-widget__filters--badges">
          {widgetFilters.products && widgetFilters.products.length > 0 && (
            <span
              className="metric-widget__filter-badge metric-widget__filter-badge--product"
              data-tooltip-id={`filter-products-tooltip-${widget._id}`}
              data-tooltip-content={`Productos: ${widgetFilters.products.join(
                ", "
              )}`}
            >
              <span>
                {widgetFilters.products.length === 1
                  ? widgetFilters.products[0]
                  : `${widgetFilters.products.length} Productos`}
              </span>
            </span>
          )}

          {widgetFilters.sections && widgetFilters.sections.length > 0 && (
            <span
              className="metric-widget__filter-badge metric-widget__filter-badge--section"
              data-tooltip-id={`filter-sections-tooltip-${widget._id}`}
              data-tooltip-content={`Secciones: ${widgetFilters.sections.join(
                ", "
              )}`}
            >
              <span>
                {widgetFilters.sections.length === 1
                  ? widgetFilters.sections[0]
                  : `${widgetFilters.sections.length} Secciones`}
              </span>
            </span>
          )}

          {widgetFilters.dateRange &&
            (widgetFilters.dateRange.start || widgetFilters.dateRange.end) && (
              <span
                className="metric-widget__filter-badge metric-widget__filter-badge--date"
                data-tooltip-id={`filter-date-tooltip-${widget._id}`}
                data-tooltip-content={`Fechas: ${
                  widgetFilters.dateRange.start || ""
                } - ${widgetFilters.dateRange.end || ""}`}
              >
                <span>Fecha</span>
              </span>
            )}
        </div>
      );
    }

    // Modo info: mostrar solo un icono de filtro
    if (filterDisplayMode === "info") {
      return (
        <div
          className="metric-widget__filters metric-widget__filters--info"
          data-tooltip-id={`metric-filters-tooltip-${widget._id}`}
          data-tooltip-content={`${
            widgetFilters.products?.length
              ? `Productos: ${widgetFilters.products.join(", ")}\n`
              : ""
          }${
            widgetFilters.sections?.length
              ? `Secciones: ${widgetFilters.sections.join(", ")}\n`
              : ""
          }${
            widgetFilters.dateRange &&
            (widgetFilters.dateRange.start || widgetFilters.dateRange.end)
              ? `Fechas: ${widgetFilters.dateRange.start || ""} - ${
                  widgetFilters.dateRange.end || ""
                }`
              : ""
          }`}
        >
          <div className="metric-widget__filter-indicator">
            <Icon name="filter" size={12} />
          </div>
        </div>
      );
    }

    return null;
  };

  // Si no hay métricas configuradas, mostrar placeholder
  if (!primaryMetricData) {
    return (
      <div className="widget-placeholder">
        <Icon name="target" size={48} />
        <h3>Métrica sin configurar</h3>
        <div className="placeholder-tip">
          <Icon name="info" size={16} />
          <p>Configura una métrica para mostrar datos</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`metric-widget-wrapper metric-widget-wrapper--${alignment} ${
        hasFilters && filterDisplayMode
          ? "metric-widget-wrapper--with-filters"
          : ""
      }`}
    >
      <div
        className={`metric-widget metric-widget--${size} ${
          isClickable ? "metric-widget--clickable" : ""
        } ${isClicked ? "metric-widget--clicked" : ""}`}
        onClick={handleWidgetClick}
        style={{ cursor: isClickable ? "pointer" : "default" }}
      >
        {renderFilters()}
        <Tooltip id={`filter-date-tooltip-${widget._id}`} place="top" />
        <Tooltip id={`filter-products-tooltip-${widget._id}`} place="top" />
        <Tooltip id={`filter-sections-tooltip-${widget._id}`} place="top" />
        <Tooltip
          id={`metric-filters-tooltip-${widget._id}`}
          place="top"
          style={{ whiteSpace: "pre-line" }}
        />
        {/* Valor principal arriba en grande */}
        <div
          className={`metric-widget__primary-value ${
            isActive ? "metric-widget__primary-value--active" : ""
          }`}
          style={getConditionalStyle("primaryMetric", primaryMetricData.value)}
        >
          {formatValue(primaryMetricData.value, primaryMetricData.calculation)}
        </div>

        {/* Footer con título del widget y métrica secundaria */}
        <div
          className={`metric-widget__footer ${
            !secondaryMetricData ? "metric-widget__footer--centered" : ""
          }`}
        >
          <div className="metric-widget__title">{widget.title}</div>
          {secondaryMetricData && (
            <div
              className="metric-widget__secondary-value"
              style={getConditionalStyle(
                "secondaryMetric",
                secondaryMetricData.value
              )}
            >
              {formatValue(
                secondaryMetricData.value,
                secondaryMetricData.calculation
              )}
            </div>
          )}

          {/* Barra indicadora solo cuando está activo */}
          {isActive && <div className="metric-widget__active-indicator" />}
        </div>
      </div>
    </div>
  );
};
