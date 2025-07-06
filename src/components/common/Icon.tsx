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
  AlertTriangle,
  Copy,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  ChevronsDownUp,
  Undo2,
  Redo2,
  Check,
  GripVertical,
  Table,
  Target,
  Database,
  Eye,
  EyeOff,
  Zap,
  Calendar,
  Tag,
  MapPin,
  Search,
  Info,
  Pen,
  Palette,
  LayoutDashboard,
  Type,
  Heading,
  Bold,
  Italic,
  PaintBucket,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minimize,
  Layers,
  Grid,
  ListOrdered,
  PanelTop,
  PanelBottom,
  type LucideIcon,
} from "lucide-react";

// Tabler Icons imports
import {
  IconTable,
  IconBoxAlignTop,
  IconBoxAlignBottom,
} from "@tabler/icons-react";

const lucideIconMap = {
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
  warning: AlertTriangle,
  copy: Copy,
  "chevron-up": ChevronUp,
  "chevron-down": ChevronDown,
  "chevron-right": ChevronRight,
  "chevrons-up-down": ChevronsUpDown,
  "chevrons-down-up": ChevronsDownUp,
  undo: Undo2,
  redo: Redo2,
  check: Check,
  "grip-vertical": GripVertical,
  table: Table,
  target: Target,
  database: Database,
  eye: Eye,
  "eye-off": EyeOff,
  zap: Zap,
  calendar: Calendar,
  tag: Tag,
  "map-pin": MapPin,
  search: Search,
  info: Info,
  pen: Pen,
  palette: Palette,
  "paint-bucket": PaintBucket,
  "layout-dashboard": LayoutDashboard,
  type: Type,
  heading: Heading,
  bold: Bold,
  italic: Italic,
  "align-left": AlignLeft,
  "align-center": AlignCenter,
  "align-right": AlignRight,
  minimize: Minimize,
  layers: Layers,
  "border-grid": Grid,
  "list-ordered": ListOrdered,
  "panel-top": PanelTop,
  "panel-bottom": PanelBottom,
} as const;

const tablerIconMap = {
  "table-striped": IconTable,
  "box-align-top": IconBoxAlignTop,
  "box-align-bottom": IconBoxAlignBottom,
} as const;

export type IconName = keyof typeof lucideIconMap | keyof typeof tablerIconMap;

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
  // Verificar si es un icono de Tabler
  if (name in tablerIconMap) {
    const TablerIconComponent =
      tablerIconMap[name as keyof typeof tablerIconMap];
    return (
      <TablerIconComponent
        size={size}
        className={className}
        color={color}
        stroke={1.1} // Bordes más finos para un aspecto minimalista
        aria-hidden="true"
      />
    );
  }

  // Si no, usar iconos de Lucide
  const LucideIconComponent: LucideIcon =
    lucideIconMap[name as keyof typeof lucideIconMap];

  if (!LucideIconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <LucideIconComponent
      size={size}
      className={className}
      color={color}
      strokeWidth={1.1} // Bordes más finos para un aspecto minimalista
      aria-hidden="true"
    />
  );
};
