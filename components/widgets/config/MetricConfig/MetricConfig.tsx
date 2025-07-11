import React from "react";
import type { Widget, MetricWidget } from "@/types/widget";
import { BaseWidgetConfig } from "../base";

interface MetricConfigProps {
  widget: Widget;
}

export const MetricConfig: React.FC<MetricConfigProps> = ({ widget }) => {
  // Asegúrate de que es una métrica
  if (widget.type !== "metric") {
    console.error("Widget no es de tipo métrica", widget);
    return null;
  }

  const metricWidget = widget as MetricWidget;

  return (
    <div className="metric-config">
      <BaseWidgetConfig widget={metricWidget} className="metric-config__base" />
    </div>
  );
};
