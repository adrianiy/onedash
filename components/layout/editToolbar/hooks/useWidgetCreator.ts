import { useGridAndUI, useGridStore } from "@/store/gridStore";
import { generateId } from "@/utils/helpers";
import { Widget, WidgetType } from "@/types/widget";
import { WidgetCreatorHookReturn } from "../types";
import { findFirstFreePosition } from "@/utils/layoutUtils";
import { useUIStore } from "@/store/uiStore";

/**
 * Hook que proporciona funciones para crear diferentes tipos de widgets
 */
export const useWidgetCreator = (): WidgetCreatorHookReturn => {
  // Usar nuevos stores
  const { dashboard } = useGridStore();
  const { currentBreakpoint } = useUIStore();
  const { addWidgetAndSelect } = useGridAndUI();

  /**
   * Función auxiliar para añadir cualquier tipo de widget
   */
  const addWidgetToBoard = (
    widgetData: {
      type: WidgetType;
      title: string;
      config: Record<string, unknown>;
      isConfigured: boolean;
    },
    layout: { w: number; h: number }
  ) => {
    if (!dashboard) return;

    // Generar un ID único para el widget
    const widgetId = generateId();

    // Crear widget con los datos proporcionados
    const newWidget = {
      _id: widgetId,
      type: widgetData.type,
      title: widgetData.title,
      config: widgetData.config || {},
      isConfigured: widgetData.isConfigured,
      dashboardId: dashboard._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Widget; // Cast al final para evitar el error de tipo específico

    const freePosition = findFirstFreePosition(
      dashboard.layouts[currentBreakpoint],
      layout.w,
      layout.h
    );

    // Crear layout para el nuevo widget
    const newLayout = {
      i: widgetId,
      x: freePosition.x,
      y: freePosition.y,
      w: layout.w,
      h: layout.h,
    };

    // Añadir widget al store
    addWidgetAndSelect(newWidget, newLayout);

    // Emitir evento de creación de widget para el wizard
    document.dispatchEvent(
      new CustomEvent("widget-create", {
        detail: { widgetId, widgetType: widgetData.type },
      })
    );
  };

  /**
   * Crea un widget de métrica
   */
  const addMetricWidget = () => {
    // Crear widget de métrica
    addWidgetToBoard(
      {
        type: "metric" as WidgetType,
        title: "Nueva métrica",
        config: {},
        isConfigured: false,
      },
      { w: 12, h: 4 }
    );
  };

  /**
   * Crea un widget de tabla
   */
  const addTableWidget = () => {
    // Crear widget de tabla
    addWidgetToBoard(
      {
        type: "table" as WidgetType,
        title: "Nueva tabla",
        config: {},
        isConfigured: false,
      },
      { w: 16, h: 6 }
    );
  };

  /**
   * Crea un widget de gráfico
   */
  const addChartWidget = () => {
    // Crear widget de gráfico
    addWidgetToBoard(
      {
        type: "chart" as WidgetType,
        title: "Nuevo gráfico",
        config: {
          chartType: "bar" as const,
          data: [],
        },
        isConfigured: false,
      },
      { w: 16, h: 6 }
    );
  };

  /**
   * Crea un widget de texto
   */
  const addTextWidget = () => {
    // Crear widget de texto
    addWidgetToBoard(
      {
        type: "text" as WidgetType,
        title: "",
        config: {},
        isConfigured: true,
      },
      { w: 12, h: 3 }
    );
  };

  return {
    addMetricWidget,
    addTableWidget,
    addChartWidget,
    addTextWidget,
  };
};
