import type { EChartsOption, ECharts } from "echarts";

export interface ChartData {
  labels: string[];
  datasets: Array<{
    name: string;
    data: number[];
    color?: string;
  }>;
}

export interface ChartConfig {
  type: "bar" | "line" | "pie" | "scatter" | "area";
  data: ChartData;
  options?: Partial<EChartsOption>;
  responsive?: boolean;
  theme?: "light" | "dark";
}

export interface ChartTheme {
  backgroundColor: string;
  textColor: string;
  gridColor: string;
  axisColor: string;
  colors: string[];
}

export interface ChartProps {
  config: ChartConfig;
  width?: string | number;
  height?: string | number;
  className?: string;
  onChartReady?: (chart: ECharts) => void;
}
