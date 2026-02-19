# Generación de Dashboards con IA

Esta funcionalidad permite a los usuarios crear dashboards completos utilizando lenguaje natural. La IA interpretará la solicitud del usuario y generará un dashboard con múltiples widgets configurados según las necesidades expresadas.

## Características Principales

- **Generación completa de dashboards** con múltiples widgets a partir de lenguaje natural
- **Widgets soportados**: métricas, gráficas, tablas y comparaciones
- **Posicionamiento automático** de widgets en el layout del dashboard
- **Respuestas conversacionales** que explican lo creado y sugieren mejoras
- **Plantillas predefinidas** para diferentes casos de uso (ejecutivo, ventas, etc.)

## Componentes Técnicos

### Endpoint de API

El endpoint `/api/ia/dashboard` acepta solicitudes POST con:

```javascript
{
  "prompt": "Solicitud en lenguaje natural",
  "context": "Información de contexto (opcional)"
}
```

Y devuelve:

```javascript
{
  "data": {
    "dashboard": { /* Configuración del dashboard */ },
    "widgets": { /* Widgets procesados indexados por ID */ },
    "userMessage": "Mensaje conversacional para el usuario",
    "suggestions": ["Sugerencia 1", "Sugerencia 2"]
  }
}
```

### Hook para Gestión de IA

El hook `useIaDashboardGeneration` proporciona:

- Gestión de conversación con IA
- Procesamiento y aplicación de cambios al dashboard
- Sistema de checkpoints para restaurar estados anteriores

### Procesamiento de Widgets

Cada tipo de widget tiene su propia lógica de procesamiento:

1. **Métricas**: Configuradas con `primaryMetric` y opcionalmente `secondaryMetric`
   - Cada métrica debe incluir `indicator` (importe, unidades, pedidos)
   - Modificadores como `calculation`, `saleType`, `timeframe`, `comparison`
   - El sistema agrega valores por defecto si faltan algunos parámetros
2. **Gráficas**: Visualización temporal de series de datos
3. **Tablas**: Datos detallados con columnas y formateo condicional
4. **Comparaciones**: Para contrastar diferentes métricas o períodos

## Flujo de Uso

1. El usuario introduce una solicitud en lenguaje natural
2. La IA procesa la solicitud y genera una configuración completa
3. Si la información es insuficiente, la IA solicita más detalles
4. El sistema crea el dashboard con los widgets configurados
5. El usuario recibe un mensaje explicando lo creado y sugerencias de mejora
6. El usuario puede continuar la conversación para refinar el dashboard

## Ejemplo de Prompts

```
"Crear un dashboard ejecutivo con KPIs de ventas, un gráfico de tendencia mensual y una tabla de productos"

"Necesito un dashboard para analizar ventas por región con comparativa interanual"

"Dashboard con métricas de pedidos, desglosado por categorías"
```

## Plantillas de Dashboard

El sistema incluye plantillas predefinidas que la IA puede usar como inspiración:

- **Ejecutivo**: Visión general con KPIs clave
- **Ventas**: Análisis detallado de métricas de ventas
- **Operacional**: Enfocado en operaciones diarias
- **Financiero**: Métricas financieras y proyecciones

## Limitaciones Actuales

- Sólo soporta datos simulados (no conecta con fuentes reales)
- Tipos de visualización limitados (principalmente gráficos de barras)
- Las tablas tienen un número limitado de columnas y filas para mejor rendimiento

## Consideraciones Técnicas

- **Inicialización de métricas**: Los widgets de tipo metric siempre incluyen una configuración completa para `primaryMetric`, con valores por defecto si no se especifican
- **Validación defensiva para tablas**: Las columnas de tabla siempre tienen `modifiers` inicializados para evitar errores
- **Manejo de null/undefined**: Se implementó validación defensiva en `getDisplayTitle` para casos donde `modifiers` sea indefinido
- **Tipado seguro**: Se agregaron tipos explícitos para evitar errores en el procesamiento de los datos
- **Layouts responsivos**: Se generan automáticamente para diferentes tamaños de pantalla

## Futuras Mejoras

- Integración con fuentes de datos reales
- Más tipos de visualizaciones (líneas, áreas, dispersión)
- Análisis predictivo y recomendaciones basadas en datos
- Personalización más detallada de estilos y formatos
- Capacidad para modificar dashboards existentes con lenguaje natural
