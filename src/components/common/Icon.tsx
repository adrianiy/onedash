import React from "react";
import {
  BarChart3,
  LineChart,
  PieChart,
  Settings,
  Plus,
  Edit,
  Trash2,
  Sun,
  Moon,
  Save,
  X,
  Menu,
  Grid3X3,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  Copy,
  ChevronUp,
  ChevronDown,
  Undo2,
  Redo2,
  Check,
  GripVertical,
  Table,
  Target,
  type LucideIcon,
} from "lucide-react";

const iconMap = {
  "bar-chart": BarChart3,
  "line-chart": LineChart,
  "pie-chart": PieChart,
  settings: Settings,
  plus: Plus,
  edit: Edit,
  trash: Trash2,
  sun: Sun,
  moon: Moon,
  save: Save,
  close: X,
  menu: Menu,
  grid: Grid3X3,
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  "trending-neutral": Minus,
  "alert-circle": AlertCircle,
  copy: Copy,
  "chevron-up": ChevronUp,
  "chevron-down": ChevronDown,
  undo: Undo2,
  redo: Redo2,
  check: Check,
  "grip-vertical": GripVertical,
  table: Table,
  target: Target,
} as const;

export type IconName = keyof typeof iconMap;

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  color?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 16,
  className = "",
  color,
}) => {
  const IconComponent: LucideIcon = iconMap[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <IconComponent
      size={size}
      className={className}
      color={color}
      aria-hidden="true"
    />
  );
};
