import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dashboard } from "@/types/dashboard";
import { apiService } from "@/services/apiService";
import { Layouts } from "react-grid-layout";

interface CreateDashboardParams {
  name: string;
  description?: string;
  visibility?: "public" | "private";
  collaborators?: string[];
  defaultVariables?: Record<string, unknown>;
  variables?: Record<string, unknown>;
  userId?: string;
  layouts?: Layouts;
  widgets?: string[];
  originalId?: string; // ID del dashboard original (para copias)
}

/**
 * Hook para crear un nuevo dashboard
 * @returns Mutation para crear dashboards
 */
export function useCreateDashboardMutation() {
  const queryClient = useQueryClient();

  return useMutation<Dashboard, Error, CreateDashboardParams>({
    mutationFn: async (dashboardData) => {
      const response = await apiService.post<Dashboard>(
        "/dashboards",
        dashboardData
      );

      if (!response.success) {
        throw new Error(response.error || "Error al crear el dashboard");
      }

      // Convertir fechas de string a Date
      return {
        ...response.data!,
        createdAt: new Date(response.data!.createdAt),
        updatedAt: new Date(response.data!.updatedAt),
      };
    },
    onSuccess: () => {
      // Invalidar consultas relacionadas para forzar re-fetch
      queryClient.invalidateQueries({ queryKey: ["dashboards"] });
    },
  });
}
