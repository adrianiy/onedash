import React from "react";
import type { Widget } from "@/types/widget";
import { ChartSeriesConfigWrapper } from "./ChartSeriesConfigWrapper";

interface ChartSeriesConfigProps {
  widget: Widget;
}

export const ChartSeriesConfig: React.FC<ChartSeriesConfigProps> = ({
  widget,
}) => {
  return <ChartSeriesConfigWrapper widget={widget} />;
};
