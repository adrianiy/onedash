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
