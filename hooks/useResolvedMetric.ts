import { useMemo } from "react";
import type { MetricDefinition } from "@/types/metricConfig";
import { useVariableStore } from "@/store/variableStore";
import { resolveMetricDefinition as resolveMetric } from "@/utils/variableResolver";

// Datos simulados para la resolución de valores.
// En una implementación real, esto vendría de una API.
const MOCK_API_DATA: Record<string, number> = {
  "importe-total-anual": 1250000,
  "unidades-total-anual": 890,
  "pedidos-total-anual": 430,
  "importe-online-anual": 750000,
  "unidades-online-anual": 500,
  "pedidos-online-anual": 210,
  "importe-tienda-anual": 500000,
  "unidades-tienda-anual": 390,
  "pedidos-tienda-anual": 220,
  // ... más combinaciones
};

const generateMockValue = (resolvedMetric: MetricDefinition): number => {
  const key = [
    resolvedMetric.indicator,
    resolvedMetric.modifiers.timeframe || "anual",
    resolvedMetric.modifiers.calculation || "valor",
  ].join("-");

  if (MOCK_API_DATA[key]) {
    return MOCK_API_DATA[key];
  }

  // Fallback para crecimiento y peso
  if (
    resolvedMetric.modifiers.calculation === "crecimiento" ||
    resolvedMetric.modifiers.calculation === "peso"
  ) {
    return Math.floor(Math.random() * 200 - 100); // -100 a +100
  }
  // Fallback para otros valores
  return Math.floor(Math.random() * 1000000) + 10000;
};

export const useResolvedMetric = (metric: MetricDefinition | undefined) => {
  const { variables } = useVariableStore();

  const resolvedMetricData = useMemo(() => {
    if (!metric) {
      return null;
    }

    // 1. Resolver la definición de la métrica usando las variables
    const resolvedMetric = resolveMetric(metric, variables);

    // 2. Generar un valor simulado basado en la métrica resuelta
    const value = generateMockValue(resolvedMetric);

    return {
      value,
      label: resolvedMetric.title,
      calculation: (resolvedMetric.modifiers.calculation as string) || "valor",
    };
  }, [metric, variables]);

  return resolvedMetricData;
};
