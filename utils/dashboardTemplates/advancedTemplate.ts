import { DashboardLayout, Breakpoint } from "@/types/dashboard";
import { Widget, MetricWidget, ChartWidget, TableWidget } from "@/types/widget";
import { DashboardTemplate } from "./index";

/**
 * Plantilla de Dashboard Avanzado
 *
 * Un dashboard completo para análisis profundo con múltiples visualizaciones,
 * comparativas y tablas detalladas. Optimizado para usuarios analíticos.
 */
export const advancedTemplate: DashboardTemplate = {
  id: "advanced-dashboard",
  name: "Dashboard Avanzado",
  description:
    "Vista analítica completa con múltiples visualizaciones y detalles",
  tags: ["avanzado", "análisis", "completo", "detallado"],
  use_cases: ["análisis profundo", "reportes ejecutivos", "benchmarking"],

  // Widgets del dashboard
  widgets: [
    // Widget 1: Métrica de Importe Total
    {
      _id: "advanced-metric-revenue",
      type: "metric",
      title: "Importe Total",
      description: "Importe neto total actual",
      createdAt: new Date(),
      updatedAt: new Date(),
      config: {
        primaryMetric: {
          id: "importe_saleType_neto_calculation_valor",
          indicator: "importe",
          modifiers: {
            saleType: "neto",
            timeframe: "mes",
            comparison: "actual",
            calculation: "valor",
          },
          title: "Importe Neto",
        },
        secondaryMetric: {
          id: "importe_saleType_neto_calculation_crecimiento",
          indicator: "importe",
          modifiers: {
            saleType: "neto",
            timeframe: "mes",
            comparison: "anterior",
            calculation: "crecimiento",
          },
          title: "vs Año Anterior",
        },
        size: "medium",
        alignment: "center",
        visualization: {
          showTitle: false,
          filterDisplayMode: "badges",
        },
      },
    } as MetricWidget,

    // Widget 2: Métrica de Unidades
    {
      _id: "advanced-metric-units",
      type: "metric",
      title: "Unidades Vendidas",
      description: "Total de unidades vendidas",
      createdAt: new Date(),
      updatedAt: new Date(),
      config: {
        primaryMetric: {
          id: "unidades_saleType_bruto_calculation_valor",
          indicator: "unidades",
          modifiers: {
            saleType: "bruto",
            timeframe: "mes",
            comparison: "actual",
            calculation: "valor",
          },
          title: "Unidades Brutas",
        },
        secondaryMetric: {
          id: "unidades_saleType_bruto_calculation_crecimiento",
          indicator: "unidades",
          modifiers: {
            saleType: "bruto",
            timeframe: "mes",
            comparison: "anterior",
            calculation: "crecimiento",
          },
          title: "vs Año Anterior",
        },
        size: "medium",
        alignment: "center",
        visualization: {
          showTitle: false,
          filterDisplayMode: "badges",
        },
      },
    } as MetricWidget,

    // Widget 3: Métrica de Pedidos
    {
      _id: "advanced-metric-orders",
      type: "metric",
      title: "Pedidos",
      description: "Número total de pedidos",
      createdAt: new Date(),
      updatedAt: new Date(),
      config: {
        primaryMetric: {
          id: "pedidos_calculation_valor",
          indicator: "pedidos",
          modifiers: {
            timeframe: "mes",
            comparison: "actual",
            calculation: "valor",
          },
          title: "Pedidos",
        },
        secondaryMetric: {
          id: "pedidos_calculation_crecimiento",
          indicator: "pedidos",
          modifiers: {
            timeframe: "mes",
            comparison: "anterior",
            calculation: "crecimiento",
          },
          title: "vs Año Anterior",
        },
        size: "medium",
        alignment: "center",
        visualization: {
          showTitle: false,
          filterDisplayMode: "badges",
        },
      },
    } as MetricWidget,

    // Widget 4: Gráfica de tendencia (evolución temporal)
    {
      _id: "advanced-chart-trend",
      type: "chart",
      title: "Evolución de Ventas",
      description: "Tendencia de ventas a lo largo del tiempo",
      createdAt: new Date(),
      updatedAt: new Date(),
      config: {
        chartType: "bar", // Usando "bar" como tipo permitido
        xAxisDimension: "time",
        series: [
          {
            id: "importe_saleType_neto_calculation_valor",
            indicator: "importe",
            modifiers: {
              saleType: "neto",
              timeframe: "mes",
              comparison: "actual",
              calculation: "valor",
            },
            title: "Importe Neto",
          },
          {
            id: "importe_saleType_neto_timeframe_mes_comparison_anterior_calculation_valor",
            indicator: "importe",
            modifiers: {
              saleType: "neto",
              timeframe: "mes",
              comparison: "anterior",
              calculation: "valor",
            },
            title: "Importe Año Anterior",
          },
        ],
        data: [], // Se generará dinámicamente
        visualization: {
          showTitle: false,
          showLegend: true,
          showGrid: true,
          showValues: false,
          showXAxis: true,
          showYAxis: true,
          valueFormat: "currency",
          chartOrientation: "vertical",
          colorMode: "palette",
          colorPalette: "blue",
        },
      },
    } as ChartWidget,

    // Widget 5: Gráfica comparativa (barras)
    {
      _id: "advanced-chart-comparison",
      type: "chart",
      title: "Comparativa por Categoría",
      description: "Rendimiento por categoría de producto",
      createdAt: new Date(),
      updatedAt: new Date(),
      config: {
        chartType: "bar",
        xAxisDimension: "category",
        series: [
          {
            id: "importe_saleType_neto_calculation_valor",
            indicator: "importe",
            modifiers: {
              saleType: "neto",
              timeframe: "mes",
              comparison: "actual",
              calculation: "valor",
            },
            title: "Importe Actual",
          },
          {
            id: "importe_saleType_neto_timeframe_mes_comparison_anterior_calculation_valor",
            indicator: "importe",
            modifiers: {
              saleType: "neto",
              timeframe: "mes",
              comparison: "anterior",
              calculation: "valor",
            },
            title: "Importe Año Anterior",
          },
        ],
        data: [], // Se generará dinámicamente
        visualization: {
          showTitle: false,
          showLegend: true,
          showGrid: true,
          showValues: true,
          showXAxis: true,
          showYAxis: true,
          valueFormat: "currency",
          chartOrientation: "vertical",
          colorMode: "palette",
          colorPalette: "blue",
        },
      },
    } as ChartWidget,

    // Widget 6: Gráfica de distribución (pie)
    {
      _id: "advanced-chart-distribution",
      type: "chart",
      title: "Distribución de Ventas",
      description: "Distribución de ventas por categoría",
      createdAt: new Date(),
      updatedAt: new Date(),
      config: {
        chartType: "bar", // Usando "bar" como tipo permitido (visualizado como pie)
        xAxisDimension: "category",
        series: [
          {
            id: "importe_saleType_neto_calculation_peso",
            indicator: "importe",
            modifiers: {
              saleType: "neto",
              timeframe: "mes",
              comparison: "actual",
              calculation: "peso",
            },
            title: "Peso por Categoría",
          },
        ],
        data: [], // Se generará dinámicamente
        visualization: {
          showTitle: false,
          showLegend: true,
          showGrid: false,
          showValues: true,
          showXAxis: false,
          showYAxis: false,
          valueFormat: "percent",
          chartOrientation: "vertical",
          colorMode: "palette",
          colorPalette: "blue", // Cambiado de "categorical" a un valor permitido
        },
      },
    } as ChartWidget,

    // Widget 7: Tabla detallada
    {
      _id: "advanced-table-detail",
      type: "table",
      title: "Análisis Detallado",
      description: "Desglose detallado por categorías y productos",
      createdAt: new Date(),
      updatedAt: new Date(),
      config: {
        columns: [
          {
            id: "importe_saleType_neto_calculation_valor",
            indicator: "importe",
            modifiers: {
              saleType: "neto",
              timeframe: "mes",
              comparison: "actual",
              calculation: "valor",
            },
            title: "Importe",
            width: 120,
          },
          {
            id: "importe_saleType_neto_calculation_crecimiento",
            indicator: "importe",
            modifiers: {
              saleType: "neto",
              timeframe: "mes",
              comparison: "anterior",
              calculation: "crecimiento",
            },
            title: "% Crecimiento",
            width: 120,
          },
          {
            id: "unidades_saleType_bruto_calculation_valor",
            indicator: "unidades",
            modifiers: {
              saleType: "bruto",
              timeframe: "mes",
              comparison: "actual",
              calculation: "valor",
            },
            title: "Unidades",
            width: 100,
          },
          {
            id: "pedidos_calculation_valor",
            indicator: "pedidos",
            modifiers: {
              timeframe: "mes",
              comparison: "actual",
              calculation: "valor",
            },
            title: "Pedidos",
            width: 100,
          },
          {
            id: "importe_saleType_neto_calculation_peso",
            indicator: "importe",
            modifiers: {
              saleType: "neto",
              timeframe: "mes",
              comparison: "actual",
              calculation: "peso",
            },
            title: "% Peso",
            width: 100,
          },
        ],
        data: [], // Se generará dinámicamente
        breakdownLevels: ["section", "category", "product"],
        visualization: {
          showTitle: false,
          compact: false,
          showBorders: true,
          alternateRowColors: true,
          showPagination: true,
          textAlign: "right",
        },
      },
    } as TableWidget,
  ],

  // Layouts responsivos
  layouts: {
    // Layout para pantallas grandes (24 columnas)
    lg: [
      // Primera fila: 3 métricas principales
      { i: "advanced-metric-revenue", x: 0, y: 0, w: 8, h: 3, static: false },
      { i: "advanced-metric-units", x: 8, y: 0, w: 8, h: 3, static: false },
      { i: "advanced-metric-orders", x: 16, y: 0, w: 8, h: 3, static: false },

      // Segunda fila: Gráfico de evolución a todo lo ancho
      { i: "advanced-chart-trend", x: 0, y: 3, w: 24, h: 5, static: false },

      // Tercera fila: Dos gráficos comparativos
      {
        i: "advanced-chart-comparison",
        x: 0,
        y: 8,
        w: 16,
        h: 5,
        static: false,
      },
      {
        i: "advanced-chart-distribution",
        x: 16,
        y: 8,
        w: 8,
        h: 5,
        static: false,
      },

      // Cuarta fila: Tabla detallada a todo lo ancho
      { i: "advanced-table-detail", x: 0, y: 13, w: 24, h: 6, static: false },
    ],

    // Layout para tablets (18 columnas)
    md: [
      // Primera fila: 3 métricas principales
      { i: "advanced-metric-revenue", x: 0, y: 0, w: 6, h: 3, static: false },
      { i: "advanced-metric-units", x: 6, y: 0, w: 6, h: 3, static: false },
      { i: "advanced-metric-orders", x: 12, y: 0, w: 6, h: 3, static: false },

      // Segunda fila: Gráfico de evolución a todo lo ancho
      { i: "advanced-chart-trend", x: 0, y: 3, w: 18, h: 5, static: false },

      // Tercera fila: Dos gráficos comparativos
      {
        i: "advanced-chart-comparison",
        x: 0,
        y: 8,
        w: 12,
        h: 5,
        static: false,
      },
      {
        i: "advanced-chart-distribution",
        x: 12,
        y: 8,
        w: 6,
        h: 5,
        static: false,
      },

      // Cuarta fila: Tabla detallada a todo lo ancho
      { i: "advanced-table-detail", x: 0, y: 13, w: 18, h: 6, static: false },
    ],

    // Layout para móviles (8 columnas)
    sm: [
      // Apilar todo verticalmente
      { i: "advanced-metric-revenue", x: 0, y: 0, w: 8, h: 3, static: false },
      { i: "advanced-metric-units", x: 0, y: 3, w: 8, h: 3, static: false },
      { i: "advanced-metric-orders", x: 0, y: 6, w: 8, h: 3, static: false },
      { i: "advanced-chart-trend", x: 0, y: 9, w: 8, h: 5, static: false },
      {
        i: "advanced-chart-comparison",
        x: 0,
        y: 14,
        w: 8,
        h: 5,
        static: false,
      },
      {
        i: "advanced-chart-distribution",
        x: 0,
        y: 19,
        w: 8,
        h: 5,
        static: false,
      },
      { i: "advanced-table-detail", x: 0, y: 24, w: 8, h: 6, static: false },
    ],
  },
};
