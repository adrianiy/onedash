import { useCallback } from "react";
import type { Layout, ReactGridLayoutProps } from "react-grid-layout";
import { useDashboardStore } from "../store/dashboardStore";

export const useGridLayout = () => {
  const { settings, updateLayout, isEditing } = useDashboardStore();

  const handleLayoutChange = useCallback(
    (layout: Layout[]) => {
      if (isEditing) {
        updateLayout(layout);
      }
    },
    [isEditing, updateLayout]
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
