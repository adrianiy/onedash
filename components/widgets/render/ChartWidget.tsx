import React from "react";
import { BarChart } from "../../charts/BarChart";
import { Icon } from "../../common/Icon";
import type { ChartWidget as ChartWidgetType } from "../../../types/widget";

interface ChartWidgetProps {
  widget: ChartWidgetType;
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({ widget }) => {
  if (widget.config.chartType === "bar") {
    return (
      <div className="chart-widget">
        <BarChart data={widget.config.data} title="" height="100%" />
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
