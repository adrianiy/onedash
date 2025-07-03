export type WidgetType = "chart" | "metric" | "table" | "text";
export type ChartType = "bar" | "line" | "pie" | "scatter" | "area";

export interface ChartWidgetConfig {
  chartType: ChartType;
  dataSource?: string;
  data: Array<{ name: string; value: number }>;
  options: Record<string, unknown>;
}

export interface MetricWidgetConfig {
  value: number | string;
  unit?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: number;
}

export interface TableWidgetConfig {
  columns: Array<{
    key: string;
    title: string;
    width?: number;
  }>;
  data: Record<string, unknown>[];
  pagination?: boolean;
}

export interface TextWidgetConfig {
  content: string;
  fontSize?: number;
  textAlign?: "left" | "center" | "right";
}

export interface BaseWidget {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChartWidget extends BaseWidget {
  type: "chart";
  config: ChartWidgetConfig;
}

export interface MetricWidget extends BaseWidget {
  type: "metric";
  config: MetricWidgetConfig;
}

export interface TableWidget extends BaseWidget {
  type: "table";
  config: TableWidgetConfig;
}

export interface TextWidget extends BaseWidget {
  type: "text";
  config: TextWidgetConfig;
}

export type Widget = ChartWidget | MetricWidget | TableWidget | TextWidget;
