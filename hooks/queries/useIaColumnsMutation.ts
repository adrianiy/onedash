import { useMutation } from "@tanstack/react-query";
import type { MetricDefinition } from "@/types/metricConfig";

// Interfaces para tipado
export interface IaColumnsResponse {
  columns: MetricDefinition[];
  explanation: string;
}

// Función para hacer la petición al endpoint
const generateColumnsFromPrompt = async (
  prompt: string
): Promise<IaColumnsResponse> => {
  const response = await fetch("/api/ia", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al generar columnas con IA");
  }

  return await response.json();
};

// Hook personalizado con React Query y opciones adicionales
export const useIaColumnsMutation = () => {
  return useMutation<IaColumnsResponse, Error, string>({
    mutationFn: generateColumnsFromPrompt,
    onError: (error) => {
      console.error("Error en la consulta IA:", error);
    },
    // Configuración adicional para evitar múltiples peticiones simultáneas
    // y mejorar la experiencia del usuario
    retry: 1,
    retryDelay: 1000,
    // Si quisiéramos caché, podríamos configurarlo así:
    // cacheTime: 5 * 60 * 1000, // 5 minutos
  });
};
