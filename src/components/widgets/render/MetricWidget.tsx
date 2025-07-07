import React, { useMemo } from "react";
import { Icon } from "../../common/Icon";
import type { MetricWidget as MetricWidgetType } from "../../../types/widget";
import { formatValue } from "../../../utils/format";

interface MetricWidgetProps {
  widget: MetricWidgetType;
}

export const MetricWidget: React.FC<MetricWidgetProps> = ({ widget }) => {
  const size = widget.config.size || "medium";
  const alignment = widget.config.alignment || "center";
  const conditionalFormats =
    widget.config.visualization?.conditionalFormats || [];

  // Generar datos simulados para las métricas
  const metricData = useMemo(() => {
    const generateValue = (calculation: string) => {
      // Para crecimientos, generar valores entre -50% y +150%
      if (calculation === "crecimiento" || calculation === "peso") {
        return Math.floor(Math.random() * 200 - 50); // -50 a +150
      }
      // Para otros valores, generar números normales
      return Math.floor(Math.random() * 1000000) + 10000;
    };

    return {
      primary: widget.config.primaryMetric
        ? {
            value: generateValue(
              widget.config.primaryMetric.modifiers.calculation || "valor"
            ),
            label: widget.config.primaryMetric.title,
            calculation:
              widget.config.primaryMetric.modifiers.calculation || "valor",
          }
        : null,
      secondary: widget.config.secondaryMetric
        ? {
            value: generateValue(
              widget.config.secondaryMetric.modifiers.calculation || "valor"
            ),
            label: widget.config.secondaryMetric.title,
            calculation:
              widget.config.secondaryMetric.modifiers.calculation || "valor",
          }
        : null,
    };
  }, [widget.config.primaryMetric, widget.config.secondaryMetric]);

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

  // Si no hay métricas configuradas, mostrar placeholder
  if (!metricData.primary) {
    return (
      <div className="widget-placeholder">
        <Icon name="target" size={48} />
        <h3>Métrica sin configurar</h3>
        <div className="placeholder-tip">
          <Icon name="info" size={16} />
          <p>Configura una métrica primaria para mostrar datos</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`metric-widget-wrapper metric-widget-wrapper--${alignment}`}
    >
      <div className={`metric-widget metric-widget--${size} `}>
        {/* Valor principal arriba en grande */}
        <div
          className="metric-widget__primary-value"
          style={getConditionalStyle("primaryMetric", metricData.primary.value)}
        >
          {formatValue(
            metricData.primary.value,
            metricData.primary.calculation
          )}
        </div>

        {/* Footer con título del widget y métrica secundaria */}
        <div className="metric-widget__footer">
          <div className="metric-widget__title">{widget.title}</div>
          {metricData.secondary && (
            <div
              className="metric-widget__secondary-value"
              style={getConditionalStyle(
                "secondaryMetric",
                metricData.secondary.value
              )}
            >
              {formatValue(
                metricData.secondary.value,
                metricData.secondary.calculation
              )}
            </div>
          )}
        </div>

        {/* Compatibilidad con mock actual (deprecado) */}
        {!widget.config.primaryMetric && widget.config.value && (
          <div className="metric-widget__legacy">
            <div className="metric-widget__value">
              {widget.config.value}
              {widget.config.unit && (
                <span className="metric-widget__unit">
                  {widget.config.unit}
                </span>
              )}
            </div>
            {widget.config.trend && (
              <div
                className={`metric-widget__trend metric-widget__trend--${widget.config.trend}`}
              >
                <Icon name={`trending-${widget.config.trend}`} size={16} />
                {widget.config.trendValue && (
                  <span>{widget.config.trendValue}%</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
