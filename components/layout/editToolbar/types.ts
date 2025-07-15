import type { Dashboard } from "@/types/dashboard";

export type SaveState = "idle" | "saving" | "success" | "error";

export interface SaveButtonProps {
  onSave: () => Promise<void>;
  saveState: SaveState;
  setSaveState: (state: SaveState) => void;
}

export interface SaveResult {
  needsConfirmation?: boolean;
  dashboard?: Dashboard | null;
  error?: unknown;
}

export interface ToolbarFileActionsProps {
  isDiscarding: boolean;
  hasUnsavedChanges: boolean;
  onSave: () => Promise<SaveResult | void>;
  onCloseEditing: () => Promise<void>;
}

export type ToolbarWidgetActionsProps = Record<string, never>;

export interface ConfigButtonProps {
  openConfigSidebar: () => void;
}

export interface ReadonlyDashboardHandlerProps {
  isOpen: boolean;
  dashboard: Dashboard | null;
  onConfirm: (newName: string) => Promise<void>;
  onCancel: () => void;
}

export interface WidgetCreatorHookReturn {
  addMetricWidget: () => void;
  addTableWidget: () => void;
  addChartWidget: () => void;
  addTextWidget: () => void;
  addSpecificChartWidget: (chartType: "bar" | "line" | "pie" | "scatter" | "area") => void;
  addComparisonWidget: () => void;
}

export interface DragAndDropHookReturn {
  handleMetricDragStart: (e: React.DragEvent) => void;
  handleTableDragStart: (e: React.DragEvent) => void;
  handleChartDragStart: (e: React.DragEvent) => void;
  handleTextDragStart: (e: React.DragEvent) => void;
  handleBarChartDragStart: (e: React.DragEvent) => void;
  handleLineChartDragStart: (e: React.DragEvent) => void;
  handlePieChartDragStart: (e: React.DragEvent) => void;
  handleAreaChartDragStart: (e: React.DragEvent) => void;
  handleComparisonDragStart: (e: React.DragEvent) => void;
}
