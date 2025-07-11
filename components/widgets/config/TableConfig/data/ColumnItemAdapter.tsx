import React from "react";
import type { MetricDefinition } from "@/types/metricConfig";
import { ColumnItem } from "./ColumnItem";

interface ColumnItemAdapterProps {
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
 * Adapter component to bridge the ColumnItem component interface
 * with the GenericMetricListConfig expected interface
 */
export const ColumnItemAdapter: React.FC<ColumnItemAdapterProps> = ({
  item,
  ...props
}) => {
  return <ColumnItem {...props} column={item} />;
};
