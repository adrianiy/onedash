import type { MetricDefinition } from "../../../../types/metricConfig";
import type { IconName } from "../../../common/Icon";

export interface MetricSelectorProps {
  // Modo de selección
  mode: "single" | "multiple";

  // Para modo single
  selectedMetric?: MetricDefinition;
  onSelectMetric?: (metric: MetricDefinition) => void;

  // Para modo multiple
  selectedMetrics?: MetricDefinition[];
  onSelectMetrics?: (metrics: MetricDefinition[]) => void;

  // Configuración opcional
  maxSelections?: number;
  initialTab?: string;

  // Función para cerrar el selector
  onClose?: () => void;
}

export type SelectedModifiers = Record<string, string[]>;

import type { VariableBinding } from "../../../../types/metricConfig";

export interface CheckboxItemProps {
  label: string;
  value: string | VariableBinding;
  checked: boolean;
  onChange: (value: string | VariableBinding, isChecked: boolean) => void;
  disabled?: boolean;
  hasDefaultTip?: boolean;
  defaultTipText?: string;
  mode?: "single" | "multiple";
  radioGroupName?: string;
  // New props for dynamic options
  icon?: IconName;
  iconColor?: string;
  isDynamic?: boolean;
}

export interface MetricTabProps {
  searchQuery: string;
  selectedIndicators: (string | VariableBinding)[];
  selectedModifiers: SelectedModifiers;
  mode: "single" | "multiple";
  handleIndicatorSelect?: (
    indicator: string | VariableBinding,
    isChecked: boolean
  ) => void;
  handleModifierSelect?: (
    type: string,
    value: string | VariableBinding,
    isChecked: boolean
  ) => void;
  customValues?: Record<string, unknown>;
  handleCustomValueChange?: (key: string, value: unknown) => void;
  isPanelVisible?: boolean;
  // Funciones para valores por defecto
  willApplyDefaultValue?: (modifier: string) => boolean;
  getDefaultValue?: (modifier: string) => string | null;
  getDefaultValueLabel?: (modifier: string) => string;
}

export interface TabsListProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  indicatorsCount: number;
  timerangeCount: number;
  calculationsCount: number;
  isTabRequired: (tab: string) => boolean;
  isTabComplete: (tab: string) => boolean;
}

export interface MetricFooterProps {
  showSidebar: boolean;
  toggleSidebar: () => void;
  generatedMetricsCount: number;
  isButtonEnabled: boolean;
  handleSelect: () => void;
  mode: "single" | "multiple";
  generateButtonHelpMessage: () => string;
}

export interface MetricSidebarProps {
  showSidebar: boolean;
  toggleSidebar: () => void;
  generatedMetrics: MetricDefinition[];
  selectedIndicators: string[];
  getMissingRequiredModifiers: (indicator: string) => string[];
  getModifierLabel: (modKey: string, modValue: unknown) => string;
}

export interface MetricModifiersPanelProps {
  isPanelVisible: boolean;
  activeTab: string;
  selectedIndicators: string[];
  selectedModifiers: SelectedModifiers;
  isCompatibleModifier: (modifier: string) => boolean;
  isStrictlyRequired: (modifier: string) => boolean;
  handleModifierSelect: (
    type: string,
    value: string,
    isChecked: boolean
  ) => void;
  mode: "single" | "multiple";
  customValues: Record<string, unknown>;
  handleCustomValueChange: (key: string, value: unknown) => void;
  willApplyDefaultValue: (modifier: string) => boolean;
  getDefaultValue: (modifier: string) => string | null;
}
