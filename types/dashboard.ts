import { Layout } from "react-grid-layout";

export type DashboardLayout = Layout;
export type Breakpoint = "lg" | "md" | "sm"; // Breakpoints soportados

export interface Dashboard {
  _id: string;
  name: string;
  description?: string;

  // Reemplazar layout por layouts
  layouts: Record<Breakpoint, DashboardLayout[]>;

  widgets: string[];
  userId: string; // Puede ser solo el ID o el objeto usuario completo
  variables?: Record<string, unknown>; // Variables del dashboard como objeto clave-valor
  visibility?: "public" | "private"; // Visibilidad del dashboard
  collaborators?: string[]; // IDs de usuarios con permisos de edición
  isReadonly?: boolean; // Mantenerlo por ahora para compatibilidad con código existente
  defaultVariables?: Record<string, unknown>; // Valores por defecto de variables
  isShared?: boolean; // Indica si el dashboard es compartible con usuarios autenticados
  createdAt: Date;
  updatedAt: Date;
  originalId?: string;
}

export interface DashboardSettings {
  theme: "light" | "dark";
  gridCols: number;
  gridRowHeight: number;
  gridMargin: [number, number];
  isEditable: boolean;
}
