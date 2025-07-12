import type { Widget } from "@/types/widget";

export interface UseWidgetConfigOptions {
  widget: Widget;
  onUpdate?: (widgetId: string, updates: Partial<Widget>) => void;
}
