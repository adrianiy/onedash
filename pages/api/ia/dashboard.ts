import { kaiaRequest } from "@/lib/kaia";
import { AuthenticatedRequest } from "@/lib/middleware";
import { NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { Widget, WidgetType } from "@/types/widget";
import {
  simpleTemplate,
  advancedTemplate,
  detailTemplate,
} from "@/utils/dashboardTemplates";

// Interfaces para la respuesta de KAIA
interface WidgetConfig {
  type: WidgetType;
  title: string;
  description?: string;
  config: Record<string, any>;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
}

interface DashboardStructure {
  name: string;
  description?: string;
  widgets: WidgetConfig[];
}

interface DashboardIAResponse {
  dashboard: DashboardStructure;
  userMessage: string;
  suggestions?: string[];
  needsMoreInfo?: {
    question: string;
    context: string;
  };
}

interface TransformedDashboardResult {
  dashboard: any; // Dashboard con widgets como array de IDs
  widgets: Record<string, any>; // Objeto con widgets indexados por ID
}

interface StructuredOutput {
  dashboard: DashboardStructure;
  userMessage: string;
  suggestions?: string[];
  needsMoreInfo?: {
    question: string;
    context: string;
  };
}

interface AdditionalKwargs {
  structured_output?: StructuredOutput;
}

interface DashboardResponse {
  dashboard?: DashboardStructure;
  userMessage?: string;
  suggestions?: string[];
  needsMoreInfo?: {
    question: string;
    context: string;
  };
  content?: string;
  additional_kwargs?: AdditionalKwargs;
}

/**
 * Transforma un dashboard con widgets en formato array a un dashboard con widgets como IDs
 * y un objeto separado con los widgets indexados por ID
 */
function transformToDashboard(dashboardData: any): TransformedDashboardResult {
  // Crear una copia profunda para no modificar el original
  const dashboard = JSON.parse(JSON.stringify(dashboardData));
  const widgetsMap: Record<string, any> = {};

  // Si el dashboard no tiene widgets, devolver estructura vacía
  if (!Array.isArray(dashboard.widgets) || dashboard.widgets.length === 0) {
    return { dashboard: { ...dashboard, widgets: [] }, widgets: {} };
  }

  // Procesar cada widget y asignarle un ID si no lo tiene
  const widgetIds: string[] = [];

  dashboard.widgets.forEach((widget: any, index: number) => {
    // Asegurar que el widget tenga un ID único
    const widgetId = widget._id || `widget_${Date.now()}_${index}`;
    widget._id = widgetId;

    // Guardar el widget en el mapa usando su ID como clave
    widgetsMap[widgetId] = widget;

    // Almacenar el ID en el array de IDs
    widgetIds.push(widgetId);
  });

  // Reemplazar el array de widgets en el dashboard con el array de IDs
  dashboard.widgets = widgetIds;

  return {
    dashboard,
    widgets: widgetsMap,
  };
}

/**
 * Handler para el endpoint de IA para configurar dashboards
 */
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
      const { prompt, context } = req.body;

      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }

      // Extraer información de plantillas para enriquecer el contexto
      const templateContext = {
        simpleTemplate: {
          id: simpleTemplate.id,
          name: simpleTemplate.name,
          description: simpleTemplate.description,
          tags: simpleTemplate.tags,
          use_cases: simpleTemplate.use_cases,
          layouts: simpleTemplate.layouts,
          widgets: simpleTemplate.widgets.reduce((acc: any, w: Widget) => {
            acc[w._id] = {
              type: w.type,
              title: w.title,
              description: w.description,
            };
            return acc;
          }, {}),
        },
        advancedTemplate: {
          id: advancedTemplate.id,
          name: advancedTemplate.name,
          description: advancedTemplate.description,
          tags: advancedTemplate.tags,
          use_cases: advancedTemplate.use_cases,
          layouts: advancedTemplate.layouts,
          widgets: advancedTemplate.widgets.reduce((acc: any, w: Widget) => {
            acc[w._id] = {
              type: w.type,
              title: w.title,
              description: w.description,
            };
            return acc;
          }, {}),
        },
        detailTemplate: {
          id: detailTemplate.id,
          name: detailTemplate.name,
          description: detailTemplate.description,
          tags: detailTemplate.tags,
          use_cases: detailTemplate.use_cases,
          layouts: detailTemplate.layouts,
          widgets: detailTemplate.widgets.reduce((acc: any, w: Widget) => {
            acc[w._id] = {
              type: w.type,
              title: w.title,
              description: w.description,
            };
            return acc;
          }, {}),
        },
      };

      // Parsear el contexto para determinar si estamos modificando un dashboard existente
      let existingDashboard: any = null;
      let existingWidgets: Record<string, Widget> = {};
      let isModification = false;

      if (context) {
        try {
          const parsedContext = JSON.parse(context);
          if (parsedContext?.currentDashboard?.isExistingDashboard) {
            existingDashboard = parsedContext.currentDashboard;
            existingWidgets =
              parsedContext.currentDashboard.dashboardWidgets || {};
            isModification = true;
            console.log(
              "Detectado contexto de dashboard existente:",
              existingDashboard.name
            );
          }
        } catch (error) {
          console.error("Error al parsear el contexto:", error);
        }
      }

      // Seleccionar el prompt adecuado según si estamos creando o modificando
      const promptIntro = isModification
        ? `Eres un experto en diseño de dashboards de análisis de datos especializado en MODIFICAR dashboards existentes según peticiones en lenguaje natural. Tu tarea es interpretar peticiones y aplicar cambios específicos al dashboard existente que se te proporciona en el contexto, manteniendo la estructura general pero realizando las modificaciones solicitadas.`
        : `Eres un experto en diseño de dashboards de análisis de datos especializado en transformar peticiones en lenguaje natural a configuraciones técnicas completas de dashboards para análisis de negocio. Tu tarea es interpretar peticiones y convertirlas en una configuración estructurada de dashboard completo, incluyendo distintos widgets como métricas, gráficas y tablas, con su configuración y distribución en el layout.`;

      // Llamada a KAIA para procesar el prompt
      const response = await kaiaRequest<DashboardResponse>("/agent", "POST", {
        messages: [
          {
            type: "ai",
            content: `${promptIntro}

${
  isModification
    ? `
IMPORTANTE: Estás MODIFICANDO un dashboard existente, NO creando uno nuevo. Debes trabajar con el dashboard actual y hacer SOLO los cambios específicos que pide el usuario.

ESTADO ACTUAL DEL DASHBOARD:
dashboard: ${JSON.stringify(existingDashboard, null, 2)}

INSTRUCCIONES PARA MODIFICAR UN DASHBOARD:
1. NUNCA regeneres todo el dashboard desde cero
2. Mantén todos los widgets existentes que no se mencionen explícitamente para cambiar o eliminar
3. Preserva los IDs de los widgets existentes que mantengas - NO GENERES NUEVOS IDs
4. Respeta los layouts originales para los widgets que no cambien

5. REGLA CRÍTICA DE PRESERVACIÓN: SOLO modifica las propiedades ESPECÍFICAMENTE mencionadas en la petición del usuario:
   * Si solo piden cambiar la altura (height), PRESERVA el ancho (width) exactamente como estaba
   * Si solo piden cambiar el ancho (width), PRESERVA la altura (height) exactamente como estaba
   * Si solo piden cambiar colores o estilos, NO MODIFIQUES ninguna dimensión o posición
   * Si solo piden cambiar el título, PRESERVA toda la configuración técnica tal cual estaba

6. INSTRUCCIONES ESPECÍFICAS PARA LAYOUTS:
   * Cuando se pide "hacer más alto" o "aumentar altura" - SOLO modifica la propiedad "h" en los layouts
   * Cuando se pide "hacer más ancho" o "aumentar ancho" - SOLO modifica la propiedad "w" en los layouts
   * NUNCA cambies coordenadas "x", "y" salvo que se pidan explícitamente cambios de posición
   * Preserva EXACTAMENTE el mismo valor numérico para dimensiones no mencionadas

7. Si el usuario pide eliminar un widget, elimínalo completamente (no solo ocultarlo)
8. Si el usuario pide añadir un widget, créalo con un ID nuevo y colócalo en una posición adecuada
9. Si el usuario pide modificar un widget, mantén su ID pero actualiza su configuración según lo solicitado

EJEMPLOS DE MODIFICACIONES PARCIALES:
* Si usuario dice "haz los widgets más altos" → SOLO cambiar "h" (altura) en layouts, mantener "w", "x", "y" idénticos
* Si usuario dice "cambiar el título a..." → SOLO cambiar la propiedad "title", mantener todo lo demás igual
* Si usuario dice "añadir un nuevo KPI" → Mantener todos los widgets actuales y añadir uno nuevo
`
    : ""
}

IMPORTANTE: DEBES generar un objeto JSON completo que incluya la configuración técnica del dashboard. NO solo generes una respuesta conversacional. El objeto JSON DEBE seguir exactamente la estructura que te indicaré más adelante.

## CONTEXTO DE NEGOCIO:
Los datos se refieren a métricas de ventas y pedidos de una empresa retail, donde los usuarios necesitan analizar diferentes indicadores (importe, unidades, pedidos) con varios modificadores para obtener insights de negocio.

## TIPOS DE WIDGETS DISPONIBLES:

1. MÉTRICA (metric): Para mostrar KPIs y valores numéricos
   - Muestra valores numéricos con una métrica principal y secundaria
   - Puede incluir variaciones, crecimientos o comparativas
   - Tamaño recomendado: w=8, h=2 (en desktop)

2. GRÁFICA (chart): Para visualizar datos y tendencias
   - Gráficos de barras para análisis comparativos y temporales
   - Puede incluir múltiples series de datos
   - Tamaño recomendado: w=12, h=4 (en desktop)

3. TABLA (table): Para mostrar datos detallados
   - Muestra datos estructurados en filas y columnas
   - Puede incluir formateo condicional
   - CRUCIAL: Usa ÚNICAMENTE valores válidos en "breakdownLevels" (listados más abajo)
   - Tamaño recomendado: w=24, h=6 (en desktop, ancho completo)

4. COMPARACIÓN (comparison): Para comparar métricas o periodos
   - Permite comparar indicadores o periodos diferentes
   - Visualizaciones: barras, stacked, progress
   - Tamaño recomendado: w=12, h=4 (en desktop)

## SISTEMA DE GRID Y BREAKPOINTS:

El dashboard utiliza un sistema de grid responsivo con diferentes columnas según el dispositivo:
1. Desktop (lg): 24 columnas disponibles
2. Tablet (md): 18 columnas disponibles
3. Móvil (sm): 8 columnas disponibles

Recomendaciones para layouts responsivos:
- En desktop (lg): Utiliza múltiplos de 4 o 6 para anchos (4, 6, 8, 12, 16, 24)
- En tablet (md): Utiliza múltiplos de 3 para anchos (3, 6, 9, 12, 18)
- En móvil (sm): Generalmente ocupar todo el ancho (w=8)

## INDICADORES Y MODIFICADORES DISPONIBLES:

1. INDICADORES:
   - importe: Valor monetario de las ventas
   - unidades: Cantidad de productos vendidos
   - pedidos: Número de órdenes realizadas

2. MODIFICADORES:
   - saleType: bruto, neto, devos (no aplicable a 'pedidos')
   - timeframe: hoy, ayer, semana, mes, año
   - comparison: actual, anterior, a-2
   - calculation: valor, crecimiento, peso

## PLANTILLAS DE DASHBOARDS:

Te proporciono ejemplos de plantillas de dashboard que puedes usar como inspiración:

${JSON.stringify(templateContext, null, 2)}

## INSTRUCCIONES PARA CREAR UN DASHBOARD:

1. Analiza la petición del usuario para identificar:
   - Tipo de dashboard solicitado (ejecutivo, ventas, operacional, etc.)
   - Métricas y KPIs requeridos
   - Periodo de análisis
   - Cualquier visualización específica mencionada

2. Genera un dashboard completo con:
   - Nombre descriptivo y relevante
   - 3-8 widgets apropiados para la solicitud
   - Configuración detallada de cada widget
   - Posicionamiento lógico de los widgets (los más importantes arriba)
   - Aprovecha todo el ancho disponible en cada breakpoint (24/18/8 columnas)

3. Estructura el layout siguiendo estas pautas:
   - KPIs importantes arriba (generalmente 3-4 métricas en la primera fila)
   - Gráficos de análisis en la zona media
   - Tablas detalladas o gráficos secundarios en la parte inferior
   - Asegúrate que cada fila sume exactamente el total de columnas disponibles

3. Genera una respuesta conversacional amigable que:
   - Explique al usuario qué has creado
   - Mencione los widgets y métricas incluidas
   - Sugiera posibles mejoras o adiciones
   - Pregunte si desea realizar cambios específicos

4. Si la petición es ambigua o incompleta:
   - Solicita información adicional específica
   - Explica qué detalles necesitas y por qué son importantes
   - Sugiere opciones para ayudar al usuario a decidir

5. NUNCA omitas la configuración del dashboard:
   - SIEMPRE debes incluir el objeto "dashboard" completo
   - SIEMPRE incluye widgets con configuración detallada
   - NO generes respuestas que solo incluyan "userMessage" sin configuración

## FORMATO DE RESPUESTA:

IMPORTANTE: Debes responder ÚNICAMENTE con un JSON válido que contenga EXACTAMENTE la siguiente estructura, sin texto explicativo antes o después del JSON:

\`\`\`json
{
  "dashboard": {
    "name": "Nombre del Dashboard",
    "description": "Descripción del propósito del dashboard",
    "widgets": [
      {
        "_id": "widget unique id",
        "type": "metric|chart|table|comparison",
        "title": "Título del widget",
        "description": "Descripción del widget",
        "config": {
          // Configuración específica según tipo de widget
          // Para métricas:
          "primaryMetric": {
            "id": "metrica1",
            "indicator": "importe|unidades|pedidos",
            "title": "Título personalizado (opcional)",
            "modifiers": {
              "saleType": "bruto|neto|devos", // No aplicable para pedidos
              "timeframe": "hoy|ayer|semana|mes|año",
              "comparison": "actual|anterior|a-2",
              "calculation": "valor|crecimiento|peso"
            }
          },
          "secondaryMetric": {
            // Misma estructura que primaryMetric (opcional)
            "id": "metrica2",
            "indicator": "unidades",
            "title": "Título personalizado (opcional)",
            "modifiers": {
              "saleType": "bruto",
              "timeframe": "mes",
              "comparison": "anterior",
              "calculation": "crecimiento"
            }
          },
          "size": "small|medium|large",
          "alignment": "left|center|right",
          "visualization": { "showTitle": true }
          
          // Para gráficos:
          "chartType": "bar|line|pie|area",
          "xAxisDimension": "tiempo|producto|categoría",
          "series": [],
          "data": [],
          "visualization": { "showTitle": true, "showLegend": true, "showGrid": true }
          
          // Para tablas:
          "columns": [], // Métricas a mostrar como columnas (importe, unidades, pedidos)
          "data": [],
          // IMPORTANTE: Solo usar valores EXACTOS de esta lista en breakdownLevels:
          // Geográfico: 'zone' (Zona), 'country' (País), 'city' (Ciudad), 'store' (Tienda)
          // Comercial: 'product' (Producto), 'section' (Sección), 'family' (Familia), 'buyer' (Comprador)
          // Temporal: 'day' (Día), 'week' (Semana), 'month' (Mes), 'quarter' (Quarter), 'year' (Año)
          "breakdownLevels": [],
          "visualization": { "showTitle": true, "compact": false, "showBorders": true, "alternateRowColors": true }
          
          // Para comparación:
          "dimension": "tiempo|métrica|custom",
          "visualizationType": "bars|progress|stacked",
          // Si dimension es custom:
          "comparisonMetrics": [],
          // Si dimension es tiempo o métrica:
          "primaryMetric": {},
          "secondaryMetric": {},
          "visualization": { "showTitle": true, "showLegend": true }
        }
        // IMPORTANTE: NO INCLUIR coordenadas x, y, w, h aquí. Deben ir en layouts
      }
      // ... más widgets según necesidad
    ],
    // ESTRUCTURA DE LAYOUTS - REQUERIDO
    "layouts": {
      "lg": [
        // Layout para pantalla grande (24 columnas)
        {"i": "widget1_id", "x": 0, "y": 0, "w": 8, "h": 2, "static": false},
        {"i": "widget2_id", "x": 8, "y": 0, "w": 8, "h": 2, "static": false},
        {"i": "widget3_id", "x": 16, "y": 0, "w": 8, "h": 2, "static": false}
      ],
      "md": [
        // Layout para tablet (18 columnas)
        {"i": "widget1_id", "x": 0, "y": 0, "w": 6, "h": 2, "static": false},
        {"i": "widget2_id", "x": 6, "y": 0, "w": 6, "h": 2, "static": false},
        {"i": "widget3_id", "x": 12, "y": 0, "w": 6, "h": 2, "static": false}
      ],
      "sm": [
        // Layout para móvil (8 columnas)
        {"i": "widget1_id", "x": 0, "y": 0, "w": 8, "h": 2, "static": false},
        {"i": "widget2_id", "x": 0, "y": 2, "w": 8, "h": 2, "static": false},
        {"i": "widget3_id", "x": 0, "y": 4, "w": 8, "h": 2, "static": false}
      ]
    }
  },
  "userMessage": "Mensaje conversacional para el usuario explicando el dashboard",
  "suggestions": [
    "Sugerencia 1 para mejorar el dashboard",
    "Sugerencia 2 para mejorar el dashboard"
  ],
  "needsMoreInfo": {
    "question": "", // Dejar vacío si no se necesita más información
    "context": ""   // Dejar vacío si no se necesita más información
  }
}
\`\`\`

Si la petición es clara y completa, los campos 'needsMoreInfo.question' y 'needsMoreInfo.context' deben estar vacíos.
Si necesitas más información, debes indicar una pregunta específica en 'needsMoreInfo.question' y explicar por qué en 'needsMoreInfo.context'.

## IMPORTANTE:
- Tu respuesta debe ser SIEMPRE un JSON válido y parseable
- NUNCA omitas el objeto "dashboard" ni sus widgets
- DEBES incluir al menos 3 widgets en cada dashboard
- El campo "needsMoreInfo.question" debe estar VACÍO si NO necesitas más información
- SÓLO incluye una pregunta en "needsMoreInfo.question" si REALMENTE necesitas más información del usuario

## ASPECTOS CRÍTICOS DEL FORMATO:
1. Los widgets NO deben tener propiedades x, y, w, h directamente en ellos
2. SIEMPRE debes incluir el objeto "layouts" a nivel del dashboard con los tres breakpoints: lg, md, sm
3. Cada layout debe tener objetos con formato {"i": "widget_id", "x": 0, "y": 0, "w": 8, "h": 2, "static": false}
4. La propiedad "i" en cada elemento del layout debe corresponder con el _id del widget al que se refiere
5. NUNCA incluyas modifiers como string, SIEMPRE como objeto, ejemplo INCORRECTO: "modifiers": "importe"
6. SIEMPRE que definas una métrica (primaryMetric o secondaryMetric), asegúrate de que tenga un objeto modifiers completo

## NOTA IMPORTANTE:
- Tu respuesta debe ser un JSON válido y parseable
- Tu respuesta DEBE incluir SIEMPRE el objeto "dashboard" completo con sus widgets
- Asegúrate de que tu respuesta sea en español. Si el usuario escribe en inglés, responde en español igualmente.
- La estructura JSON debe ser exactamente como se indicó, ya que será procesada automáticamente.
- NO agregues comentarios fuera del JSON, solo responde con el objeto JSON.`,
          },
          {
            type: "human",
            content:
              prompt +
              (isModification
                ? `\n\nModifica el dashboard existente según esta petición.`
                : ""),
          },
        ],
        model: "gpt-41",
      });

      console.log(response);

      // Extraer los datos de la respuesta según el formato recibido
      let dashboardData: DashboardIAResponse | null = null;

      // Verificar si la respuesta tiene el formato antiguo
      if (response?.dashboard) {
        dashboardData = {
          dashboard: response.dashboard,
          userMessage: response.userMessage || "",
          suggestions: response.suggestions,
          needsMoreInfo: response.needsMoreInfo,
        };
      }
      // Si no se puede extraer los datos, intentar parsear el contenido
      else if (response?.content) {
        try {
          // Limpiar la respuesta de posibles delimitadores markdown
          let cleanContent = response.content;
          console.log("Respuesta original:", cleanContent);

          // Eliminar delimitadores de bloque de código markdown si existen
          const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)```/;
          const match = cleanContent.match(jsonBlockRegex);
          if (match && match[1]) {
            cleanContent = match[1];
            console.log("JSON extraído del bloque de código:", cleanContent);
          }

          // Intentar parsear el JSON limpio
          const parsedContent = JSON.parse(cleanContent);
          console.log("JSON parseado:", parsedContent);

          // Verificar que el dashboard esté presente
          if (!parsedContent.dashboard) {
            console.error(
              "La respuesta no contiene el objeto dashboard:",
              parsedContent
            );
            return res.status(500).json({
              message:
                "La respuesta de IA no incluye la configuración del dashboard",
              response,
            });
          }

          dashboardData = {
            dashboard: parsedContent.dashboard,
            userMessage: parsedContent.userMessage || "",
            suggestions: parsedContent.suggestions || [],
            needsMoreInfo: parsedContent.needsMoreInfo,
          };
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
      }

      if (!dashboardData || !dashboardData.dashboard) {
        return res.status(500).json({
          message: "Formato de respuesta inválido del servicio de IA",
          response,
        });
      }

      // Si realmente se necesita más información (con pregunta válida), devolver la solicitud
      if (
        dashboardData.needsMoreInfo?.question &&
        dashboardData.needsMoreInfo.question.trim() !== ""
      ) {
        console.log(
          "Se requiere información adicional:",
          dashboardData.needsMoreInfo
        );
        return res.status(200).json({
          data: {
            needsMoreInfo: dashboardData.needsMoreInfo,
            userMessage: dashboardData.userMessage,
          },
        });
      }

      // Verificar que el dashboard tenga widgets
      if (
        !Array.isArray(dashboardData.dashboard.widgets) ||
        dashboardData.dashboard.widgets.length === 0
      ) {
        return res.status(500).json({
          message: "No se encontraron widgets válidos en la respuesta",
          response,
        });
      }

      // Si es una modificación, preservar el ID del dashboard original
      if (isModification && existingDashboard._id) {
        // Añadir el ID al dashboard como propiedad adicional para preservarlo
        (dashboardData.dashboard as any)._id = existingDashboard._id;
      }

      // Transformar los widgets de array a objeto con IDs como claves
      const transformedData = transformToDashboard(dashboardData.dashboard);

      return res.status(200).json({
        data: {
          dashboard: transformedData.dashboard,
          widgets: transformedData.widgets,
          userMessage: dashboardData.userMessage,
          suggestions: dashboardData.suggestions || [],
        },
      });
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
