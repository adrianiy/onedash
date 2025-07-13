import React, { useMemo } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { useGridStore, useGridAndUI } from "@/store/gridStore";
import { useUIStore } from "@/store/uiStore";
import { useGridLayout } from "@/hooks/useGridLayout";
import { WidgetContainer } from "./WidgetContainer";
import { DashboardEmptyPlaceholder } from "./DashboardEmptyPlaceholder";
import type { Widget, WidgetType } from "@/types/widget";
import type { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Breakpoint } from "@/types/dashboard";

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
  // Usar los nuevos stores
  const { dashboard, widgets } = useGridStore();

  // Usar layouts en lugar de layout
  const layouts = useMemo(() => {
    if (!dashboard?.layouts) {
      return { lg: [], md: [], sm: [] };
    }
    return dashboard.layouts;
  }, [dashboard?.layouts]);

  const {
    isEditing,
    selectedWidgetId,
    selectWidget,
    droppingItemSize,
    resetDroppingItemSize,
    currentBreakpoint,
    setCurrentBreakpoint,
  } = useUIStore();

  const { getGridProps } = useGridLayout();
  const { addWidgetAndSelect } = useGridAndUI();

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center h-64 text-muted">
        <p>No has seleccionado ningún dashboard</p>
      </div>
    );
  }

  const gridProps = getGridProps();

  if (!widgets && !isEditing) {
    return <DashboardEmptyPlaceholder isEditing={isEditing} />;
  }

  const handleGridClick = (e: React.MouseEvent) => {
    // Si el click NO es en un widget (no tiene clase widget-container como ancestro), limpiar selección
    const target = e.target as HTMLElement;
    const isClickOnWidget = target.closest(".widget-container");

    if (!isClickOnWidget && selectedWidgetId) {
      selectWidget(null);
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

      // Crear nuevo widget con datos recibidos
      const newWidget = {
        _id: `widget-${Date.now()}`,
        type: dragData.type,
        title: dragData.title,
        config: dragData.config,
        isConfigured: dragData.isConfigured,
        dashboardId: dashboard?._id || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Widget;

      // Actualizar el layout del dashboard
      const newLayout = {
        i: newWidget._id,
        x: item.x,
        y: item.y,
        w: dragData.w,
        h: dragData.h,
      };

      // Usar el helper combinado para añadir y seleccionar en un solo paso
      addWidgetAndSelect(newWidget, newLayout);

      // Disparar evento para el wizard
      document.dispatchEvent(new Event("widget-create"));

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

  // Handler para manejar cambios de breakpoint
  const handleBreakpointChange = (newBreakpoint: Breakpoint) => {
    if (newBreakpoint !== currentBreakpoint) {
      setCurrentBreakpoint(newBreakpoint);
      if (process.env.NODE_ENV === "development") {
        console.log(`🔄 Breakpoint cambiado a: ${newBreakpoint}`);
      }
    }
  };

  // Debug logging to help identify layout issues
  if (process.env.NODE_ENV === "development") {
    console.log(
      "🔍 Dashboard Layout Debug:",
      JSON.parse(
        JSON.stringify({
          dashboardId: dashboard._id,
          layouts: dashboard.layouts,
          currentBreakpoint,
          layoutCount: {
            lg: dashboard.layouts?.lg?.length || 0,
            md: dashboard.layouts?.md?.length || 0,
            sm: dashboard.layouts?.sm?.length || 0,
          },
          dashboard: dashboard,
          widgets: widgets,
        })
      )
    );
  }

  return (
    <div
      className={`dashboard-grid ${className}`}
      onClick={handleGridClick}
      onDragLeave={handleDragEnd}
    >
      {dashboard.widgets.length === 0 && (
        <DashboardEmptyPlaceholder isEditing={isEditing} />
      )}
      {(dashboard.widgets.length > 0 || isEditing) && (
        <ResponsiveGridLayout
          {...gridProps}
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768 }}
          cols={{ lg: 24, md: 18, sm: 12 }}
          isDroppable={isEditing}
          onDrop={(layout, item, e) =>
            handleWidgetDrop(
              layout,
              item,
              e as unknown as React.DragEvent<HTMLElement>
            )
          }
          onBreakpointChange={handleBreakpointChange}
          breakpoint={currentBreakpoint}
          droppingItem={{
            i: "__dropping-elem__",
            w: droppingItemSize.w,
            h: droppingItemSize.h,
          }}
        >
          {dashboard.widgets
            .filter((widget) => widgets?.[widget])
            .map((widget) => (
              <div
                key={widget}
                className={`react-grid-item ${
                  selectedWidgetId === widget ? "react-grid-item-selected" : ""
                }`}
              >
                <WidgetContainer
                  widget={widgets![widget]}
                  isSelected={selectedWidgetId === widget}
                />
              </div>
            ))}
        </ResponsiveGridLayout>
      )}
    </div>
  );
};
