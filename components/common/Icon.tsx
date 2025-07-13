import React from "react";
import {
  BarChart3,
  ChartColumn,
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
  Filter,
  RotateCcw,
  LayoutGrid,
  LayoutList,
  Rows3,
  Rows4,
  Pin,
  PinOff,
  User,
  KeyRound,
  LogIn,
  LogOut,
  UserPlus,
  Mail,
  Globe,
  Loader,
  Lock,
  Github,
  List,
  Hash,
  MoveVertical,
  MoveHorizontal,
  RotateCw,
  BarChart,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Euro,
  Percent,
  Circle,
  Droplets,
  Grape,
  Leaf,
  Square,
  CornerUpLeft,
  CornerUpRight,
  CornerDownLeft,
  CornerDownRight,
  ChartBarDecreasing,
  AlignJustify,
  MoreHorizontal,
  ListTodo,
  Bell,
  type LucideIcon,
} from "lucide-react";

// Tabler Icons imports
import {
  IconTable,
  IconBoxAlignTop,
  IconBoxAlignBottom,
  IconTableRow,
  IconTag,
  IconBrandGoogle,
  IconBrandWindows,
  IconHanger,
} from "@tabler/icons-react";

const lucideIconMap = {
  "bar-chart": BarChart3,
  "chart-column": ChartColumn,
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
  x: X,
  menu: Menu,
  grid: Grid3X3,
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  "trending-neutral": Minus,
  "alert-circle": AlertCircle,
  warning: AlertTriangle,
  copy: Copy,
  pin: Pin,
  "pin-off": PinOff,
  user: User,
  key: KeyRound,
  lock: Lock,
  globe: Globe,
  loader: Loader,
  "log-in": LogIn,
  "log-out": LogOut,
  "user-plus": UserPlus,
  mail: Mail,
  bell: Bell,
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
  "layout-grid": LayoutGrid,
  "layout-list": LayoutList,
  "rows-3": Rows3,
  "rows-4": Rows4,
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
  filter: Filter,
  "rotate-ccw": RotateCcw,
  github: Github,
  google: Globe, // Using Globe as placeholder for Google
  microsoft: Globe, // Using Globe as placeholder for Microsoft
  // Nuevos iconos para gráficos
  list: List,
  "grid-3x3": Grid3X3,
  hash: Hash,
  "move-vertical": MoveVertical,
  "move-horizontal": MoveHorizontal,
  "rotate-cw": RotateCw,
  "bar-chart-3": BarChart3,
  "bar-chart-horizontal": BarChart,
  "chart-bar": BarChart,
  "arrow-up": ArrowUp,
  "arrow-down": ArrowDown,
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  euro: Euro,
  percent: Percent,
  circle: Circle,
  droplets: Droplets,
  grape: Grape,
  leaf: Leaf,
  square: Square,
  "corner-up-left": CornerUpLeft,
  "corner-up-right": CornerUpRight,
  "corner-down-left": CornerDownLeft,
  "corner-down-right": CornerDownRight,
  "chart-bar-decreasing": ChartBarDecreasing,
  "align-justify": AlignJustify,
  "more-horizontal": MoreHorizontal,
  "list-todo": ListTodo,
} as const;

const tablerIconMap = {
  "table-striped": IconTable,
  "box-align-top": IconBoxAlignTop,
  "box-align-bottom": IconBoxAlignBottom,
  "table-row": IconTableRow,
  label: IconTag,
  "brand-google": IconBrandGoogle,
  "brand-microsoft": IconBrandWindows,
  hanger: IconHanger,
} as const;

export type IconName = keyof typeof lucideIconMap | keyof typeof tablerIconMap;

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  color?: string;
  style?: React.CSSProperties;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 16,
  className = "",
  color,
  style,
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
        style={style}
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
      style={style}
      aria-hidden="true"
    />
  );
};
