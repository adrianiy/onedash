import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { type DataFilters } from "@/utils/dataGeneration";
import { generateChartData } from "@/utils/generateChartData";
import { generateTableData } from "@/utils/generateTableData";
import { generateMetricData } from "@/utils/generateMetricData";

// Definir interfaz de respuesta general
interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  error?: string;
}

/**
 * Endpoint API para proporcionar datos a los widgets según el datasource
 *
 * Este endpoint acepta solicitudes con:
 * - metricDefinition (para métricas individuales)
 * - columns y breakdownLevels (para tablas)
 * - xAxisDimension y columns (para gráficos)
 * - filtros generales: productos, secciones, fechas, etc.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  try {
    // Validar sesión de usuario
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({
        success: false,
        data: null,
        error: "No autorizado",
      });
    }

    // Solo permitir POST
    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        data: null,
        error: "Método no permitido",
      });
    }

    // Extraer el tipo de datos solicitado (datasource)
    const { datasource } = req.query;

    // Extraer datos de la solicitud
    const {
      metricDefinition,
      columns,
      breakdownLevels,
      xAxisDimension,
      filters = {},
    } = req.body;

    // Preparar datos basados en el tipo de datasource
    let responseData: unknown = null;

    // Convertir filtros para asegurar compatibilidad
    const apiFilters: DataFilters = {
      selectedProducts: filters.products || filters.selectedProducts || [],
      selectedSections: filters.sections || filters.selectedSections || [],
      dateStart: filters.dateRange?.start || filters.dateStart || null,
      dateEnd: filters.dateRange?.end || filters.dateEnd || null,
    };

    switch (datasource) {
      case "metric":
        // Para una métrica individual
        if (!metricDefinition) {
          return res.status(400).json({
            success: false,
            data: null,
            error: "Definición de métrica requerida",
          });
        }

        responseData = generateMetricData(metricDefinition, apiFilters);
        break;

      case "chart":
        // Para datos de un gráfico
        if (!xAxisDimension || !columns || !Array.isArray(columns)) {
          return res.status(400).json({
            success: false,
            data: null,
            error: "xAxisDimension y columns son requeridos para gráficos",
          });
        }

        responseData = generateChartData(xAxisDimension, columns, apiFilters);
        break;

      case "table":
        // Para datos de una tabla
        if (
          !columns ||
          !Array.isArray(columns) ||
          !breakdownLevels ||
          !Array.isArray(breakdownLevels)
        ) {
          return res.status(400).json({
            success: false,
            data: null,
            error: "columns y breakdownLevels son requeridos para tablas",
          });
        }

        responseData = generateTableData(columns, breakdownLevels, apiFilters);
        break;

      case "venta":
        // Dependiendo de lo que se solicite, elegir el generador correspondiente
        if (metricDefinition) {
          responseData = generateMetricData(metricDefinition, apiFilters);
        } else if (xAxisDimension && columns) {
          responseData = generateChartData(xAxisDimension, columns, apiFilters);
        } else if (columns && breakdownLevels) {
          responseData = generateTableData(
            columns,
            breakdownLevels,
            apiFilters
          );
        } else {
          return res.status(400).json({
            success: false,
            data: null,
            error: "Parámetros insuficientes para el datasource 'venta'",
          });
        }
        break;

      default:
        return res.status(400).json({
          success: false,
          data: null,
          error: `Datasource desconocido: ${datasource}`,
        });
    }

    // Devolver respuesta exitosa
    return res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Error al procesar solicitud de datos:", error);
    return res.status(500).json({
      success: false,
      data: null,
      error: "Error interno del servidor",
    });
  }
}
