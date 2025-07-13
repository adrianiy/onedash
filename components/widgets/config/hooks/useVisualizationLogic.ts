import { useGridStore } from "@/store/gridStore";
import type { ChartWidget, MetricWidget, TableWidget } from "@/types/widget";

// Solo widgets que tienen propiedad visualization
type VisualizationWidget = ChartWidget | MetricWidget | TableWidget;

export interface VisualizationLogicReturn {
  // State
  visualization: Record<string, unknown>;
  showTitle: boolean;
  filterDisplayMode: "badges" | "info" | "hidden" | undefined;
  hasTitleDisabled: boolean;

  // Handlers
  handleToggleTitle: (show: boolean) => void;
  handleFilterDisplayMode: (mode: "badges" | "info") => void;
  updateVisualization: (updates: Record<string, unknown>) => void;
}

export const useVisualizationLogic = (
  widget: VisualizationWidget
): VisualizationLogicReturn => {
  const { updateWidget } = useGridStore();

  // Get current values - safe access since we know these widgets have visualization
  const visualization = widget.config.visualization || {};
  const showTitle = visualization.showTitle !== false;
  const filterDisplayMode = visualization.filterDisplayMode;
  const hasTitleDisabled = !widget.title || widget.title.trim() === "";

  // Generic handler for updating visualization config
  const updateVisualization = (updates: Record<string, unknown>) => {
    updateWidget(widget._id, {
      config: {
        ...widget.config,
        visualization: {
          ...visualization,
          ...updates,
        },
      },
    });
  };

  // Toggle title visibility
  const handleToggleTitle = (show: boolean) => {
    updateVisualization({ showTitle: show });
  };

  // Handle filter display mode
  const handleFilterDisplayMode = (mode: "badges" | "info") => {
    // Si clico en la opción ya activa, cambia a hidden
    // Si clico en otra opción, la activa
    // Si está en hidden, la activa
    let newMode: "badges" | "info" | "hidden" | undefined;

    if (mode === filterDisplayMode) {
      newMode = "hidden"; // Ocultar filtros si se clica en la opción activa
    } else {
      newMode = mode; // Activar la opción clicada
    }

    updateVisualization({ filterDisplayMode: newMode });
  };

  return {
    // State
    visualization,
    showTitle,
    filterDisplayMode,
    hasTitleDisabled,

    // Handlers
    handleToggleTitle,
    handleFilterDisplayMode,
    updateVisualization,
  };
};
