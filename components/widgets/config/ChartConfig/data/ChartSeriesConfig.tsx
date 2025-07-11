import { GenericMetricListConfig } from "@/components/widgets/config/common/controls/GenericMetricListConfig";
import { useWidgetStore } from "@/store/widgetStore";
import type { MetricDefinition } from "@/types/metricConfig";
import type { ChartWidgetConfig, Widget } from "@/types/widget";
import React from "react";
import { SeriesItemAdapter } from "./SeriesItemAdapter";

interface ChartSeriesConfigProps {
  widget: Widget;
}

export const ChartSeriesConfig: React.FC<ChartSeriesConfigProps> = ({
  widget,
}) => {
  const { updateWidget } = useWidgetStore();

  // Verificar que es un widget de chart y obtener las series
  const chartConfig = widget.type === "chart" ? widget.config : { series: [] };
  const series = (chartConfig as ChartWidgetConfig).series || [];

  // Función para actualizar las series en el widget
  const handleUpdateSeries = (updatedSeries: MetricDefinition[]) => {
    if (widget.type === "chart") {
      updateWidget(widget._id, {
        config: {
          ...widget.config,
          series: updatedSeries,
        },
      });
    }
  };

  // Configuración de labels para series
  const seriesLabels = {
    title: "SERIES (EJE Y)",
    addText: "Añadir series",
    itemName: "serie",
  };

  return (
    <GenericMetricListConfig
      items={series}
      onUpdate={handleUpdateSeries}
      labels={seriesLabels}
      className="series-config config-panel"
      itemComponent={SeriesItemAdapter}
    />
  );
};
