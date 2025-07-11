import React from "react";
import type { ChartWidget } from "../../../../types/widget";
import { ChartConfigTabs } from "./ChartConfigTabs";

interface ChartConfigProps {
  widget: ChartWidget;
}

export const ChartConfig: React.FC<ChartConfigProps> = ({ widget }) => {
  return (
    <div className="chart-config">
      <ChartConfigTabs widget={widget} />
    </div>
  );
};
