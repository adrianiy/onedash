/**
 * Punto de entrada para el componente MetricSelector
 * Exporta el componente principal y sus subcomponentes
 */

import MetricSelector from "./MetricSelector";
import "../../../../styles/metric-selector.css";

// Re-exportar el componente principal
export { MetricSelector };

// Exportar componentes individuales para uso específico si es necesario
export { CheckboxItem } from "./components/CheckboxItem";
export { TabsList } from "./components/TabsList";
export { SearchBar } from "./components/SearchBar";
export { MetricFooter } from "./components/MetricFooter";
export { ModifiersPanel } from "./components/ModifiersPanel";
export { MetricSidebar } from "./components/MetricSidebar";

// Exportar pestañas para uso específico si es necesario
export { IndicatorsTab } from "./tabs/IndicatorsTab";
export { TimerangeTab } from "./tabs/TimerangeTab";
export { CalculationsTab } from "./tabs/CalculationsTab";

// Exportar tipos
export type {
  MetricSelectorProps,
  SelectedModifiers,
  CheckboxItemProps,
  MetricTabProps,
  TabsListProps,
  MetricFooterProps,
  MetricSidebarProps,
  MetricModifiersPanelProps,
} from "./types";

// Exportar hooks
export { useMetricSelector } from "./hooks";

// Exportar componente principal como default
export default MetricSelector;
