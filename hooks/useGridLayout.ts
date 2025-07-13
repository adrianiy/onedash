import { useCallback } from "react";
import type { Layout, ReactGridLayoutProps } from "react-grid-layout";
import { useGridStore } from "@/store/gridStore";
import { useUIStore } from "@/store/uiStore";

export const useGridLayout = () => {
  const { updateDashboardLayout, dashboard } = useGridStore();
  const { settings, isEditing, lockChanges, setLockChanges } = useUIStore();

  const handleLayoutChange = useCallback(
    (layout: Layout[]) => {
      const sameLayout =
        JSON.stringify(layout) === JSON.stringify(dashboard?.layout);
      if (isEditing && !lockChanges && !sameLayout) {
        // Log layout changes for debugging
        if (process.env.NODE_ENV === "development") {
          console.log("📐 Layout changed:", layout, lockChanges);
        }
        updateDashboardLayout(layout);
      } else {
        setLockChanges(false);
      }
    },
    [isEditing, lockChanges, dashboard, updateDashboardLayout, setLockChanges]
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
