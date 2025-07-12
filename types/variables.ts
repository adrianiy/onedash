// Central variable types and definitions

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type VariableValue = any;

export interface VariableDefinition {
  key: string;
  value: VariableValue;
  dashboardId?: string;
}

export interface DefaultVariables {
  indicator: VariableValue;
  saleType: VariableValue;
  timeframe: VariableValue;
  comparison: VariableValue;
  scope: VariableValue;
  // Filter variables
  dateStart: string;
  dateEnd: string;
  selectedProducts: string[];
  selectedSections: string[];
}

export type VariableUpdates = Record<string, VariableValue>;
