import React from "react";
import type { MetricDefinition } from "@/types/metricConfig";
import { SeriesItem } from "./SeriesItem";

interface SeriesItemAdapterProps {
  id: string;
  index: number;
  item: MetricDefinition;
  isVisible: boolean;
  isSelected: boolean;
  onRemove: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onCopy: (id: string) => void;
  onEdit: (id: string) => void;
}

/**
 * Adapter component to bridge the SeriesItem component interface
 * with the GenericMetricListConfig expected interface
 */
export const SeriesItemAdapter: React.FC<SeriesItemAdapterProps> = ({
  item,
  ...props
}) => {
  return <SeriesItem {...props} series={item} />;
};
