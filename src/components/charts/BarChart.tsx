import React from "react";
import type { EChartsOption } from "echarts";
import { BaseChart } from "./BaseChart";

interface BarChartData {
  name: string;
  value: number;
}

interface BarChartProps {
  data: BarChartData[];
  title?: string;
  width?: string | number;
  height?: string | number;
  className?: string;
  theme?: "light" | "dark";
  colors?: string[];
  horizontal?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  width,
  height,
  className,
  theme,
  colors = ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de"],
  horizontal = false,
}) => {
  const option: EChartsOption = {
    title: title
      ? {
          text: title,
          left: "center",
        }
      : undefined,
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: horizontal
      ? {
          type: "value",
        }
      : {
          type: "category",
          data: data.map((item) => item.name),
          axisTick: {
            alignWithLabel: true,
          },
        },
    yAxis: horizontal
      ? {
          type: "category",
          data: data.map((item) => item.name),
        }
      : {
          type: "value",
        },
    series: [
      {
        name: title || "Data",
        type: "bar",
        data: data.map((item) => item.value),
        itemStyle: {
          color: (params: any) => colors[params.dataIndex % colors.length],
        },
      },
    ],
  };

  return (
    <BaseChart
      option={option}
      width={width}
      height={height}
      className={className}
      theme={theme}
    />
  );
};
