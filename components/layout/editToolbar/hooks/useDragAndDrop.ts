import React from "react";
import { DragAndDropHookReturn } from "../types";
import { useUIStore } from "@/store/uiStore";

/**
 * Hook que proporciona las funciones de drag and drop para los widgets
 */
export const useDragAndDrop = (): DragAndDropHookReturn => {
  /**
   * Función auxiliar para crear un elemento invisible para arrastrar
   */
  const createInvisibleDragElement = () => {
    const div = document.createElement("div");
    div.style.width = "1px";
    div.style.height = "1px";
    div.style.backgroundColor = "transparent";
    div.style.position = "absolute";
    div.style.top = "-1000px";
    div.style.left = "-1000px";
    div.style.opacity = "0";
    document.body.appendChild(div);

    return {
      element: div,
      cleanup: () => {
        if (document.body.contains(div)) {
          document.body.removeChild(div);
        }
      },
    };
  };

  /**
   * Configura los datos de arrastre en el evento
   */
  const setupDragData = (
    e: React.DragEvent,
    type: string,
    title: string,
    size: { w: number; h: number },
    config: Record<string, unknown> = {},
    isConfigured: boolean = false
  ) => {
    const { setDroppingItemSize, setLockChanges } = useUIStore.getState();

    // Establecer el tamaño del elemento mientras se arrastra
    setDroppingItemSize(size);
    setLockChanges(true);

    // Crear elemento invisible para el arrastre
    const { element, cleanup } = createInvisibleDragElement();
    e.dataTransfer.setDragImage(element, 0, 0);
    setTimeout(cleanup, 100);

    // Configurar datos para el evento de arrastre
    const dragData = {
      type,
      title,
      w: size.w,
      h: size.h,
      config,
      isConfigured,
    };

    e.dataTransfer.setData("application/json", JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = "copy";
  };

  /**
   * Maneja el inicio del arrastre para widgets de métrica
   */
  const handleMetricDragStart = (e: React.DragEvent) => {
    setupDragData(e, "metric", "Nueva métrica", { w: 12, h: 4 }, {}, false);
  };

  /**
   * Maneja el inicio del arrastre para widgets de tabla
   */
  const handleTableDragStart = (e: React.DragEvent) => {
    setupDragData(e, "table", "Nueva tabla", { w: 16, h: 6 }, {}, false);
  };

  /**
   * Maneja el inicio del arrastre para widgets de gráfico
   */
  const handleChartDragStart = (e: React.DragEvent) => {
    setupDragData(
      e,
      "chart",
      "Nuevo gráfico",
      { w: 16, h: 4 },
      { chartType: "bar", data: [] },
      false
    );
  };

  /**
   * Maneja el inicio del arrastre para widgets de texto
   */
  const handleTextDragStart = (e: React.DragEvent) => {
    setupDragData(e, "text", "", { w: 12, h: 3 }, {}, true);
  };

  return {
    handleMetricDragStart,
    handleTableDragStart,
    handleChartDragStart,
    handleTextDragStart,
  };
};
