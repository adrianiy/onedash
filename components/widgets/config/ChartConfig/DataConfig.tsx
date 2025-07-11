import { WidgetFiltersConfig } from "@/config/common/controls/WidgetFiltersConfig";
import type { ChartWidget } from "@/types/widget";
import React from "react";
import { ChartSeriesConfig } from "./data/ChartSeriesConfig";
import { XAxisConfig } from "./data/XAxisConfig";

interface DataConfigProps {
  widget: ChartWidget;
}

export const DataConfig: React.FC<DataConfigProps> = ({ widget }) => {
  return (
    <div className="chart-data-config">
      <XAxisConfig widget={widget} />
      <ChartSeriesConfig widget={widget} />
      <WidgetFiltersConfig widget={widget} />
    </div>
  );
};
