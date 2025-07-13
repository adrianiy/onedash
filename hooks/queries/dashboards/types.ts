import { Dashboard } from "@/types/dashboard";

export interface DashboardsListApiResponse {
  success: boolean;
  data?: Dashboard[];
  error?: string;
}

export interface DashboardApiResponse {
  success: boolean;
  data?: Dashboard;
  error?: string;
}

export interface DashboardQueryFilters {
  userId?: string;
  visibility?: "public" | "private" | "all";
  search?: string;
  sort?: "name" | "createdAt" | "updatedAt";
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface UpdateDashboardParams {
  id: string;
  updates: Partial<Dashboard>;
}

export interface CreateDashboardParams {
  name: string;
  description?: string;
  visibility?: "public" | "private";
  collaborators?: string[];
  defaultVariables?: Record<string, unknown>;
  variables?: Record<string, unknown>;
  userId?: string;
  layout?: Dashboard["layout"];
  widgets?: string[];
  originalId?: string; // ID del dashboard original (para copias)
}
