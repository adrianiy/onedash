import User, { IUser } from "./User";
import Dashboard, { IDashboard, DashboardLayout } from "./Dashboard";
import Widget, {
  IWidget,
  WidgetType,
  ChartType,
  WidgetEvent,
  ChartWidgetConfig,
  MetricWidgetConfig,
  TableWidgetConfig,
  TextWidgetConfig,
  MetricDefinition,
  TableColumn,
  ConditionalFormatRule,
} from "./Widget";
import Variable, { IVariable, VariableValue } from "./Variable";

// Exportar todos los modelos
export {
  // Modelos de Mongoose
  User,
  Dashboard,
  Widget,
  Variable,
};

// Exportar tipos por separado
export type {
  // Interfaces
  IUser,
  IDashboard,
  IWidget,
  IVariable,

  // Tipos
  WidgetType,
  ChartType,
  WidgetEvent,
  DashboardLayout,
  VariableValue,

  // Configuraciones de widgets
  ChartWidgetConfig,
  MetricWidgetConfig,
  TableWidgetConfig,
  TextWidgetConfig,

  // Tipos auxiliares
  MetricDefinition,
  TableColumn,
  ConditionalFormatRule,
};

// Exportación por defecto para importación conveniente
export default {
  User,
  Dashboard,
  Widget,
  Variable,
};
