import { DashboardLayout, Breakpoint } from "@/types/dashboard";
import { Widget, MetricWidget } from "@/types/widget";
import { DashboardTemplate } from "./index";

/**
 * Plantilla de Dashboard Simple
 *
 * Un dashboard minimalista con métricas básicas para vistas rápidas
 * y análisis sencillos. Optimizado para mostrar KPIs esenciales.
 */
export const simpleTemplate: DashboardTemplate = {
  id: "simple-dashboard",
  name: "Dashboard Simple",
  description: "Vista sencilla con métricas clave en formato minimalista",
  tags: ["simple", "kpi", "básico", "minimalista"],
  use_cases: ["vista rápida", "métricas básicas", "dashboards de entrada"],

  // Widgets del dashboard
  widgets: [
    // Widget 1: Métrica de Importe
    {
      _id: "simple-metric-revenue",
      type: "metric",
      title: "Importe Total",
      description: "Importe neto actual",
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
      _id: "simple-metric-units",
      type: "metric",
      title: "Unidades",
      description: "Unidades vendidas",
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
      _id: "simple-metric-orders",
      type: "metric",
      title: "Pedidos",
      description: "Total de pedidos",
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
  ],

  // Layouts responsivos optimizados para cada breakpoint
  layouts: {
    // Layout para pantallas grandes (24 columnas)
    // Distribuye las 6 métricas en 2 filas de 3 métricas cada una (8 columnas por métrica)
    lg: [
      { i: "simple-metric-revenue", x: 0, y: 0, w: 8, h: 3, static: false },
      { i: "simple-metric-units", x: 8, y: 0, w: 8, h: 3, static: false },
      { i: "simple-metric-orders", x: 16, y: 0, w: 8, h: 3, static: false },
    ],

    // Layout para tablets (18 columnas)
    // Distribuye las 6 métricas en 2 filas de 3 métricas cada una (6 columnas por métrica)
    md: [
      { i: "simple-metric-revenue", x: 0, y: 0, w: 6, h: 3, static: false },
      { i: "simple-metric-units", x: 6, y: 0, w: 6, h: 3, static: false },
      { i: "simple-metric-orders", x: 12, y: 0, w: 6, h: 3, static: false },
    ],

    // Layout para móviles (8 columnas)
    // Apilar todas las métricas verticalmente, ocupando todo el ancho disponible
    sm: [
      { i: "simple-metric-revenue", x: 0, y: 0, w: 8, h: 3, static: false },
      { i: "simple-metric-units", x: 0, y: 3, w: 8, h: 3, static: false },
      { i: "simple-metric-orders", x: 0, y: 6, w: 8, h: 3, static: false },
    ],
  },
};
