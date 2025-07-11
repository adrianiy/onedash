import type { WidgetType } from "@/types/widget";
import type { BaseConfigTab } from "@/components/widgets/config/base/types";

// Import wrapper components
import {
  ChartDataConfigWrapper,
  ChartVisualizationConfigWrapper,
  ChartEventsConfigWrapper,
  MetricDataConfigWrapper,
  MetricVisualizationConfigWrapper,
  MetricEventsConfigWrapper,
  TableDataConfigWrapper,
  TableVisualizationConfigWrapper,
  TableEventsConfigWrapper,
} from "./wrappers";

// Registry mapping widget types to their tab configurations
const TAB_REGISTRY: Record<WidgetType, BaseConfigTab[]> = {
  chart: [
    {
      id: "data",
      label: "Datos",
      component: ChartDataConfigWrapper,
    },
    {
      id: "visualization",
      label: "Vista",
      component: ChartVisualizationConfigWrapper,
    },
    {
      id: "events",
      label: "Eventos",
      component: ChartEventsConfigWrapper,
    },
  ],
  metric: [
    {
      id: "data",
      label: "Datos",
      component: MetricDataConfigWrapper,
    },
    {
      id: "visualization",
      label: "Vista",
      component: MetricVisualizationConfigWrapper,
    },
    {
      id: "events",
      label: "Eventos",
      component: MetricEventsConfigWrapper,
    },
  ],
  table: [
    {
      id: "data",
      label: "Datos",
      component: TableDataConfigWrapper,
    },
    {
      id: "visualization",
      label: "Vista",
      component: TableVisualizationConfigWrapper,
    },
    {
      id: "events",
      label: "Eventos",
      component: TableEventsConfigWrapper,
    },
  ],
  text: [
    // Text widgets don't have configuration tabs yet
  ],
};

export const getTabsForWidget = (widgetType: WidgetType): BaseConfigTab[] => {
  return TAB_REGISTRY[widgetType] || [];
};

export const registerTab = (
  widgetType: WidgetType,
  tab: BaseConfigTab
): void => {
  if (!TAB_REGISTRY[widgetType]) {
    TAB_REGISTRY[widgetType] = [];
  }
  TAB_REGISTRY[widgetType].push(tab);
};

export const replaceTabsForWidget = (
  widgetType: WidgetType,
  tabs: BaseConfigTab[]
): void => {
  TAB_REGISTRY[widgetType] = tabs;
};
