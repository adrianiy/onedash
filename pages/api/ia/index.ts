import { kaiaRequest } from "@/lib/kaia";
import { AuthenticatedRequest } from "@/lib/middleware";
import { NextApiResponse } from "next";
import { MetricDefinition, generateMetricId } from "@/types/metricConfig";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

// Interfaces para la respuesta de KAIA
interface StructuredOutput {
  columns: Partial<MetricDefinition>[];
  explanation: string;
}

interface AdditionalKwargs {
  structured_output?: StructuredOutput;
}

interface ColumnsResponse {
  columns?: Partial<MetricDefinition>[];
  explanation?: string;
  content?: string;
  additional_kwargs?: AdditionalKwargs;
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // Validar sesión de usuario
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({
      success: false,
      data: null,
      error: "No autorizado",
    });
  }

  if (req.method === "POST") {
    try {
      const { prompt } = req.body;

      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }

      // Llamada a KAIA para procesar el prompt
      const response = await kaiaRequest<ColumnsResponse>("/agent", "POST", {
        messages: [
          {
            type: "ai",
            content: `Eres un experto analista de datos especializado en transformar peticiones en lenguaje natural a configuraciones técnicas de visualización de datos para dashboards de análisis de negocio. Tu tarea específica es interpretar peticiones y convertirlas en una configuración estructurada de columnas para tablas de análisis comercial.

## CONTEXTO DE NEGOCIO:
Los datos se refieren a métricas de ventas y pedidos de una empresa retail, donde los usuarios necesitan analizar diferentes indicadores (importe, unidades, pedidos) con varios modificadores para obtener insights de negocio.

## INDICADORES DISPONIBLES Y SUS CARACTERÍSTICAS:
1. IMPORTE: Valor monetario de las ventas
   - Requiere SIEMPRE especificar: tipo de venta (bruto/neto/devoluciones) y tipo de cálculo
   - Compatible con: todos los modificadores

2. UNIDADES: Cantidad de productos vendidos
   - Requiere SIEMPRE especificar: tipo de venta (bruto/neto/devoluciones) y tipo de cálculo
   - Compatible con: todos los modificadores

3. PEDIDOS: Número de órdenes realizadas
   - Requiere SIEMPRE especificar: tipo de cálculo
   - Compatible con: timeframe, calculation, comparison
   - NO compatible con: saleType (no aplica el concepto bruto/neto)

## MODIFICADORES Y SUS OPCIONES:
1. TIPO DE VENTA (saleType):
   - bruto: Ventas totales antes de devoluciones
   - neto: Ventas totales menos devoluciones
   - devos: Solo devoluciones

2. PERÍODO (timeframe):
   - hoy: Datos del día actual
   - ayer: Datos del día anterior
   - semana: Datos de la semana actual
   - mes: Datos del mes actual
   - año: Datos del año actual

3. COMPARACIÓN (comparison):
   - actual: Datos del período actual (predeterminado)
   - anterior: Datos del año anterior (A-1)
   - a-2: Datos de hace dos años

4. CÁLCULOS (calculation):
   - valor: Valor absoluto de la métrica
   - crecimiento: Porcentaje de crecimiento respecto al período anterior (A/A-1)
   - peso: Contribución porcentual al total

## REGLAS CRÍTICAS A SEGUIR:
1. Respetar las COMPATIBILIDADES entre indicadores y modificadores.
2. Incluir SIEMPRE los modificadores REQUERIDOS para cada indicador.
3. Utilizar solo los valores ENUMERADOS para cada propiedad.
4. Los identificadores (id) deben seguir el formato "indicador_modificador1_valor1_modificador2_valor2".
5. Generar títulos descriptivos que reflejen claramente qué está midiendo cada columna.

## EJEMPLOS DE INTERPRETACIÓN:
1. "Quiero ver ventas brutas, netas y devoluciones de esta semana"
   → Deberías crear 3 columnas: importe bruto semana, importe neto semana, importe devoluciones semana

2. "Necesito ver el crecimiento de pedidos de este mes vs el año pasado"
   → Deberías crear 1 columna: pedidos mes crecimiento

3. "Muestra unidades vendidas de ayer y su peso sobre el total del mes"
   → Deberías crear 2 columnas: unidades brutas ayer y unidades brutas ayer peso

4. "Importe neto y bruto con crecimientos"
   → Deberías crear 2 columnas: importe neto crecimiento y importe bruto crecimiento

## INSTRUCCIONES FINALES:
- Analiza cuidadosamente cada petición para capturar la intención del usuario.
- Si la petición es ambigua, selecciona los valores más probables según el contexto.
- Genera siempre IDs únicos y válidos según el patrón indicado.
- Si la petición menciona explícitamente un ancho de columna, inclúyelo.
- Si la petición sugiere un nombre personalizado, inclúyelo en displayName.
- Asegúrate de que cada columna generada sea válida y utilizable en un dashboard real.`,
          },
          {
            type: "human",
            content: prompt,
            output_format_schema: {
              name: "table_columns_config",
              description:
                "Configuración de columnas para widget de tabla basada en el prompt del usuario",
              strict: true,
              parameters: {
                type: "object",
                properties: {
                  columns: {
                    type: "array",
                    description:
                      "Lista de columnas para configurar en el widget",
                    items: {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                          description:
                            "Identificador único para la columna siguiendo el formato indicador_modificador_valor",
                        },
                        indicator: {
                          type: "string",
                          enum: ["importe", "unidades", "pedidos"],
                          description: "Tipo de indicador para la columna",
                        },
                        modifiers: {
                          type: "object",
                          properties: {
                            saleType: {
                              type: "string",
                              enum: ["bruto", "neto", "devos"],
                              description:
                                "Tipo de venta (compatible con importe y unidades)",
                            },
                            timeframe: {
                              type: "string",
                              enum: ["hoy", "ayer", "semana", "mes", "año"],
                              description: "Período de tiempo para el análisis",
                            },
                            comparison: {
                              type: "string",
                              enum: ["actual", "anterior", "a-2"],
                              description: "Período de comparación",
                            },
                            calculation: {
                              type: "string",
                              enum: ["valor", "crecimiento", "peso"],
                              description: "Tipo de cálculo a realizar",
                            },
                          },
                          required: [
                            "saleType",
                            "timeframe",
                            "comparison",
                            "calculation",
                          ],
                          additionalProperties: false,
                        },
                        title: {
                          type: "string",
                          description: "Título descriptivo para la columna",
                        },
                        displayName: {
                          type: "string",
                          description:
                            "Nombre personalizado para mostrar (opcional)",
                        },
                      },
                      required: [
                        "id",
                        "indicator",
                        "displayName",
                        "modifiers",
                        "title",
                      ],
                    },
                  },
                  explanation: {
                    type: "string",
                    description:
                      "Explicación de cómo se interpretó el prompt y por qué se seleccionaron estas columnas",
                  },
                },
                required: ["columns", "explanation"],
                additionalProperties: false,
              },
            },
          },
        ],
        model: "gpt-41",
      });

      // Extraer los datos de la respuesta según el formato recibido
      let columnsData = [];
      let explanation = "";

      // Verificar si la respuesta tiene el formato estructurado
      if (
        response &&
        response.additional_kwargs &&
        response.additional_kwargs.structured_output
      ) {
        const structuredOutput = response.additional_kwargs.structured_output;
        columnsData = structuredOutput.columns || [];
        explanation = structuredOutput.explanation || "";
      }
      // Verificar si la respuesta tiene el formato antiguo
      else if (
        response &&
        response.columns &&
        Array.isArray(response.columns)
      ) {
        columnsData = response.columns;
        explanation = response.explanation || "";
      }
      // Si no se puede extraer los datos, intentar parsear el contenido
      else if (response && response.content) {
        try {
          const parsedContent = JSON.parse(response.content);
          columnsData = parsedContent.columns || [];
          explanation = parsedContent.explanation || "";
        } catch (parseError) {
          console.error(
            "Error al parsear el contenido de la respuesta:",
            parseError
          );
          return res.status(500).json({
            message: "Error al parsear el contenido de la respuesta",
            error:
              parseError instanceof Error
                ? parseError.message
                : String(parseError),
          });
        }
      } else {
        return res.status(500).json({
          message: "Formato de respuesta inválido del servicio de IA",
          response,
        });
      }

      // Verificar que se hayan obtenido columnas
      if (Array.isArray(columnsData) && columnsData.length > 0) {
        // Validar que las columnas tengan los campos requeridos y sean compatibles
        const processedColumns = columnsData.map(
          (column: Partial<MetricDefinition>) => {
            // Validación básica
            if (!column.indicator || !column.modifiers) {
              throw new Error(
                "Columna inválida: falta indicador o modificadores"
              );
            }

            // Si no tiene ID o es inválido, generarlo
            if (!column.id) {
              column.id = generateMetricId(column.indicator, column.modifiers);
            }

            return column;
          }
        );

        return res.status(200).json({
          columns: processedColumns,
          explanation: explanation,
        });
      } else {
        return res.status(500).json({
          message: "No se encontraron columnas válidas en la respuesta",
          response,
        });
      }
    } catch (error) {
      console.error("Error al procesar la petición de IA:", error);
      return res.status(500).json({
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  } else {
    return res.status(405).json({ message: "Método no permitido" });
  }
}

export default handler;
