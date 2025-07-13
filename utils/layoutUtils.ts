import type { DashboardLayout } from "@/types/dashboard";
import type { Layout } from "react-grid-layout";

/**
 * Sanitizes dashboard layout by removing MongoDB-specific fields
 * and ensuring React Grid Layout compatibility
 */
export const sanitizeLayoutForGrid = (layout: DashboardLayout[]): Layout[] => {
  return layout.map((item) => {
    // Extract only the fields that React Grid Layout expects
    const sanitizedItem: Layout = {
      i: item.i,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
      static: item.static,
      moved: item.moved,
      isDraggable: item.isDraggable,
      isResizable: item.isResizable,
    };

    // Add optional fields if they exist
    if (item.minW !== undefined) {
      sanitizedItem.minW = item.minW;
    }
    if (item.minH !== undefined) {
      sanitizedItem.minH = item.minH;
    }
    if (item.maxW !== undefined) {
      sanitizedItem.maxW = item.maxW;
    }
    if (item.maxH !== undefined) {
      sanitizedItem.maxH = item.maxH;
    }

    return sanitizedItem;
  });
};

/**
 * Validates that a layout item has all required fields
 */
export const validateLayoutItem = (item: unknown): boolean => {
  // First check if item is an object
  if (!item || typeof item !== "object") {
    console.warn("Layout item is not an object:", item);
    return false;
  }

  const layoutItem = item as Record<string, unknown>;
  const requiredFields = ["i", "x", "y", "w", "h"];

  for (const field of requiredFields) {
    if (layoutItem[field] === undefined || layoutItem[field] === null) {
      console.warn(`Layout item missing required field: ${field}`, item);
      return false;
    }
  }

  // Validate numeric fields
  const numericFields = ["x", "y", "w", "h"];
  for (const field of numericFields) {
    if (
      typeof layoutItem[field] !== "number" ||
      (layoutItem[field] as number) < 0
    ) {
      console.warn(
        `Layout item has invalid ${field}: ${layoutItem[field]}`,
        item
      );
      return false;
    }
  }

  return true;
};

/**
 * Validates and sanitizes an entire layout array
 */
export const validateAndSanitizeLayout = (
  layout: DashboardLayout[]
): Layout[] => {
  if (!Array.isArray(layout)) {
    console.warn("Layout is not an array:", layout);
    return [];
  }

  // Filter out invalid items and sanitize valid ones
  const validItems = layout.filter(validateLayoutItem);

  if (validItems.length !== layout.length) {
    console.warn(
      `Filtered out ${layout.length - validItems.length} invalid layout items`
    );
  }

  return sanitizeLayoutForGrid(validItems);
};

// Function to find the first available position in the grid
export const findFirstFreePosition = (
  layout: DashboardLayout[],
  width: number,
  height: number,
  gridCols: number = 12
): { x: number; y: number } => {
  // Create a grid to track occupied positions
  const maxRows = Math.max(...layout.map((item) => item.y + item.h), 0);
  const grid: boolean[][] = Array(maxRows + height)
    .fill(false)
    .map(() => Array(gridCols).fill(false));

  // Mark occupied positions
  layout.forEach((item) => {
    for (let y = item.y; y < item.y + item.h; y++) {
      for (let x = item.x; x < item.x + item.w; x++) {
        if (grid[y] && grid[y][x] !== undefined) {
          grid[y][x] = true;
        }
      }
    }
  });

  // Find the first free position
  for (let y = 0; y < grid.length - height + 1; y++) {
    for (let x = 0; x <= gridCols - width; x++) {
      let canPlace = true;

      // Check if the widget can be placed at this position
      for (let dy = 0; dy < height && canPlace; dy++) {
        for (let dx = 0; dx < width && canPlace; dx++) {
          if (grid[y + dy] && grid[y + dy][x + dx]) {
            canPlace = false;
          }
        }
      }

      if (canPlace) {
        return { x, y };
      }
    }
  }

  // If no position is found, place at the bottom
  return { x: 0, y: maxRows };
};
