import { useConditionalFormatting } from "@/hooks";
import { useMetricDataQuery } from "@/hooks/queries";
import { useVariableOperations } from "@/hooks/useVariableOperations";
import { useDashboardStore } from "@/store/dashboardStore";
import { useVariableStore } from "@/store/variableStore";
import { resolveMetricDefinition } from "@/utils/variableResolver";
import type { MetricWidget as MetricWidgetType } from "@/types/widget";
import { formatValue } from "@/utils/format";
import React, { useMemo, useState } from "react";
import { WidgetFiltersDisplay, WidgetPlaceholder } from "../config/common";
import { WidgetSkeleton } from "./skeletons/WidgetSkeleton";

interface MetricWidgetProps {
  widget: MetricWidgetType;
}

export const MetricWidget: React.FC<MetricWidgetProps> = ({ widget }) => {
  const { currentDashboard } = useDashboardStore();
  const { persistMultiple } = useVariableOperations({
    dashboardId: currentDashboard?._id || null,
    enablePersistence: true,
  });
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
  const allVariables = useVariableStore((state) => state.variables);
  const isActive = useMemo(() => {
    if (!isClickable || !clickEvent || !clickEvent.setVariables) return false;

    // Verificar si alguna de las variables del evento coincide con el estado actual
    return Object.entries(clickEvent.setVariables).some(
      ([variableId, value]) => {
        return allVariables[variableId] === value;
      }
    );
  }, [isClickable, clickEvent, allVariables]);

  // Función para manejar el click en el widget
  const handleWidgetClick = () => {
    if (!isClickable || !clickEvent || !clickEvent.setVariables) return;

    // Activar animación de click
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 200);

    // Actualizar y persistir variables
    persistMultiple(clickEvent.setVariables);
  };

  // Usar las variables para resolver las métricas
  const resolvedPrimaryMetric = useMemo(
    () =>
      widget.config.primaryMetric
        ? resolveMetricDefinition(widget.config.primaryMetric, allVariables)
        : undefined,
    [widget.config.primaryMetric, allVariables]
  );

  const resolvedSecondaryMetric = useMemo(
    () =>
      widget.config.secondaryMetric
        ? resolveMetricDefinition(widget.config.secondaryMetric, allVariables)
        : undefined,
    [widget.config.secondaryMetric, allVariables]
  );

  // Obtener datos de las métricas desde la API usando React Query
  const { data: primaryMetricData, isLoading: isPrimaryLoading } =
    useMetricDataQuery(resolvedPrimaryMetric, widgetFilters);

  const { data: secondaryMetricData } = useMetricDataQuery(
    resolvedSecondaryMetric,
    widgetFilters
  );

  // Use common conditional formatting hook
  const { getConditionalStyle } = useConditionalFormatting(conditionalFormats);

  // Si no hay métricas configuradas, mostrar placeholder
  if (!resolvedPrimaryMetric) {
    return (
      <WidgetPlaceholder
        icon="target"
        title="Métrica sin configurar"
        description="Configura una métrica para mostrar datos"
      />
    );
  }

  // Si están cargando, mostrar skeleton
  if (isPrimaryLoading) {
    return <WidgetSkeleton className={`metric-widget-skeleton--${size}`} />;
  }

  // Si no hay datos, mostrar mensaje de error
  if (!primaryMetricData) {
    return (
      <WidgetPlaceholder
        icon="alert-circle"
        title="Error al cargar datos"
        description="No se pudieron obtener los datos de la métrica"
      />
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
        <WidgetFiltersDisplay
          filters={{
            products: widgetFilters.products,
            sections: widgetFilters.sections,
            dateRange: widgetFilters.dateRange
              ? {
                  start: widgetFilters.dateRange.start || undefined,
                  end: widgetFilters.dateRange.end || undefined,
                }
              : undefined,
          }}
          mode={filterDisplayMode}
          widgetId={widget._id}
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
            !resolvedSecondaryMetric ? "metric-widget__footer--centered" : ""
          }`}
        >
          <div className="metric-widget__title">{widget.title}</div>
          {resolvedSecondaryMetric && secondaryMetricData && (
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
