import { useCallback } from "react";
import { useWidgetStore } from "@/store/widgetStore";
import type {
  Widget,
  ChartWidget,
  MetricWidget,
  TableWidget,
} from "@/types/widget";
import type { UseWidgetConfigOptions } from "@/widgets/config/hooks";

type WidgetWithVisualization = ChartWidget | MetricWidget | TableWidget;

export const useWidgetConfig = (options: UseWidgetConfigOptions) => {
  const { widget, onUpdate } = options;
  const { updateWidget } = useWidgetStore();

  const handleUpdateWidget = useCallback(
    (updates: Partial<Widget>) => {
      updateWidget(widget._id, updates);
      onUpdate?.(widget._id, updates);
    },
    [widget._id, updateWidget, onUpdate]
  );

  const handleUpdateConfig = useCallback(
    (configUpdates: Record<string, unknown>) => {
      const updates = {
        config: {
          ...widget.config,
          ...configUpdates,
        },
      } as Partial<Widget>;
      handleUpdateWidget(updates);
    },
    [widget.config, handleUpdateWidget]
  );

  const handleUpdateVisualization = useCallback(
    (visualizationUpdates: Record<string, unknown>) => {
      // Solo actualizar si el widget tiene soporte para visualization
      if ("visualization" in widget.config) {
        const widgetWithViz = widget as WidgetWithVisualization;
        const updates = {
          config: {
            ...widgetWithViz.config,
            visualization: {
              ...widgetWithViz.config.visualization,
              ...visualizationUpdates,
            },
          },
        } as Partial<Widget>;
        handleUpdateWidget(updates);
      }
    },
    [widget.config, handleUpdateWidget]
  );

  const handleUpdateEvents = useCallback(
    (events: Widget["events"]) => {
      handleUpdateWidget({ events });
    },
    [handleUpdateWidget]
  );

  return {
    updateWidget: handleUpdateWidget,
    updateConfig: handleUpdateConfig,
    updateVisualization: handleUpdateVisualization,
    updateEvents: handleUpdateEvents,
  };
};
