import type { Widget } from "@/types/widget";

export interface BaseConfigTab {
  id: string;
  label: string;
  component: React.ComponentType<{ widget: Widget }>;
  isEnabled?: (widget: Widget) => boolean;
}

export interface BaseConfigTabsProps {
  widget: Widget;
  tabs: BaseConfigTab[];
  defaultActiveTab?: string;
  className?: string;
}

export interface WidgetConfigRegistry {
  [widgetType: string]: {
    data: React.ComponentType<{ widget: Widget }>;
    visualization: React.ComponentType<{ widget: Widget }>;
    events: React.ComponentType<{ widget: Widget }>;
  };
}

export interface UseTabNavigationOptions {
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
}

export interface UseWidgetConfigOptions {
  widget: Widget;
  onUpdate?: (widgetId: string, updates: Partial<Widget>) => void;
}
