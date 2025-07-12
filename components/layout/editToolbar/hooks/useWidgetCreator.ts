import { useDashboardStore } from "@/store/dashboardStore";
import { useWidgetStore } from "@/store/widgetStore";
import { WidgetCreatorHookReturn } from "../types";

/**
 * Hook que proporciona funciones para crear diferentes tipos de widgets
 */
export const useWidgetCreator = (): WidgetCreatorHookReturn => {
  /**
   * Función auxiliar para añadir cualquier tipo de widget
   */
  const addWidgetToBoard = (
    widget: { _id: string; type: string },
    layout: { w: number; h: number }
  ) => {
    const {
      currentDashboard,
      isEditing,
      updateDashboard,
      updateCurrentDashboard,
      selectWidget,
      openConfigSidebar,
    } = useDashboardStore.getState();

    // Add widget to current dashboard
    if (currentDashboard) {
      const newLayout = {
        i: widget._id,
        x: 0,
        y: 0,
        w: layout.w,
        h: layout.h,
      };

      const updatedWidgets = [...currentDashboard.widgets, widget._id];
      const updatedLayout = [...currentDashboard.layout, newLayout];

      if (isEditing) {
        // En modo edición, actualizar dashboard directamente
        updateCurrentDashboard({
          widgets: updatedWidgets,
          layout: updatedLayout,
        });
      } else {
        // Fuera de modo edición, actualizar directamente
        updateDashboard(currentDashboard._id, {
          widgets: updatedWidgets,
          layout: updatedLayout,
        });
      }

      // Seleccionar el widget recién creado
      selectWidget(widget._id);

      // Emitir evento de creación de widget para el wizard
      document.dispatchEvent(
        new CustomEvent("widget-create", {
          detail: { widgetId: widget._id, widgetType: widget.type },
        })
      );

      if (widget.type === "text") return;

      // Abrir automáticamente el sidebar de configuración
      openConfigSidebar();
    }
  };

  /**
   * Crea un widget de métrica
   */
  const addMetricWidget = () => {
    const { addWidget } = useWidgetStore.getState();

    // Crear widget de métrica
    const newMetricWidget = addWidget({
      type: "metric",
      title: "Nueva métrica",
      config: {},
      isConfigured: false,
    });

    addWidgetToBoard(newMetricWidget, { w: 4, h: 4 });
  };

  /**
   * Crea un widget de tabla
   */
  const addTableWidget = () => {
    const { addWidget } = useWidgetStore.getState();

    // Crear widget de tabla
    const newTableWidget = addWidget({
      type: "table",
      title: "Nueva tabla",
      config: {},
      isConfigured: false,
    });

    addWidgetToBoard(newTableWidget, { w: 6, h: 6 });
  };

  /**
   * Crea un widget de gráfico
   */
  const addChartWidget = () => {
    const { addWidget } = useWidgetStore.getState();

    // Crear widget de gráfico
    const newChartWidget = addWidget({
      type: "chart",
      title: "Nuevo gráfico",
      config: {
        chartType: "bar",
        data: [],
      },
      isConfigured: false,
    });

    addWidgetToBoard(newChartWidget, { w: 6, h: 4 });
  };

  /**
   * Crea un widget de texto
   */
  const addTextWidget = () => {
    const { addWidget } = useWidgetStore.getState();

    // Crear widget de texto
    const newTextWidget = addWidget({
      type: "text",
      title: "",
      config: {},
      isConfigured: true,
    });

    addWidgetToBoard(newTextWidget, { w: 4, h: 3 });
  };

  return {
    addMetricWidget,
    addTableWidget,
    addChartWidget,
    addTextWidget,
  };
};
