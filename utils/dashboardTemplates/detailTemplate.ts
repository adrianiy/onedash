import { DashboardLayout, Breakpoint } from "@/types/dashboard";
import { Widget, MetricWidget, TableWidget } from "@/types/widget";
import { DashboardTemplate } from "./index";

/**
 * Plantilla de Dashboard de Detalle
 *
 * Un dashboard enfocado en mostrar KPIs clave y una tabla detallada
 * a todo el ancho para permitir un análisis profundo de datos tabulares.
 */
export const detailTemplate: DashboardTemplate = {
  id: "detail-dashboard",
  name: "Dashboard de Detalle",
  description: "Vista detallada con KPIs y tabla de análisis a ancho completo",
  tags: ["detalle", "tabular", "datos", "analítico"],
  use_cases: [
    "análisis detallado",
    "reportes tabulares",
    "vista de datos maestros",
  ],

  // Widgets del dashboard
  widgets: [
    // Widget 1: Métrica de Importe Total
    {
      _id: "detail-metric-revenue",
      type: "metric",
      title: "Importe Total",
      description: "Importe neto total",
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
          showTitle: true,
          filterDisplayMode: "badges",
        },
      },
    } as MetricWidget,

    // Widget 2: Métrica de Unidades
    {
      _id: "detail-metric-units",
      type: "metric",
      title: "Unidades",
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
          showTitle: true,
          filterDisplayMode: "badges",
        },
      },
    } as MetricWidget,

    // Widget 3: Métrica de Pedidos
    {
      _id: "detail-metric-orders",
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
          showTitle: true,
          filterDisplayMode: "badges",
        },
      },
    } as MetricWidget,

    // Widget 4: Métrica de Variación
    {
      _id: "detail-metric-variation",
      type: "metric",
      title: "Variación",
      description: "Variación porcentual",
      createdAt: new Date(),
      updatedAt: new Date(),
      config: {
        primaryMetric: {
          id: "importe_saleType_neto_calculation_crecimiento",
          indicator: "importe",
          modifiers: {
            saleType: "neto",
            timeframe: "mes",
            comparison: "actual",
            calculation: "crecimiento",
          },
          title: "Variación",
        },
        secondaryMetric: {
          id: "importe_saleType_neto_timeframe_año_calculation_crecimiento",
          indicator: "importe",
          modifiers: {
            saleType: "neto",
            timeframe: "año",
            comparison: "anterior",
            calculation: "crecimiento",
          },
          title: "vs Año Completo",
        },
        size: "medium",
        alignment: "center",
        visualization: {
          showTitle: true,
          filterDisplayMode: "badges",
        },
      },
    } as MetricWidget,

    // Widget 5: Tabla detallada a todo el ancho
    {
      _id: "detail-table-full",
      type: "table",
      title: "Análisis Detallado",
      description: "Vista completa de datos con desglose por niveles",
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
            id: "unidades_saleType_bruto_calculation_crecimiento",
            indicator: "unidades",
            modifiers: {
              saleType: "bruto",
              timeframe: "mes",
              comparison: "anterior",
              calculation: "crecimiento",
            },
            title: "% Var. Unid.",
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
          showTitle: true,
          compact: false,
          showBorders: true,
          alternateRowColors: true,
          showPagination: true,
          textAlign: "right",
          showHeaderBackground: true,
          totalRow: "bottom",
        },
      },
    } as TableWidget,
  ],

  // Layouts responsivos
  layouts: {
    // Layout para pantallas grandes (24 columnas)
    lg: [
      // Primera fila: 4 KPIs
      { i: "detail-metric-revenue", x: 0, y: 0, w: 6, h: 3, static: false },
      { i: "detail-metric-units", x: 6, y: 0, w: 6, h: 3, static: false },
      { i: "detail-metric-orders", x: 12, y: 0, w: 6, h: 3, static: false },
      { i: "detail-metric-variation", x: 18, y: 0, w: 6, h: 3, static: false },

      // Segunda fila: Tabla a todo el ancho
      { i: "detail-table-full", x: 0, y: 3, w: 24, h: 8, static: false },
    ],

    // Layout para tablets (18 columnas)
    md: [
      // Primera fila: 4 KPIs en 2 filas
      { i: "detail-metric-revenue", x: 0, y: 0, w: 9, h: 3, static: false },
      { i: "detail-metric-units", x: 9, y: 0, w: 9, h: 3, static: false },
      { i: "detail-metric-orders", x: 0, y: 3, w: 9, h: 3, static: false },
      { i: "detail-metric-variation", x: 9, y: 3, w: 9, h: 3, static: false },

      // Tercera fila: Tabla a todo el ancho
      { i: "detail-table-full", x: 0, y: 6, w: 18, h: 8, static: false },
    ],

    // Layout para móviles (8 columnas)
    sm: [
      // KPIs apilados verticalmente
      { i: "detail-metric-revenue", x: 0, y: 0, w: 8, h: 3, static: false },
      { i: "detail-metric-units", x: 0, y: 3, w: 8, h: 3, static: false },
      { i: "detail-metric-orders", x: 0, y: 6, w: 8, h: 3, static: false },
      { i: "detail-metric-variation", x: 0, y: 9, w: 8, h: 3, static: false },

      // Tabla a todo el ancho
      { i: "detail-table-full", x: 0, y: 12, w: 8, h: 8, static: false },
    ],
  },
};
