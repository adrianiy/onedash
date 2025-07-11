import React from "react";
import type { Widget, ChartWidget } from "@/types/widget";
import { BaseWidgetConfig } from "../base";

interface ChartConfigProps {
  widget: Widget;
}

export const ChartConfig: React.FC<ChartConfigProps> = ({ widget }) => {
  // Asegúrate de que es un gráfico
  if (widget.type !== "chart") {
    console.error("Widget no es de tipo gráfico", widget);
    return null;
  }

  const chartWidget = widget as ChartWidget;

  return (
    <div className="chart-config">
      <BaseWidgetConfig widget={chartWidget} className="chart-config__base" />
    </div>
  );
};
