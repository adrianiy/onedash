import { useQuery } from "@tanstack/react-query";
import { Widget } from "@/types/widget";
import { apiService } from "@/services/apiService";

/**
 * Hook para obtener un widget específico por su ID
 * @param id - ID del widget a obtener
 * @param options - Opciones adicionales de la consulta
 * @returns Query con el widget solicitado
 */
export function useWidgetByIdQuery(
  id: string | null | undefined,
  options?: {
    enabled?: boolean;
    onSuccess?: (data: Widget) => void;
    onError?: (error: Error) => void;
  }
) {
  return useQuery<Widget>({
    queryKey: ["widget", id],
    queryFn: async () => {
      // Si no hay ID o es inválido, no hacer la consulta
      if (!id || !/^[0-9a-f]{24}$/.test(id)) {
        throw new Error("ID de widget inválido");
      }

      const response = await apiService.get<Widget>(`/widgets/${id}`);

      if (!response.success) {
        throw new Error(response.error || `Error al obtener el widget ${id}`);
      }

      // Convertir fechas de string a Date
      return {
        ...response.data!,
        createdAt: new Date(response.data!.createdAt),
        updatedAt: new Date(response.data!.updatedAt),
      };
    },
    enabled: !!id && /^[0-9a-f]{24}$/.test(id) && options?.enabled !== false,
    ...options,
  });
}
