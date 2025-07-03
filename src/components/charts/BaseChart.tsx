import React from "react";
import type { EChartsOption } from "echarts";
import { useECharts } from "../../hooks/useECharts";

interface BaseChartProps {
  option: EChartsOption;
  width?: string | number;
  height?: string | number;
  className?: string;
  theme?: "light" | "dark";
  onChartReady?: (chart: any) => void;
}

export const BaseChart: React.FC<BaseChartProps> = ({
  option,
  width = "100%",
  height = "300px",
  className = "",
  theme,
  onChartReady,
}) => {
  const { chartRef } = useECharts({
    option,
    theme,
    onChartReady,
  });

  return (
    <div
      ref={chartRef}
      className={className}
      style={{
        width,
        height,
      }}
    />
  );
};
