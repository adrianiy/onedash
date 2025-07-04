import React from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { useDashboardStore } from "../../store/dashboardStore";
import { useWidgetStore } from "../../store/widgetStore";
import { useGridLayout } from "../../hooks/useGridLayout";
import { WidgetContainer } from "./WidgetContainer";
import type { WidgetType, TableWidgetConfig } from "../../types/widget";
import type { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

// Tipos para el drag and drop
interface DroppingItem {
  i: string;
  w: number;
  h: number;
}

interface DroppedItem extends DroppingItem {
  x: number;
  y: number;
}

interface DropData {
  type: WidgetType;
  title: string;
  w: number;
  h: number;
  minW: number;
  minH: number;
  config: TableWidgetConfig;
  isConfigured: boolean;
}

interface DashboardGridProps {
  className?: string;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  className = "",
}) => {
  const {
    currentDashboard,
    tempDashboard,
    isEditing,
    selectedWidgetId,
    clearSelection,
    updateTempDashboard,
    updateDashboard,
  } = useDashboardStore();
  const { getWidgetsByIds } = useWidgetStore();
  const { getGridProps } = useGridLayout();

  // En modo edición usar tempDashboard, si no usar currentDashboard
  const activeDashboard =
    isEditing && tempDashboard ? tempDashboard : currentDashboard;

  if (!activeDashboard) {
    return (
      <div className="flex items-center justify-center h-64 text-muted">
        <p>No dashboard selected</p>
      </div>
    );
  }

  const widgets = getWidgetsByIds(activeDashboard.widgets);
  const gridProps = getGridProps();

  const handleGridClick = (e: React.MouseEvent) => {
    // Si el click NO es en un widget (no tiene clase widget-container como ancestro), limpiar selección
    const target = e.target as HTMLElement;
    const isClickOnWidget = target.closest(".widget-container");

    if (!isClickOnWidget) {
      clearSelection();
    }
  };

  const handleWidgetDrop = (
    layout: Layout[],
    item: DroppedItem,
    event: React.DragEvent<HTMLElement>
  ) => {
    try {
      // Extraer datos del widget arrastrado
      const dragData: DropData = JSON.parse(
        event.dataTransfer.getData("application/json")
      );

      // Crear widget con los datos recibidos
      const { addWidget } = useWidgetStore.getState();
      const newWidget = addWidget({
        type: dragData.type,
        title: dragData.title,
        config: dragData.config,
        isConfigured: dragData.isConfigured,
      });

      // Añadir el widget al dashboard en la posición donde se soltó
      const targetDashboard = tempDashboard || currentDashboard;
      if (targetDashboard) {
        const newLayout = {
          i: newWidget.id,
          x: item.x,
          y: item.y,
          w: dragData.w,
          h: dragData.h,
          minW: dragData.minW || 3,
          minH: dragData.minH || 3,
        };

        const updatedWidgets = [...targetDashboard.widgets, newWidget.id];
        const updatedLayout = [...targetDashboard.layout, newLayout];

        if (tempDashboard) {
          // En modo edición, actualizar dashboard temporal
          updateTempDashboard({
            widgets: updatedWidgets,
            layout: updatedLayout,
          });
        } else {
          // Fuera de modo edición, actualizar directamente
          updateDashboard(targetDashboard.id, {
            widgets: updatedWidgets,
            layout: updatedLayout,
          });
        }

        // Seleccionar el widget recién creado
        const { selectWidget } = useDashboardStore.getState();
        selectWidget(newWidget.id);
      }
    } catch (error) {
      console.error("Error al procesar el drop:", error);
    }
  };

  return (
    <div className={`dashboard-grid ${className}`} onClick={handleGridClick}>
      <ResponsiveGridLayout
        {...gridProps}
        layouts={{ lg: activeDashboard.layout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        isDroppable={isEditing}
        onDrop={(layout, item, e) =>
          handleWidgetDrop(
            layout,
            item,
            e as unknown as React.DragEvent<HTMLElement>
          )
        }
        droppingItem={{ i: "__dropping-elem__", w: 6, h: 6 }}
      >
        {widgets.map((widget) => (
          <div key={widget.id} className="react-grid-item">
            <WidgetContainer
              widget={widget}
              isSelected={selectedWidgetId === widget.id}
            />
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};
