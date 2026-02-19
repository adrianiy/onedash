import React, { useMemo } from "react";
import { BarChart } from "@/components/charts/BarChart";
import { Icon } from "@/common/Icon";
import { WidgetPlaceholder } from "../config/common";
import { WidgetSkeleton } from "./skeletons/WidgetSkeleton";
import type { ComparisonWidget as ComparisonWidgetType } from "@/types/widget";
import { useComparisonDataQuery } from "@/hooks/queries/useComparisonDataQuery";
import { useVariableStore } from "@/store/variableStore";
import { resolveMetricDefinition } from "@/utils/variableResolver";

interface ComparisonWidgetProps {
  widget: ComparisonWidgetType;
}

export const ComparisonWidget: React.FC<ComparisonWidgetProps> = ({
  widget,
}) => {
  const { config } = widget;
  const {
    dimension,
    primaryMetric,
    secondaryMetric,
    comparisonMetrics,
    visualizationType,
    widgetFilters,
  } = config;

  // Verificar si el widget está configurado adecuadamente
  const isConfigured = useMemo(() => {
    if (dimension === "custom") {
      return comparisonMetrics && comparisonMetrics.length > 0;
    }
    return !!(dimension && (primaryMetric || secondaryMetric));
  }, [dimension, primaryMetric, secondaryMetric, comparisonMetrics]);

  // Obtener datos del gráfico usando React Query
  const { data: comparisonData, isLoading } = useComparisonDataQuery(config, {
    products: widgetFilters?.products,
    sections: widgetFilters?.sections,
    dateRange: widgetFilters?.dateRange,
  });

  // Determinar el tipo de valor para el formateo
  const valueType = useMemo(() => {
    // Usar configuración de visualización si está disponible
    const visualization = config.visualization;
    if (visualization?.valueFormat && visualization.valueFormat !== "auto") {
      return visualization.valueFormat;
    }

    // Si no hay configuración específica, usar lógica automática
    if (!primaryMetric) return "default";

    // Determinar tipo basado en el cálculo
    if (primaryMetric.modifiers?.calculation === "crecimiento") {
      return "percent";
    }
    if (primaryMetric.modifiers?.calculation === "peso") {
      return "percent";
    }

    // Determinar tipo basado en el indicador
    if (typeof primaryMetric.indicator === "string") {
      if (primaryMetric.indicator === "importe") {
        return "currency";
      }
    }

    return "default";
  }, [primaryMetric, config.visualization]);

  // Mapeo de colores para primario/secundario
  const getColors = useMemo(() => {
    const visualization = config.visualization || {};

    // Si hay colores personalizados definidos
    if (visualization.colorMode === "custom") {
      return [
        visualization.positiveColor || "#10b981", // Verde por defecto para positivo
        visualization.negativeColor || "#ef4444", // Rojo por defecto para negativo
      ];
    }

    // Colores por defecto según tema
    return ["#10b981", "#ef4444"];
  }, [config.visualization]);

  // Mostrar placeholder si no está configurado
  if (!isConfigured) {
    return (
      <WidgetPlaceholder
        icon="git-compare-arrows"
        title="Comparación sin configurar"
        description="Selecciona al menos una métrica para empezar."
      />
    );
  }

  // Mostrar skeleton mientras carga
  if (isLoading) {
    return <WidgetSkeleton className="comparison-widget-skeleton" />;
  }

  // Si hay error o no hay datos
  if (!comparisonData || comparisonData.series.length === 0) {
    return (
      <WidgetPlaceholder
        icon="alert-circle"
        title="Error al cargar datos"
        description="No se pudieron obtener los datos de comparación"
      />
    );
  }

  // Obtener configuración de visualización
  const visualization = config.visualization || {};

  // Transformar datos para BarChart
  const chartData = {
    categories: comparisonData.categories,
    series: comparisonData.series.map((series) => ({
      name: series.name,
      data: series.data,
    })),
  };

  return (
    <div className="comparison-widget">
      <BarChart
        data={chartData}
        width="100%"
        height="100%"
        valueType={valueType}
        horizontal={false} // Comparaciones siempre verticales por defecto
        showLegend={visualization.showLegend !== false}
        showGrid={visualization.showGrid === true}
        showValues={visualization.showValues === true}
        showXAxis={visualization.showXAxis !== false}
        showYAxis={visualization.showYAxis !== false}
        rotateXLabels={false} // Sin rotación por defecto
        legendPosition={{
          vertical: "bottom",
          horizontal: "center",
        }}
        legendOrientation="horizontal"
        barWidth={0.3} // Ancho más grande para comparaciones
        barGap={8} // Mayor separación entre barras
        colorMode="custom" // Usar colores customizados
        seriesColors={comparisonData.series.reduce((acc, series, index) => {
          // Asignar colores específicos según el tipo de serie
          acc[series.name] =
            series.type === "primary"
              ? getColors[0] // Color positivo para primaria
              : getColors[1]; // Color negativo para secundaria
          return acc;
        }, {} as Record<string, string>)}
      />
    </div>
  );
};
