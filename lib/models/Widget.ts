import mongoose, { Schema } from "mongoose";
import { IUser } from "./User";
import { IDashboard } from "./Dashboard";

export type WidgetType = "chart" | "metric" | "table" | "text";
export type ChartType = "bar" | "line" | "pie" | "scatter" | "area";

// Evento para widgets
export interface WidgetEvent {
  trigger: "click";
  setVariables?: Record<string, unknown>;
}

// Interfaces para configuraciones específicas de widget
export interface ChartWidgetConfig {
  chartType: ChartType;
  dataSource?: string;
  data: Array<{ name: string; value: number }>;
  options: Record<string, unknown>;
}

// Definición de métricas para evitar 'any'
export interface MetricDefinition {
  id: string;
  name: string;
  aggregation?: string;
  formula?: string;
  format?: string;
  [key: string]: unknown;
}

export interface MetricWidgetConfig {
  size?: "small" | "medium" | "large";
  alignment?: "left" | "center" | "right";
  primaryMetric?: MetricDefinition;
  secondaryMetric?: MetricDefinition;
  visualization?: Record<string, unknown>;
}

export interface TableColumn {
  id: string;
  name: string;
  visible?: boolean;
  format?: string;
  [key: string]: unknown;
}

export interface ConditionalFormatRule {
  id: string;
  columnId: string;
  columnName: string;
  condition: string;
  value: string | number;
  style: Record<string, unknown>;
  isEnabled: boolean;
}

export interface TableWidgetConfig {
  columns: TableColumn[];
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
  visualization?: Record<string, unknown>;
  conditionalFormatting?: ConditionalFormatRule[];
}

export interface TextWidgetConfig {
  content: string;
  fontSize?: number;
  textAlign?: "left" | "center" | "right";
}

export interface IWidget {
  _id?: string;
  type: WidgetType;
  title: string;
  description?: string;
  config:
    | ChartWidgetConfig
    | MetricWidgetConfig
    | TableWidgetConfig
    | TextWidgetConfig;
  dashboardId?: string | IDashboard;
  userId?: string | IUser;
  events?: WidgetEvent[];
  isConfigured?: boolean;
  persisted?: boolean; // Indica si el widget ya está guardado en la base de datos
  createdAt: Date;
  updatedAt: Date;
}

const WidgetSchema = new Schema<IWidget>(
  {
    type: {
      type: String,
      enum: ["chart", "metric", "table", "text"],
      required: [true, "El tipo de widget es obligatorio"],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, "El título no puede tener más de 100 caracteres"],
      default: "",
    },
    description: {
      type: String,
      maxlength: [500, "La descripción no puede tener más de 500 caracteres"],
    },
    config: {
      type: Schema.Types.Mixed,
      default: {},
    },
    dashboardId: {
      type: Schema.Types.ObjectId,
      ref: "Dashboard",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    events: {
      type: [
        {
          trigger: String,
          setVariables: Schema.Types.Mixed,
        },
      ],
      default: [],
    },
    isConfigured: {
      type: Boolean,
      default: false,
    },
    persisted: {
      type: Boolean,
      default: true, // Los widgets que vienen de la BD están persistidos por defecto
    },
  },
  {
    timestamps: true,
  }
);

// Evitar registrar el modelo múltiples veces en desarrollo
export default mongoose.models.Widget ||
  mongoose.model<IWidget>("Widget", WidgetSchema);
