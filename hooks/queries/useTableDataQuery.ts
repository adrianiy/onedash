import { useQuery } from "@tanstack/react-query";
import { MetricDefinition } from "@/types/metricConfig";
import { DataFilters } from "@/utils/dataGeneration";
import { getDatasourceFromIndicator } from "./useWidgetDataQuery";

// Tipo para los datos de una tabla
export type TableData = Record<string, unknown>[];

// Interfaz para la respuesta de la API
export interface ApiTableResponse {
  success: boolean;
  data: TableData;
  error?: string;
}

/**
 * Hook para obtener datos de una tabla
 * @param columns Columnas de la tabla (métricas)
 * @param breakdownLevels Niveles de desglose (dimensiones)
 * @param filters Filtros opcionales
 */
export function useTableDataQuery(
  columns: MetricDefinition[] = [],
  breakdownLevels: string[] = [],
  filters?: {
    products?: string[];
    sections?: string[];
    dateRange?: {
      start: string | null;
      end: string | null;
    };
  }
) {
  // Comprobar si hay datos suficientes para generar la tabla
  const canFetchData = Boolean(
    columns.length > 0 && breakdownLevels.length > 0
  );

  // Determinar el datasource basado en los indicadores de las columnas
  // Si hay diferentes indicadores, usamos el primero o uno predeterminado
  let datasource = "table";
  if (canFetchData && columns.length > 0) {
    // Intentamos encontrar un indicador que no sea dinámico para determinar el datasource
    const staticColumn = columns.find((c) => typeof c.indicator === "string");
    if (staticColumn) {
      datasource = getDatasourceFromIndicator(staticColumn.indicator);
    } else {
      // Si todos son dinámicos, usamos el primer indicador
      datasource = getDatasourceFromIndicator(columns[0].indicator);
    }
  }

  const finalDatasource =
    canFetchData && datasource === "dynamic" ? "table" : datasource;

  // Usar useQuery directamente
  return useQuery<ApiTableResponse, Error, TableData>({
    // La queryKey asegura que solo se hace una petición por configuración única
    queryKey: [
      "table-data",
      finalDatasource,
      canFetchData
        ? columns.map((c) => ({
            id: c.id,
            indicator: c.indicator,
            modifiers: c.modifiers,
          }))
        : [],
      breakdownLevels,
      filters,
    ],

    queryFn: async () => {
      if (!canFetchData) {
        return {
          success: true,
          data: [] as TableData,
        };
      }

      // Convertir los filtros al formato de la API
      const apiFilters: DataFilters = {};

      if (filters?.products?.length) {
        apiFilters.selectedProducts = filters.products;
      }

      if (filters?.sections?.length) {
        apiFilters.selectedSections = filters.sections;
      }

      if (filters?.dateRange) {
        apiFilters.dateStart = filters.dateRange.start;
        apiFilters.dateEnd = filters.dateRange.end;
      }

      const response = await fetch(`/api/widget-data/${finalDatasource}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          columns,
          breakdownLevels,
          filters: apiFilters,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Error al obtener datos: ${response.status}`
        );
      }

      return response.json();
    },

    // Desactivar la consulta si no hay suficientes datos
    enabled: canFetchData,

    // Valor inicial para consultas no válidas
    initialData: canFetchData
      ? undefined
      : {
          success: true,
          data: [] as TableData,
        },

    // Transformar la respuesta
    select: (response) => {
      if (!response.success) {
        throw new Error(response.error || "Error desconocido");
      }
      return response.data;
    },
  });
}
