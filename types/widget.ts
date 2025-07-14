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
  chartType: "bar"; // Fijo por ahora
  // Dimensión del eje X
  xAxisDimension?: "time" | "product" | "section" | "category";
  // Series del eje Y (métricas)
  series?: (MetricDefinition & { visible?: boolean })[];
  // Datos procesados (generados automáticamente)
  data: Array<{ name: string; value: number }>;
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
    showLegend?: boolean;
    showGrid?: boolean;
    showValues?: boolean;
    showXAxis?: boolean;
    showYAxis?: boolean;
    rotateXLabels?: boolean;
    chartOrientation?: "horizontal" | "vertical";
    barWidth?: number; // Ancho relativo de las barras (0.1 - 0.9)
    barGap?: number; // Espacio entre columnas (0 - 0.5)
    legendPosition?:
      | {
          vertical: "top" | "center" | "bottom";
          horizontal: "left" | "center" | "right";
        }
      | "top"
      | "bottom"
      | "left"
      | "right"; // Mantener compatibilidad con formato antiguo
    legendOrientation?: "horizontal" | "vertical";
    tooltipPosition?: "top" | "bottom" | "left" | "right";
    valueFormat?: "auto" | "currency" | "percent";
    filterDisplayMode?: "badges" | "info" | "hidden";
    colorMode?: "default" | "palette" | "custom";
    colorPalette?: "default" | "black" | "blue" | "violet" | "green";
    customColors?: string[];
    seriesColors?: { [seriesId: string]: string };
  };
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
  blockNoteContent?: Record<string, unknown>[]; // BlockNote document format (array of blocks)
  fontSize?: number;
  textAlign?: "left" | "center" | "right";
  editable?: boolean;
  showToolbar?: boolean;
  minHeight?: number;
}

export interface BaseWidget {
  _id: string;
  type: WidgetType;
  title: string;
  description?: string;
  dashboardId?: string; // ID del dashboard al que pertenece el widget
  createdAt: Date;
  updatedAt: Date;
  isConfigured?: boolean;
  events?: WidgetEvent[];
  persisted?: boolean; // Indica si el widget ya está guardado en la base de datos
  x?: number; // Posición en píxeles
  y?: number; // Posición en píxeles
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
