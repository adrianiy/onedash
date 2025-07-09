import React from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { useDashboardStore } from "../../store/dashboardStore";
import { useWidgetStore } from "../../store/widgetStore";
import { useGridLayout } from "../../hooks/useGridLayout";
import { WidgetContainer } from "./WidgetContainer";
import { DashboardEmptyPlaceholder } from "./DashboardEmptyPlaceholder";
import { validateAndSanitizeLayout } from "../../utils/layoutUtils";
import type { WidgetType } from "../../types/widget";
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
  config: Record<string, unknown>; // Generic config that can be any widget config
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
    droppingItemSize,
    resetDroppingItemSize,
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

  if (widgets.length === 0 && !isEditing) {
    return <DashboardEmptyPlaceholder isEditing={isEditing} />;
  }

  // Sanitize layout to ensure React Grid Layout compatibility
  const sanitizedLayout = validateAndSanitizeLayout(activeDashboard.layout);

  // Debug logging to help identify layout issues
  if (process.env.NODE_ENV === "development") {
    console.log(
      "🔍 Dashboard Layout Debug:",
      JSON.parse(
        JSON.stringify({
          dashboardId: activeDashboard._id,
          originalLayout: activeDashboard.layout,
          sanitizedLayout: sanitizedLayout,
          layoutCount: activeDashboard.layout.length,
          sanitizedCount: sanitizedLayout.length,
          widgets: widgets,
        })
      )
    );
  }

  const handleGridClick = (e: React.MouseEvent) => {
    // Si el click NO es en un widget (no tiene clase widget-container como ancestro), limpiar selección
    const target = e.target as HTMLElement;
    const isClickOnWidget = target.closest(".widget-container");

    if (!isClickOnWidget) {
      clearSelection();
    }
  };

  const handleWidgetDrop = (
    _layout: Layout[],
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
          i: newWidget._id,
          x: item.x,
          y: item.y,
          w: dragData.w,
          h: dragData.h,
        };

        const updatedWidgets = [...targetDashboard.widgets, newWidget._id];
        const updatedLayout = [...targetDashboard.layout, newLayout];

        if (tempDashboard) {
          // En modo edición, actualizar dashboard temporal
          updateTempDashboard({
            widgets: updatedWidgets,
            layout: updatedLayout,
          });
        } else {
          // Fuera de modo edición, actualizar directamente
          updateDashboard(targetDashboard._id, {
            widgets: updatedWidgets,
            layout: updatedLayout,
          });
        }

        // Seleccionar el widget recién creado y abrir el sidebar de configuración
        const { selectWidget, openConfigSidebar } =
          useDashboardStore.getState();
        selectWidget(newWidget._id);

        if (newWidget.type === "text") return;

        openConfigSidebar();
      }

      // Resetear el tamaño del droppingItem al finalizar el drop
      resetDroppingItemSize();
    } catch (error) {
      console.error("Error al procesar el drop:", error);
    }
  };

  // Handler para resetear el tamaño al finalizar el drag
  const handleDragEnd = () => {
    resetDroppingItemSize();
  };

  return (
    <div
      className={`dashboard-grid ${className}`}
      onClick={handleGridClick}
      onDragLeave={handleDragEnd}
    >
      {activeDashboard.widgets.length === 0 && (
        <DashboardEmptyPlaceholder isEditing={isEditing} />
      )}
      {(activeDashboard.widgets.length > 0 || isEditing) && (
        <ResponsiveGridLayout
          {...gridProps}
          layouts={{ lg: sanitizedLayout }}
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
          droppingItem={{
            i: "__dropping-elem__",
            w: droppingItemSize.w,
            h: droppingItemSize.h,
          }}
        >
          {widgets.map((widget) => (
            <div
              key={widget._id}
              className={`react-grid-item ${
                selectedWidgetId === widget._id
                  ? "react-grid-item-selected"
                  : ""
              }`}
            >
              <WidgetContainer
                widget={widget}
                isSelected={selectedWidgetId === widget._id}
              />
            </div>
          ))}
        </ResponsiveGridLayout>
      )}
    </div>
  );
};
