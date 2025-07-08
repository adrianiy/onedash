import type { MetricDefinition } from "./metricConfig";

export type WidgetType = "chart" | "metric" | "table" | "text";
export type ChartType = "bar" | "line" | "pie" | "scatter" | "area";

export interface WidgetEvent {
  trigger: "click";
  setVariables?: Record<string, unknown>;
}

export interface ConditionalFormatRule {
  id: string;
  columnId: string;
  columnName: string; // Guardar el nombre para mostrarlo fácilmente
  condition: "greater_than" | "less_than" | "equals" | "contains";
  value: string | number;
  style: {
    backgroundColor: string;
    textColor: string;
    fontWeight?: "bold" | "normal";
    fontStyle?: "italic" | "normal";
  };
  isEnabled: boolean;
}

export interface ChartWidgetConfig {
  chartType: ChartType;
  dataSource?: string;
  data: Array<{ name: string; value: number }>;
  options: Record<string, unknown>;
}

export interface MetricWidgetConfig {
  // Métricas principales
  primaryMetric?: MetricDefinition;
  secondaryMetric?: MetricDefinition;

  // Tamaño visual (por defecto medium)
  size?: "small" | "medium" | "large";

  // Alineación del contenido (por defecto center)
  alignment?: "left" | "center" | "right";

  // Filtros específicos del widget
  widgetFilters?: {
    products?: string[];
    sections?: string[];
    dateRange?: {
      start: string | null;
      end: string | null;
    };
  };

  // Configuración visual
  visualization?: {
    showTitle?: boolean;
    conditionalFormats?: ConditionalFormatRule[];
    filterDisplayMode?: "badges" | "info" | "hidden";
  };

  // Compatibilidad con mock actual (deprecado)
  value?: number | string;
  unit?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: number;
}

export interface TableWidgetConfig {
  columns: (MetricDefinition & { visible?: boolean })[];
  data: Record<string, unknown>[];
  pagination?: boolean;
  breakdownLevels?: string[];
  dataSource?: string;
  widgetFilters?: {
    products?: string[];
    sections?: string[];
    dateRange?: {
      start: string | null;
      end: string | null;
    };
  };
  visualization?: {
    showTitle?: boolean;
    compact?: boolean;
    showBorders?: boolean;
    alternateRowColors?: boolean;
    showPagination?: boolean;
    showHeaderBackground?: boolean;
    textAlign?: "left" | "center" | "right";
    totalRow?: "top" | "bottom" | "none";
    filterDisplayMode?: "badges" | "info" | "hidden";
    conditionalFormats?: ConditionalFormatRule[];
  };
  conditionalFormatting?: {
    columnId: string;
    conditions: Array<{
      operator: ">" | "<" | "=" | ">=" | "<=";
      value: number;
      style: {
        color?: string;
        backgroundColor?: string;
        fontWeight?: string;
      };
    }>;
  }[];
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
  isConfigured?: boolean;
  events?: WidgetEvent[];
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
