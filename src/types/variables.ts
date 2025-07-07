export type VariableType =
  | "indicator"
  | "sale_type"
  | "scope"
  | "timeframe"
  | "comparison"
  | "calculation"
  | "date_range"
  | "custom";

export interface DashboardVariable {
  id: string;
  name: string;
  value: unknown;
  type: VariableType;
  isVisible: boolean; // Aparece en la barra de filtros
  createdAt: Date;
  updatedAt: Date;
}

export interface WidgetEvent {
  id: string;
  trigger: "click";
  setVariables: Record<string, unknown>; // Variable ID → Valor
}
