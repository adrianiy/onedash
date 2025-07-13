import { useCallback } from "react";
import type { Layout, ReactGridLayoutProps } from "react-grid-layout";
import { useGridStore } from "@/store/gridStore";
import { useUIStore } from "@/store/uiStore";

export const useGridLayout = () => {
  const { updateDashboardLayout, dashboard } = useGridStore();
  const {
    settings,
    isEditing,
    lockChanges,
    setLockChanges,
    currentBreakpoint,
  } = useUIStore();

  const handleLayoutChange = useCallback(
    (layout: Layout[], allLayouts: Record<string, Layout[]>) => {
      if (isEditing && !lockChanges) {
        if (process.env.NODE_ENV === "development") {
          console.log("📐 All layouts changed:", allLayouts);
        }
        console.log(allLayouts, layout);
        // Si no, solo actualizamos el layout del breakpoint actual
        const sameLayout =
          dashboard?.layouts &&
          JSON.stringify(layout) ===
            JSON.stringify(dashboard.layouts[currentBreakpoint]);

        if (!sameLayout) {
          // Log layout changes for debugging
          if (process.env.NODE_ENV === "development") {
            console.log(
              `📐 Layout changed for ${currentBreakpoint}:`,
              layout,
              lockChanges
            );
          }
          updateDashboardLayout(layout, currentBreakpoint);
        }
      } else {
        setLockChanges(false);
      }
    },
    [
      isEditing,
      lockChanges,
      dashboard?.layouts,
      currentBreakpoint,
      updateDashboardLayout,
      setLockChanges,
    ]
  );

  const generateLayout = useCallback(
    (items: string[], defaultWidth = 4, defaultHeight = 4) => {
      return items.map((item, index) => ({
        i: item,
        x: (index * defaultWidth) % settings.gridCols,
        y:
          Math.floor((index * defaultWidth) / settings.gridCols) *
          defaultHeight,
        w: defaultWidth,
        h: defaultHeight,
      }));
    },
    [settings.gridCols]
  );

  const getGridProps = useCallback(() => {
    return {
      className: "layout",
      cols: settings.gridCols,
      rowHeight: settings.gridRowHeight,
      margin: settings.gridMargin,
      isDraggable: isEditing,
      isResizable: isEditing,
      resizeHandles: isEditing
        ? (["se", "sw", "ne", "nw"] as ReactGridLayoutProps["resizeHandles"])
        : [],
      onLayoutChange: handleLayoutChange,
      compactType: "vertical" as const,
      preventCollision: false,
      useCSSTransforms: true,
      draggableHandle: isEditing ? ".draggable-handle" : ".no-drag",
    };
  }, [settings, isEditing, handleLayoutChange]);

  return {
    handleLayoutChange,
    generateLayout,
    getGridProps,
    isEditing,
    settings,
  };
};
