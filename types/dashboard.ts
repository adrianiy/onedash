export interface DashboardLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export interface Dashboard {
  _id: string;
  name: string;
  description?: string;
  layout: DashboardLayout[];
  widgets: string[];
  variables?: string[]; // IDs de variables del dashboard
  visibility?: "public" | "private"; // Visibilidad del dashboard
  collaborators?: string[]; // IDs de usuarios con permisos de edición
  createdAt: Date;
  updatedAt: Date;
  isReadonly?: boolean;
  originalId?: string;
}

export interface DashboardSettings {
  theme: "light" | "dark";
  gridCols: number;
  gridRowHeight: number;
  gridMargin: [number, number];
  isEditable: boolean;
}
