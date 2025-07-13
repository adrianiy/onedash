import { useGridAndUI } from "@/store/gridStore";
import { useUIStore } from "@/store/uiStore";
import { Widget } from "@/types/widget";
import { useCreateWidgetMutation } from "./useCreateWidgetMutation";

/**
 * Hook para crear widgets utilizando React Query
 * @returns Funciones para crear diferentes tipos de widgets
 */
export const useWidgetCreatorMutation = () => {
  const { mutate: createWidget } = useCreateWidgetMutation();
  const { dashboard, addWidgetAndSelect } = useGridAndUI();
  const { openConfigSidebar } = useUIStore();

  const addWidgetToBoard = (
    widgetData: Pick<Widget, "type" | "title" | "config" | "isConfigured">,
    layout: { w: number; h: number }
  ) => {
    if (!dashboard) return;

    // Crear widget con React Query
    createWidget(
      {
        widgetData: {
          ...widgetData,
          dashboardId: dashboard._id,
        },
        dashboardId: dashboard._id,
      },
      {
        onSuccess: (newWidget) => {
          // Actualizar layout con el nuevo widget
          const newLayout = {
            i: newWidget._id,
            x: 0,
            y: 0,
            w: layout.w,
            h: layout.h,
          };

          addWidgetAndSelect(newWidget, newLayout);

          // Evento para wizard
          document.dispatchEvent(
            new CustomEvent("widget-create", {
              detail: { widgetId: newWidget._id, widgetType: newWidget.type },
            })
          );

          // Abrir sidebar si no es texto
          if (newWidget.type !== "text") {
            openConfigSidebar();
          }
        },
      }
    );
  };

  /**
   * Crea un widget de métrica
   */
  const addMetricWidget = () => {
    addWidgetToBoard(
      {
        type: "metric",
        title: "Nueva métrica",
        config: {},
        isConfigured: false,
      },
      { w: 4, h: 4 }
    );
  };

  /**
   * Crea un widget de tabla
   */
  const addTableWidget = () => {
    addWidgetToBoard(
      {
        type: "table",
        title: "Nueva tabla",
        config: {},
        isConfigured: false,
      },
      { w: 6, h: 6 }
    );
  };

  /**
   * Crea un widget de gráfico
   */
  const addChartWidget = () => {
    addWidgetToBoard(
      {
        type: "chart",
        title: "Nuevo gráfico",
        config: {
          chartType: "bar",
          data: [],
        },
        isConfigured: false,
      },
      { w: 6, h: 4 }
    );
  };

  /**
   * Crea un widget de texto
   */
  const addTextWidget = () => {
    addWidgetToBoard(
      {
        type: "text",
        title: "",
        config: {},
        isConfigured: true,
      },
      { w: 4, h: 3 }
    );
  };

  return {
    addMetricWidget,
    addTableWidget,
    addChartWidget,
    addTextWidget,
    addWidgetToBoard,
  };
};
