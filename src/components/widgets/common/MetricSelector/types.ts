import type {
  MetricDefinition,
  IndicatorType,
  ModifierOption,
} from "../../../../types/metricConfig";

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

export interface SelectedModifiers {
  saleType: string[];
  scope: string[];
  timeframe: string[];
  comparison: string[];
  calculation: string[];
}

export interface CheckboxItemProps {
  label: string;
  value: string;
  checked: boolean;
  onChange: (value: string, isChecked: boolean) => void;
  disabled?: boolean;
  hasDefaultTip?: boolean;
  defaultTipText?: string;
}

export interface MetricTabProps {
  searchQuery: string;
  selectedIndicators: IndicatorType[];
  selectedModifiers: SelectedModifiers;
  mode: "single" | "multiple";
  handleIndicatorSelect?: (
    indicator: IndicatorType,
    isChecked: boolean
  ) => void;
  handleModifierSelect?: (
    type: string,
    value: string,
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
  selectedIndicators: IndicatorType[];
  getMissingRequiredModifiers: (indicator: IndicatorType) => string[];
  getModifierLabel: (modKey: string, modValue: any) => string;
}

export interface MetricModifiersPanelProps {
  isPanelVisible: boolean;
  activeTab: string;
  selectedIndicators: IndicatorType[];
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
