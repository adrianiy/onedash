import { Layout } from "react-grid-layout";

export type DashboardLayout = Layout;

export interface Dashboard {
  _id: string;
  name: string;
  description?: string;
  layout: DashboardLayout[];
  widgets: string[];
  userId: string; // Puede ser solo el ID o el objeto usuario completo
  variables?: string[]; // IDs de variables del dashboard
  visibility?: "public" | "private"; // Visibilidad del dashboard
  collaborators?: string[]; // IDs de usuarios con permisos de edición
  isReadonly?: boolean; // Mantenerlo por ahora para compatibilidad con código existente
  defaultVariables?: Record<string, unknown>; // Valores por defecto de variables
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
