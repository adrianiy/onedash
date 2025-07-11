import React, { useMemo } from "react";
import { BarChart } from "@/components/charts/BarChart";
import { Icon } from "@/common/Icon";
import { WidgetPlaceholder } from "../common";
import type { ChartWidget as ChartWidgetType } from "@/types/widget";
import {
  generateChartData,
  type ChartSeriesData,
} from "@/utils/generateChartData";

interface ChartWidgetProps {
  widget: ChartWidgetType;
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({ widget }) => {
  const { config } = widget;
  const { chartType, series, xAxisDimension, widgetFilters } = config;

  // Verificar si el widget está configurado adecuadamente
  const isConfigured = useMemo(
    () => chartType && series && series.length > 0 && xAxisDimension,
    [chartType, series, xAxisDimension]
  );

  // Generar datos del gráfico dinámicamente
  const chartData = useMemo((): ChartSeriesData => {
    if (!isConfigured) return { categories: [], series: [] };
    const filters = {
      selectedProducts: widgetFilters?.products,
      selectedSections: widgetFilters?.sections,
      dateStart: widgetFilters?.dateRange?.start,
      dateEnd: widgetFilters?.dateRange?.end,
    };
    return generateChartData(xAxisDimension!, series!, filters);
  }, [isConfigured, xAxisDimension, series, widgetFilters]);

  // Determinar el tipo de valor para el formateo
  const valueType = useMemo(() => {
    // Usar configuración de visualización si está disponible
    const visualization = config.visualization;
    if (visualization?.valueFormat && visualization.valueFormat !== "auto") {
      return visualization.valueFormat;
    }

    // Si no hay configuración específica, usar lógica automática
    if (!series || series.length === 0) return "default";
    const primarySeries = series[0];

    // Determinar tipo basado en el cálculo
    if (primarySeries.modifiers?.calculation === "crecimiento") {
      return "percent";
    }
    if (primarySeries.modifiers?.calculation === "peso") {
      return "percent";
    }

    // Determinar tipo basado en el indicador
    if (typeof primarySeries.indicator === "string") {
      if (primarySeries.indicator === "importe") {
        return "currency";
      }
    }

    return "default";
  }, [series, config.visualization]);

  // Crear mapeo de colores basado en nombres de series
  const mappedSeriesColors = useMemo(() => {
    const mapped: Record<string, string> = {};
    const visualization = config.visualization || {};
    const originalColors = visualization.seriesColors || {};

    Object.entries(originalColors).forEach(([seriesId, color]) => {
      // Buscar el nombre de la serie por su ID
      const matchingSerie = series?.find((s) => s.id === seriesId);
      if (matchingSerie) {
        mapped[matchingSerie.title] = color;
      }
    });

    return mapped;
  }, [config.visualization, series]);

  // Mostrar placeholder si no está configurado
  if (!isConfigured) {
    return (
      <WidgetPlaceholder
        icon="chart-column"
        title="Gráfico sin configurar"
        description="Selecciona una dimensión y al menos una métrica para empezar."
      />
    );
  }

  if (chartType === "bar") {
    // Obtener configuración de visualización
    const visualization = config.visualization || {};

    return (
      <div className="chart-widget">
        <BarChart
          data={chartData}
          width="100%"
          height="100%"
          valueType={valueType}
          horizontal={visualization.chartOrientation === "horizontal"}
          showLegend={visualization.showLegend !== false}
          showGrid={visualization.showGrid === true}
          showValues={visualization.showValues === true}
          showXAxis={visualization.showXAxis !== false}
          showYAxis={visualization.showYAxis !== false}
          rotateXLabels={visualization.rotateXLabels === true}
          legendPosition={
            visualization.legendPosition || {
              vertical: "bottom",
              horizontal: "center",
            }
          }
          legendOrientation={visualization.legendOrientation}
          colorPalette={visualization.colorPalette || "default"}
          colorMode={visualization.colorMode || "default"}
          seriesColors={mappedSeriesColors}
        />
      </div>
    );
  }

  return (
    <div className="widget-error">
      <Icon name="alert-circle" size={24} />
      <span>Chart type not implemented</span>
    </div>
  );
};
