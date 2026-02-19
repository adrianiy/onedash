import { kaiaRequest } from "@/lib/kaia";
import { AuthenticatedRequest } from "@/lib/middleware";
import { NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { Widget, WidgetType } from "@/types/widget";
import { RetryContext } from "@/types/iaChat";
import { v4 as uuidv4 } from "uuid";
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

// Interfaces para el sistema de diff (JSON Patch)
interface DiffOperation {
  op: "add" | "remove" | "replace" | "move" | "copy" | "test";
  path: string;
  value?: any;
  from?: string; // Para operaciones move/copy
}

interface DashboardDiffResponse {
  type: "diff_operations";
  operations: DiffOperation[];
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
  type?: "full_dashboard" | "diff_operations";
  operations?: DiffOperation[];
}

/**
 * Procesa las operaciones diff para asegurar que todos los widgets añadidos tengan un ID único
 * @param operations Array de operaciones diff
 * @returns Array de operaciones procesadas
 */
function processDiffOperations(operations: DiffOperation[]): DiffOperation[] {
  if (!Array.isArray(operations)) return operations;

  return operations.map((operation) => {
    // Solo procesar operaciones de tipo "add" que añaden widgets nuevos
    if (operation.op === "add" && operation.path.startsWith("/widgets/")) {
      // Si el widget no tiene _id, añadir uno
      if (
        operation.value &&
        typeof operation.value === "object" &&
        !operation.value._id
      ) {
        console.log(`Añadiendo _id a widget en ruta: ${operation.path}`);
        // Generar un ID único con uuid
        operation.value._id = `widget_${uuidv4()}`;
      }
    }
    return operation;
  });
}

/**
 * Detecta si un error es recuperable (puede ser reintentado)
 * Los errores recuperables son aquellos relacionados con formato de JSON o estructura incorrecta
 */
function isRecoverableError(error: any): boolean {
  if (!error) return false;

  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
      ? error
      : String(error);

  // Errores de parsing de JSON son recuperables
  if (
    errorMessage.includes("JSON") ||
    errorMessage.includes("json") ||
    errorMessage.includes("parse") ||
    errorMessage.includes("syntax")
  ) {
    return true;
  }

  // Errores de estructura de dashboard son recuperables
  if (
    errorMessage.includes("dashboard") ||
    errorMessage.includes("widgets") ||
    errorMessage.includes("operations") ||
    errorMessage.includes("diff")
  ) {
    return true;
  }

  // Por defecto, otros tipos de errores no son recuperables
  return false;
}

/**
 * Crea un contexto enriquecido para el reintento, incluyendo el error original
 */
function createRetryContext(error: any, originalResponse: any): RetryContext {
  return {
    originalMessage:
      "Ha ocurrido un error al procesar la respuesta. Intentando corregir...",
    errorDetails: error instanceof Error ? error.message : String(error),
    failedResponse:
      typeof originalResponse === "string"
        ? originalResponse
        : JSON.stringify(originalResponse, null, 2),
    attempt: 1,
  };
}

/**
 * Procesa una solicitud a la IA con manejo de errores y reintentos
 */
async function processIARequest(
  messages: any[],
  kaiaMessages: any[],
  context: any = null,
  retryContext: RetryContext | null = null
): Promise<DashboardResponse> {
  try {
    // Si es un reintento, añadir contexto de error para ayudar a la corrección
    if (retryContext) {
      console.log("Reintentando con contexto de error:", retryContext);

      // Añadir mensaje de sistema con información del error para ayudar a la IA a corregirlo
      kaiaMessages.unshift({
        type: "ai",
        content: `
IMPORTANTE: El mensaje anterior generó un error. Por favor, corrige los siguientes problemas:

ERROR DETECTADO: ${retryContext.errorDetails}

RESPUESTA PROBLEMÁTICA: 
${retryContext.failedResponse}

INSTRUCCIONES PARA CORRECCIÓN:
1. Si el error es de formato JSON, asegúrate de generar un JSON válido sin errores de sintaxis
2. Si el error es de estructura, verifica que estés usando las rutas correctas en operaciones diff o incluyendo todos los campos requeridos
3. No cambies el contenido semántico o la intención de la respuesta, solo corrige los errores técnicos
4. Genera una respuesta completa válida, no solo la parte con errores

Este es un reintento automático para evitar mostrar un error al usuario. Por favor, genera una versión corregida.`,
      });
    }

    // Llamada a KAIA para procesar los mensajes
    const response = await kaiaRequest<DashboardResponse>("/agent", "POST", {
      messages: kaiaMessages,
      model: "gpt-41",
    });

    return response;
  } catch (error) {
    console.error("Error en la solicitud a KAIA:", error);
    throw error; // Re-lanzar para manejo en el nivel superior
  }
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
    // Asegurar que el widget tenga un ID único usando uuid para garantizar unicidad
    const widgetId = widget._id || `widget_${uuidv4()}`;
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
      const { messages, context } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ message: "Messages array is required" });
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
              _id: w._id,
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
              _id: w._id,
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
              _id: w._id,
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
            // Ahora los widgets ya no están en dashboardWidgets sino en el nivel superior como "widgets"
            existingWidgets = parsedContext.widgets || {};
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

      // Procesar los mensajes recibidos para la llamada a KAIA
      const kaiaMessages = [
        {
          type: "ai",
          content: `${promptIntro}

${
  isModification
    ? `
IMPORTANTE: Estás MODIFICANDO un dashboard existente, NO creando uno nuevo. Debes trabajar con el dashboard actual y hacer SOLO los cambios específicos que pide el usuario.

ESTADO ACTUAL DEL DASHBOARD:
dashboard: ${JSON.stringify(existingDashboard, null, 2)}

FORMATO DE RESPUESTA PARA MODIFICACIONES:
En lugar de generar un dashboard completo, debes generar operaciones JSON Patch (RFC 6902) que especifiquen exactamente qué cambios hacer.
Utiliza este formato para tu respuesta:

\`\`\`json
{
  "type": "diff_operations",
  "operations": [
    {
      "op": "replace",
      "path": "/dashboard/name",
      "value": "Nuevo nombre del dashboard"
    },
    {
      "op": "add", 
      "path": "/widgets/nuevo_widget_id", 
      "value": { 
        "type": "metric",
        "title": "Nuevo widget",
        ... resto de la configuración
      }
    },
    {
      "op": "replace",
      "path": "/dashboard/layouts/lg/0/h",
      "value": 4
    },
    {
      "op": "remove",
      "path": "/widgets/widget_id_a_eliminar"
    }
  ],
  "userMessage": "He actualizado el dashboard según tu petición",
  "suggestions": ["Aumentar el tamaño de las métricas", "Añadir más widgets de comparación"]
}
\`\`\`

IMPORTANTE: La estructura del estado en el frontend es:
\`\`\`
{
  dashboard: { // Datos del dashboard (nombre, layouts, etc.)
    name: "...",
    description: "...",
    layouts: { lg: [...], md: [...], sm: [...] },
    widgets: ["widget-id-1", "widget-id-2", ...] // Array de IDs
  },
  widgets: { // Objeto con widgets indexados por ID
    "widget-id-1": { ... },
    "widget-id-2": { ... }
  }
}
\`\`\`

OPERACIONES JSON PATCH:
- "add": Añadir una propiedad o elemento 
- "remove": Eliminar una propiedad o elemento
- "replace": Cambiar valor de una propiedad existente
- "move": Mover un valor de una ubicación a otra (incluye 'from')
- "copy": Copiar un valor de una ubicación a otra (incluye 'from')

EJEMPLOS DE PATHS COMUNES:
- "/dashboard/name" - Cambiar nombre del dashboard
- "/dashboard/description" - Cambiar descripción
- "/dashboard/layouts/lg/0/h" - Cambiar altura del primer widget en layout desktop
- "/dashboard/layouts/lg/0/w" - Cambiar ancho del primer widget en layout desktop
- "/dashboard/layouts/lg/0/x" - Cambiar posición X del primer widget en layout desktop
- "/dashboard/layouts/lg/0/y" - Cambiar posición Y del primer widget en layout desktop
- "/widgets/widget_123/title" - Cambiar título de un widget específico
- "/widgets/widget_123/config/primaryMetric/indicator" - Cambiar indicador de métrica primaria
- "/dashboard/widgets/-" - Añadir widget ID al array de widgets del dashboard (cuando se crea uno nuevo)
- "/widgets/nuevo_widget_id" - Añadir la configuración de un nuevo widget

IMPORTANTE: NO uses paths incorrectos como "/dashboard/dashboardWidgets/..." o "/dashboard/widgets/widget_id/..." ya que causarán errores.
Los widgets están en la raíz del objeto como "/widgets/widget_id", NO dentro del dashboard.

REGLAS CLAVE:
1. SOLO modifica las propiedades ESPECÍFICAMENTE mencionadas en la petición del usuario
2. Para modificaciones de layout, utiliza rutas exactas a los elementos que deben cambiar
3. Preserva todos los IDs existentes de widgets que no se eliminen
4. Para eliminar un widget:
   - Elimina su ID del array widgets del dashboard
   - Elimina el widget completo del objeto widgets
   - Elimina sus entradas en cada layout (lg, md, sm)
5. Para añadir un widget:
   - Genera un ID único para el nuevo widget
   - Añade el widget completo al objeto widgets 
   - Añade el ID del widget al array widgets del dashboard
   - Añade entradas en cada layout (lg, md, sm)

EJEMPLOS DE OPERACIONES COMUNES:

1. Cambiar el título de un widget:
\`\`\`json
{
  "op": "replace",
  "path": "/widgets/widget_123/title",
  "value": "Nuevo título"
}
\`\`\`

CORRECTO: "/widgets/widget_123/title" (widgets está en la raíz)
INCORRECTO: "/dashboard/dashboardWidgets/widget_123/title" (no existe esta ruta)
INCORRECTO: "/dashboard/widgets/widget_123/title" (widgets no está dentro de dashboard)

2. Eliminar un widget:
\`\`\`json
[
  {"op": "remove", "path": "/widgets/widget_to_delete"},
  {"op": "remove", "path": "/dashboard/layouts/lg/2"}, 
  {"op": "remove", "path": "/dashboard/layouts/md/2"},
  {"op": "remove", "path": "/dashboard/layouts/sm/2"},
  {"op": "remove", "path": "/dashboard/widgets/2"}
]
\`\`\`

3. Añadir un nuevo widget:
\`\`\`json
[
  {
    "op": "add",
    "path": "/widgets/new_widget_123",
    "value": {
      "type": "metric",
      "title": "Nueva métrica",
      "config": { ... }
    }
  },
  {
    "op": "add",
    "path": "/dashboard/widgets/-",
    "value": "new_widget_123"
  },
  {
    "op": "add",
    "path": "/dashboard/layouts/lg/-",
    "value": {"i": "new_widget_123", "x": 0, "y": 8, "w": 8, "h": 2, "static": false}
  },
  {
    "op": "add",
    "path": "/dashboard/layouts/md/-",
    "value": {"i": "new_widget_123", "x": 0, "y": 8, "w": 6, "h": 2, "static": false}
  },
  {
    "op": "add",
    "path": "/dashboard/layouts/sm/-",
    "value": {"i": "new_widget_123", "x": 0, "y": 10, "w": 8, "h": 2, "static": false}
  }
]
\`\`\`
`
    : ""
}

IMPORTANTE: DEBES generar un objeto JSON completo que incluya la configuración técnica del dashboard SOLO SI dispones de información completa para configurar todos los campos obligatorios. Si la petición del usuario es ambigua o incompleta, DEBES utilizar el campo "needsMoreInfo" para solicitar la información faltante. NO INVENTES ni ASUMAS valores que el usuario no haya especificado explícitamente.

## CONTEXTO DE NEGOCIO:
Los datos se refieren a métricas de ventas y pedidos de una empresa retail, donde los usuarios necesitan analizar diferentes indicadores (importe, unidades, pedidos) con varios modificadores para obtener insights de negocio.

## TIPOS DE WIDGETS DISPONIBLES:

1. MÉTRICA (metric): Para mostrar KPIs y valores numéricos
   - Muestra valores numéricos con una métrica principal y secundaria
   - Puede incluir variaciones, crecimientos o comparativas
   - Tamaño recomendado: w=8, h=2 (en desktop)

2. GRÁFICA (chart): Para visualizar datos y tendencias
   - IMPORTANTE: Actualmente SOLO está disponible el tipo "bar" (gráfico de barras)
   - Permite visualizar comparativas y tendencias con barras verticales u horizontales
   - Puede incluir múltiples series de datos (máximo recomendado: 5 series)
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
   
   IMPORTANTE: Si la petición no especifica explícitamente algún elemento obligatorio, DEBES PREGUNTAR al usuario. Por ejemplo:
   - Si pide "añade un KPI" sin especificar qué indicador (importe, unidades, pedidos), DEBES preguntar
   - Si pide una métrica de "importe" o "unidades" pero no especifica el tipo de venta (bruto, neto, devos), DEBES preguntar
   - Si pide una tabla pero no especifica qué columnas incluir, DEBES preguntar

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
   - Incluya sugerencias en formato imperativo/afirmativo
   
4. Formato de sugerencias:
   - NUNCA formules sugerencias como preguntas (ej. "¿Te gustaría añadir...?")
   - SIEMPRE usa frases completas y específicas que puedan ser comprendidas como prompts completos
   - Cada sugerencia debe ser una instrucción clara y detallada que el modelo de IA pueda entender
   - Incluye todos los detalles necesarios para ejecutar la acción correctamente
   
   Ejemplos CORRECTOS:
   - "Cambia el indicador del primer KPI a unidades vendidas brutas"
   - "Modifica el periodo de análisis a últimos 3 meses"
   - "Añade una tabla con desglose por categoría y producto"
   - "Crea un gráfico de barras comparando ventas por país"
   
   Ejemplos INCORRECTOS:
   - "Cambiar el indicador" (demasiado genérico)
   - "Añadir métrica" (falta especificidad)
   - "Mostrar más datos" (ambiguo)
   - "¿Quieres añadir un gráfico de tendencias?" (pregunta)

4. GESTIÓN DE PETICIONES AMBIGUAS O INCOMPLETAS:
   
   Es CRUCIAL que no asumas valores por defecto para campos obligatorios. SIEMPRE que la petición no contenga información suficiente para configurar correctamente un widget:
   
   - Utiliza el campo "needsMoreInfo" para solicitar información específica
   - Formula preguntas claras y directas
   - Explica qué información se necesita exactamente y por qué es importante
   - Si es apropiado, ofrece opciones entre las que el usuario pueda elegir
   - Si el dashboard ya tiene widgets, usa ese contexto para hacer preguntas más relevantes

   VALIDACIONES OBLIGATORIAS:
   - Para métricas de "importe" y "unidades": SIEMPRE exigir "saleType" (bruto/neto/devos) y "calculation"
   - Para métricas de "pedidos": SIEMPRE exigir "calculation"
   - Para tablas: SIEMPRE exigir qué columnas incluir y al menos un nivel de desglose
   - Para gráficos: SIEMPRE exigir qué métricas mostrar
   - Para comparaciones: SIEMPRE exigir qué métricas comparar
   
   EJEMPLOS DE RESPUESTAS ANTE PETICIONES AMBIGUAS:
   
   1. Si el usuario dice: "Añade un KPI"
      RESPUESTA CORRECTA:
      \`\`\`
      {
        "userMessage": "Para añadir un KPI, necesito saber qué tipo de indicador quieres mostrar. Hay varias métricas disponibles que podríamos visualizar.",
        "needsMoreInfo": {
          "question": "¿Qué tipo de indicador quieres mostrar en el KPI?",
          "context": "Opciones disponibles: importe (valor monetario), unidades (cantidad de productos vendidos) o pedidos (número de órdenes). Cada uno requiere configuración específica para mostrarse correctamente."
        }
      }
      \`\`\`
      
   2. Si el usuario dice: "Añade una métrica de importe"
      RESPUESTA CORRECTA:
      \`\`\`
      {
        "userMessage": "Para añadir una métrica de importe, necesito especificaciones adicionales. El sistema requiere conocer el tipo de venta y el cálculo a realizar.",
        "needsMoreInfo": {
          "question": "¿Qué tipo de venta y cálculo quieres para la métrica de importe?",
          "context": "Para el tipo de venta: bruto (total sin devoluciones), neto (descontando devoluciones) o devos (solo devoluciones). Para el cálculo: valor (cifra absoluta), crecimiento (variación porcentual) o peso (proporción sobre el total)."
        }
      }
      \`\`\`
      
   3. Si el usuario dice: "Añade una tabla con desglose por país"
      RESPUESTA CORRECTA:
      \`\`\`
      {
        "userMessage": "Para crear la tabla con desglose por país, necesito saber qué métricas quieres visualizar como columnas.",
        "needsMoreInfo": {
          "question": "¿Qué métricas quieres mostrar en las columnas de la tabla?",
          "context": "Puedes elegir entre: importe (valor monetario), unidades (cantidad de productos) o pedidos (número de órdenes). También puedes especificar si quieres ver valores brutos, netos, crecimiento, etc."
        }
      }
      \`\`\`
      
   4. Si el contexto tiene KPIs de unidades y el usuario dice: "Añade un gráfico"
      RESPUESTA CORRECTA:
      \`\`\`
      {
        "userMessage": "Para añadir un gráfico complementario a tus KPIs de unidades, necesito algunos detalles adicionales.",
        "needsMoreInfo": {
          "question": "¿Qué métricas quieres visualizar en el gráfico y con qué desglose?",
          "context": "Veo que ya tienes KPIs de unidades. ¿Quieres un gráfico que muestre la evolución de unidades por tiempo (días, semanas, meses), o prefieres un desglose por otra dimensión como producto, categoría o país?"
        }
      }
      \`\`\`
      
   EJEMPLOS DE LO QUE NO DEBES HACER:
   
   1. INCORRECTO: Asumir valores por defecto
      \`\`\`
      {
        "dashboard": {
          "widgets": [{
            "type": "metric",
            "title": "KPI de Importe",  /* Asumiendo importe sin preguntar */
            "config": {
              "primaryMetric": {
                "indicator": "importe",
                "modifiers": {
                  "saleType": "bruto",  /* Asumiendo bruto sin preguntar */
                  "calculation": "valor" /* Asumiendo valor sin preguntar */
                }
              }
            }
          }]
        }
      }
      \`\`\`
      
   2. INCORRECTO: Hacer preguntas genéricas que no ayudan a configurar los campos obligatorios
      \`\`\`
      {
        "userMessage": "¿Qué tipo de widget quieres añadir?",
        "needsMoreInfo": {
          "question": "¿Qué datos quieres ver?", /* Demasiado genérica */
          "context": "Hay muchas opciones disponibles."  /* No ofrece opciones concretas */
        }
      }
      \`\`\`

5. NUNCA generes una respuesta con configuración completa si la información es insuficiente:
   - Si falta información crítica, utiliza EXCLUSIVAMENTE "needsMoreInfo"
   - NO rellenes campos obligatorios con valores por defecto o asumidos
   - NO generes widgets parcialmente configurados o con configuración inválida
   - Solo cuando tengas TODA la información necesaria, incluye el objeto "dashboard" completo

## FORMATO DE RESPUESTA:

IMPORTANTE: Hay DOS formatos de respuesta válidos dependiendo de si necesitas más información o no:

1. SI LA INFORMACIÓN ES COMPLETA: Responde con un JSON completo que incluya la configuración del dashboard
2. SI LA INFORMACIÓN ES INSUFICIENTE: Responde ÚNICAMENTE con un JSON que incluya el campo "needsMoreInfo"

Estructura JSON cuando FALTE información:
\`\`\`
{
  "userMessage": "Mensaje conversacional explicando por qué necesitas más información",
  "needsMoreInfo": {
    "question": "Pregunta clara y específica sobre lo que necesitas saber",
    "context": "Explicación de por qué esta información es importante y opciones disponibles"
  }
}
\`\`\`

Estructura JSON cuando TODA la información esté COMPLETA:

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
            "id": "importe_saleType_bruto_calculation_valor", // IMPORTANTE: Siempre generar IDs únicos usando indicador y modificadores
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
          "visualization": { "showTitle": false }
          
          // Para gráficos:
          "chartType": "bar", // IMPORTANTE: Actualmente SOLO "bar" está implementado
          "xAxisDimension": "tiempo|producto|categoría",
          "series": [],
          "data": [],
          "visualization": { 
            "showTitle": false, 
            "showLegend": true, 
            "showGrid": true,
            "showValues": false,
            "showXAxis": true,
            "showYAxis": true,
            "rotateXLabels": false,
            "chartOrientation": "vertical|horizontal",
            "barWidth": 0.06,
            "barGap": 2,
            "colorMode": "default|palette|custom",
            "colorPalette": "default|black|blue|violet|green",
            /* IMPORTANTE: Reglas para colorMode y colorPalette:
               1. Si colorPalette es "default", colorMode debe ser "default"
               2. Si colorPalette es cualquier otro valor (black, blue, violet, green), colorMode DEBE ser "palette"
               3. Si se quiere usar colores personalizados, colorMode debe ser "custom" y usar customColors
               Ejemplos correctos:
               - { colorMode: "default", colorPalette: "default" }
               - { colorMode: "palette", colorPalette: "green" }
               - { colorMode: "palette", colorPalette: "blue" }
               - { colorMode: "custom", customColors: ["#ff0000", "#00ff00"] }
               Ejemplos INCORRECTOS:
               - { colorMode: "default", colorPalette: "green" } <- ERROR
               - { colorMode: "custom", colorPalette: "blue" } <- ERROR
            */
            "legendPosition": {
              "vertical": "bottom|top",
              "horizontal": "center|left|right"
            }
          }
          
          // Para tablas:
          "columns": [
            {
              "id": "importe_saleType_neto_calculation_valor", // IMPORTANTE: Siempre incluir IDs únicos para cada columna
              "indicator": "importe",
              "modifiers": {
                "saleType": "neto",
                "timeframe": "mes",
                "comparison": "actual", 
                "calculation": "valor"
              },
              "title": "Importe",
              "width": 120
            }
          ], // Métricas a mostrar como columnas (importe, unidades, pedidos)
          "data": [],
          // IMPORTANTE: Solo usar valores EXACTOS de esta lista en breakdownLevels:
          // Geográfico: 'zone' (Zona), 'country' (País), 'city' (Ciudad), 'store' (Tienda)
          // Comercial: 'product' (Producto), 'section' (Sección), 'family' (Familia), 'buyer' (Comprador)
          // Temporal: 'day' (Día), 'week' (Semana), 'month' (Mes), 'quarter' (Quarter), 'year' (Año)
          "breakdownLevels": [],
          "visualization": { "showTitle": false, "compact": false, "showBorders": true, "alternateRowColors": true }
          
          // Para comparación:
          "dimension": "tiempo|métrica|custom",
          "visualizationType": "bars|progress|stacked",
          // Si dimension es custom:
          "comparisonMetrics": [],
          // Si dimension es tiempo o métrica:
          "primaryMetric": {},
          "secondaryMetric": {},
          "visualization": { 
            "showTitle": false, 
            "showLegend": true, 
            "showGrid": true,
            "showValues": false,
            "showXAxis": true,
            "showYAxis": true,
            "colorMode": "default|palette|custom",
            "colorPalette": "default|black|blue|violet|green",
            /* IMPORTANTE: Reglas para colorMode y colorPalette:
               1. Si colorPalette es "default", colorMode debe ser "default"
               2. Si colorPalette es cualquier otro valor (black, blue, violet, green), colorMode DEBE ser "palette"
               3. Si se quiere usar colores personalizados, colorMode debe ser "custom" y usar customColors
               Ejemplos correctos:
               - { colorMode: "default", colorPalette: "default" }
               - { colorMode: "palette", colorPalette: "green" }
               - { colorMode: "palette", colorPalette: "blue" }
               - { colorMode: "custom", customColors: ["#ff0000", "#00ff00"] }
               Ejemplos INCORRECTOS:
               - { colorMode: "default", colorPalette: "green" } <- ERROR
               - { colorMode: "custom", colorPalette: "blue" } <- ERROR
            */
            "valueFormat": "auto|currency|percent|integer|decimal"
          }
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
    "Añade un gráfico de barras mostrando la evolución de ventas por semana",
    "Cambia el indicador de la primera métrica a unidades vendidas netas",
    "Crea una tabla detallada con desglose por categoría y producto",
    "Modifica el layout para mostrar 4 métricas en la primera fila en lugar de 3",
    "Añade una comparativa entre ventas actuales y del año anterior por categoría"
  ],
  "needsMoreInfo": {
    "question": "", // Dejar vacío si no se necesita más información
    "context": ""   // Dejar vacío si no se necesita más información
  }
}
\`\`\`

IMPORTANTE:
- NUNCA incluyas simultáneamente "dashboard" y "needsMoreInfo" con valores no vacíos
- Si necesitas más información, responde SOLO con el objeto que tiene "userMessage" y "needsMoreInfo"
- Si toda la información es completa, responde con el objeto completo que incluye "dashboard"
- NO generes configuraciones parciales o asumas valores por defecto

EJEMPLOS DE PETICIONES AMBIGUAS QUE REQUIEREN PREGUNTAR:

1. "Añade un KPI" → DEBES preguntar qué tipo de indicador (importe, unidades, pedidos)
   Respuesta adecuada:
   \`\`\`
   {
     "userMessage": "Para añadir un KPI necesito saber qué indicador quieres mostrar",
     "needsMoreInfo": {
       "question": "¿Qué tipo de indicador quieres mostrar en el KPI?",
       "context": "Puedes elegir entre: importe (valor monetario), unidades (cantidad de productos) o pedidos (número de órdenes)"
     }
   }
   \`\`\`

2. "Añade una métrica de importe" → DEBES preguntar tipo de venta (bruto, neto, devos) y cálculo
   Respuesta adecuada:
   \`\`\`
   {
     "userMessage": "Para configurar la métrica de importe necesito información adicional",
     "needsMoreInfo": {
       "question": "¿Qué tipo de venta y qué cálculo quieres para la métrica de importe?",
       "context": "Para tipo de venta: bruto (total sin devoluciones), neto (descontando devoluciones) o devos (solo devoluciones). Para cálculo: valor (cifra absoluta), crecimiento (variación porcentual) o peso (proporción sobre el total)"
     }
   }
   \`\`\`

3. "Crea una tabla con datos por país" → DEBES preguntar qué columnas/métricas mostrar
   Respuesta adecuada:
   \`\`\`
   {
     "userMessage": "Para crear la tabla con desglose por país necesito definir qué métricas mostrar",
     "needsMoreInfo": {
       "question": "¿Qué métricas quieres incluir como columnas en la tabla por país?",
       "context": "Puedes elegir entre importe, unidades o pedidos, y especificar si quieres valores absolutos, crecimiento, etc."
     }
   }
   \`\`\`

4. "Añade un gráfico comparativo" → DEBES preguntar qué métricas comparar
   Respuesta adecuada:
   \`\`\`
   {
     "userMessage": "Para crear el gráfico comparativo necesito definir qué métricas quieres comparar",
     "needsMoreInfo": {
       "question": "¿Qué métricas deseas comparar en el gráfico?",
       "context": "Puedes comparar diferentes indicadores (ej: importe vs unidades) o el mismo indicador en diferentes periodos (ej: ventas actuales vs año anterior)"
     }
   }
   \`\`\`

## USO DE CONTEXTO DEL DASHBOARD EXISTENTE:

Cuando el dashboard ya tenga widgets existentes y la petición sea ambigua, debes utilizar este contexto para hacer preguntas más relevantes:

1. ANALIZA LOS WIDGETS EXISTENTES:
   - Identifica qué indicadores predominan (importe, unidades, pedidos)
   - Detecta los tipos de venta más usados (bruto, neto)
   - Observa las dimensiones de análisis ya empleadas (tiempo, país, categoría)
   
2. UTILIZA ESTE CONTEXTO EN TUS PREGUNTAS:
   Ejemplo: Si el usuario dice "añade un gráfico" y el dashboard ya tiene KPIs de unidades netas:
   \`\`\`
   {
     "userMessage": "Para complementar tus KPIs de unidades netas, podría añadir un gráfico. Necesito algunos detalles adicionales.",
     "needsMoreInfo": {
       "question": "¿Quieres un gráfico que muestre la evolución de unidades netas o prefieres otra métrica?",
       "context": "He notado que tu dashboard está enfocado en unidades netas. Puedo añadir un gráfico que muestre su evolución temporal o desglose por otra dimensión (país, categoría, etc.)."
     }
   }
   \`\`\`

3. SUGIERE OPCIONES CONTEXTUALES:
   - Si el dashboard tiene métricas de valor, sugiere añadir crecimiento
   - Si tiene datos de importe, sugiere añadir unidades como complemento
   - Si hay datos actuales, sugiere comparaciones con períodos anteriores

## IMPORTANTE:
- Tu respuesta debe ser SIEMPRE un JSON válido y parseable
- NUNCA generes un dashboard con información incompleta o asumida
- Si la petición es clara y completa, incluye al menos 3 widgets en cada dashboard
- Si la petición es ambigua o incompleta, usa ÚNICAMENTE el formato con "needsMoreInfo"
- RECUERDA: Es mejor preguntar que asumir incorrectamente lo que el usuario quiere

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
        ...messages, // Incluir todos los mensajes del historial
      ];

      // Procesar la solicitud con el sistema de reintento automático
      let response: DashboardResponse;
      try {
        // Primer intento
        response = await processIARequest(messages, kaiaMessages, context);
        console.log("Respuesta procesada correctamente en el primer intento");
      } catch (error) {
        // Si el error es recuperable, hacer un segundo intento con contexto de error
        if (isRecoverableError(error)) {
          console.log(
            "Error recuperable detectado, intentando reintentar:",
            error
          );

          // Crear contexto para el reintento
          const errorResponse =
            error instanceof Error && (error as any).response
              ? (error as any).response
              : "Respuesta no disponible";

          const retryContext = createRetryContext(error, errorResponse);

          try {
            // Segundo intento con contexto de error
            response = await processIARequest(
              messages,
              kaiaMessages,
              context,
              retryContext
            );
            console.log(
              "Respuesta procesada correctamente en el segundo intento"
            );
          } catch (secondError) {
            // Si falla el segundo intento, registrar y lanzar el error
            console.error("Error en el segundo intento:", secondError);
            throw secondError;
          }
        } else {
          // Si no es recuperable, relanzar el error
          console.error("Error no recuperable:", error);
          throw error;
        }
      }

      console.log("Respuesta final:", response);

      // Extraer los datos de la respuesta según el formato recibido
      let dashboardData: DashboardIAResponse | null = null;

      // Verificar si la respuesta es una operación diff
      if (
        response?.type === "diff_operations" &&
        Array.isArray(response.operations)
      ) {
        // Procesar operaciones diff para asegurar que los widgets añadidos tengan ID
        const processedOperations = processDiffOperations(response.operations);

        // Devolver las operaciones diff procesadas
        return res.status(200).json({
          data: {
            type: "diff_operations",
            operations: processedOperations,
            userMessage: response.userMessage || "",
            suggestions: response.suggestions || [],
          },
        });
      }
      // Verificar si la respuesta tiene el formato dashboard completo
      else if (response?.dashboard) {
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

          // Intentar parsear el JSON limpio con manejo robusto de errores
          let parsedContent;
          try {
            parsedContent = JSON.parse(cleanContent);
            console.log("JSON parseado correctamente:", parsedContent);
          } catch (error: any) {
            const jsonError = error;
            console.error("Error al parsear JSON:", jsonError);
            console.log("Intentando reparar JSON malformado...");

            // Intentar algunas reparaciones comunes de JSON malformado
            let repairAttempt = cleanContent;

            // Reparar comillas simples incorrectas
            repairAttempt = repairAttempt.replace(/(['"])(.*?)\1/g, (match) => {
              return match.replace(/'/g, '"');
            });

            // Reparar propiedades sin comillas
            repairAttempt = repairAttempt.replace(
              /([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g,
              '$1"$2"$3'
            );

            // Reparar comillas faltantes en valores string
            repairAttempt = repairAttempt.replace(
              /:\s*([^",\{\}\[\]\s][^,\{\}\[\]\s]*)/g,
              ':"$1"'
            );

            try {
              parsedContent = JSON.parse(repairAttempt);
              console.log("JSON reparado y parseado correctamente");
            } catch (repairError) {
              console.error("No se pudo reparar el JSON:", repairError);
              throw new Error(
                `Error al parsear JSON: ${jsonError.message}. No se pudo reparar automáticamente.`
              );
            }
          }

          // Verificar si es una respuesta tipo diff_operations
          if (
            parsedContent.type === "diff_operations" &&
            Array.isArray(parsedContent.operations)
          ) {
            return res.status(200).json({
              data: {
                type: "diff_operations",
                operations: parsedContent.operations,
                userMessage: parsedContent.userMessage || "",
                suggestions: parsedContent.suggestions || [],
              },
            });
          }

          // PRIMERO: Verificar si es una respuesta needsMoreInfo
          if (
            parsedContent.needsMoreInfo?.question &&
            parsedContent.needsMoreInfo.question.trim() !== ""
          ) {
            console.log(
              "Se requiere información adicional:",
              parsedContent.needsMoreInfo
            );
            return res.status(200).json({
              data: {
                needsMoreInfo: parsedContent.needsMoreInfo,
                userMessage: parsedContent.userMessage || "",
              },
            });
          }

          // DESPUÉS: Verificar que el dashboard esté presente para formato completo
          if (!parsedContent.dashboard) {
            console.error(
              "La respuesta no contiene el objeto dashboard ni operaciones diff:",
              parsedContent
            );
            return res.status(500).json({
              message:
                "La respuesta de IA no incluye la configuración del dashboard ni operaciones diff",
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
