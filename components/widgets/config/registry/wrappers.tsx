import React from "react";
import type {
  Widget,
  ChartWidget,
  MetricWidget,
} from "@/types/widget";

// Import existing tab components
import { DataConfig as ChartDataConfig } from "@/config/ChartConfig/DataConfig";
import { VisualizationConfig as ChartVisualizationConfig } from "@/config/ChartConfig/VisualizationConfig";
import { EventsConfig as ChartEventsConfig } from "@/config/ChartConfig/EventsConfig";

import { DataConfig as MetricDataConfig } from "@/config/MetricConfig/DataConfig";
import { VisualizationConfig as MetricVisualizationConfig } from "@/config/MetricConfig/VisualizationConfig";
import { EventsConfig as MetricEventsConfig } from "@/config/MetricConfig/EventsConfig";

import { DataConfig as TableDataConfig } from "@/config/TableConfig/DataConfig";
import { VisualizationConfig as TableVisualizationConfig } from "@/config/TableConfig/VisualizationConfig";
import { EventsConfig as TableEventsConfig } from "@/config/TableConfig/EventsConfig";

// Chart wrappers
export const ChartDataConfigWrapper: React.FC<{ widget: Widget }> = ({
  widget,
}) => {
  if (widget.type !== "chart") return null;
  return <ChartDataConfig widget={widget as ChartWidget} />;
};

export const ChartVisualizationConfigWrapper: React.FC<{ widget: Widget }> = ({
  widget,
}) => {
  if (widget.type !== "chart") return null;
  return <ChartVisualizationConfig widget={widget as ChartWidget} />;
};

export const ChartEventsConfigWrapper: React.FC<{ widget: Widget }> = ({
  widget,
}) => {
  if (widget.type !== "chart") return null;
  return <ChartEventsConfig widget={widget as ChartWidget} />;
};

// Metric wrappers
export const MetricDataConfigWrapper: React.FC<{ widget: Widget }> = ({
  widget,
}) => {
  if (widget.type !== "metric") return null;
  return <MetricDataConfig widget={widget as MetricWidget} />;
};

export const MetricVisualizationConfigWrapper: React.FC<{ widget: Widget }> = ({
  widget,
}) => {
  if (widget.type !== "metric") return null;
  return <MetricVisualizationConfig widget={widget as MetricWidget} />;
};

export const MetricEventsConfigWrapper: React.FC<{ widget: Widget }> = ({
  widget,
}) => {
  if (widget.type !== "metric") return null;
  return <MetricEventsConfig widget={widget as MetricWidget} />;
};

// Table wrappers
export const TableDataConfigWrapper: React.FC<{ widget: Widget }> = ({
  widget,
}) => {
  if (widget.type !== "table") return null;
  return <TableDataConfig widget={widget} />;
};

export const TableVisualizationConfigWrapper: React.FC<{ widget: Widget }> = ({
  widget,
}) => {
  if (widget.type !== "table") return null;
  return <TableVisualizationConfig widget={widget} />;
};

export const TableEventsConfigWrapper: React.FC<{ widget: Widget }> = ({
  widget,
}) => {
  if (widget.type !== "table") return null;
  return <TableEventsConfig widget={widget} />;
};
