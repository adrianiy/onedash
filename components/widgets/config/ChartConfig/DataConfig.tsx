import React from "react";
import type { ChartWidget } from "../../../../types/widget";
import { ChartSeriesConfig } from "./ChartSeriesConfig";
import { WidgetFiltersConfig } from "../TableConfig/WidgetFiltersConfig";
import { XAxisConfig } from "./XAxisConfig";

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
