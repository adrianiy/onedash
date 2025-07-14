import React from "react";
import type { EChartsOption } from "echarts";
import { BaseChart } from "./BaseChart";
import { formatValue } from "@/utils/format";

interface BarChartData {
  categories: string[];
  series: Array<{
    name: string;
    data: number[];
  }>;
}

interface BarChartProps {
  data: BarChartData;
  width?: string | number;
  height?: string | number;
  className?: string;
  theme?: "light" | "dark";
  horizontal?: boolean;
  valueType?: string; // Tipo de valor para aplicar formato correcto
  // Nuevas opciones de visualización
  showLegend?: boolean;
  showGrid?: boolean;
  showValues?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  rotateXLabels?: boolean;
  barWidth?: number; // Ancho relativo de las barras (0.1 - 0.9)
  barGap?: number; // Espacio entre columnas (0 - 0.5)
  legendPosition?:
    | {
        vertical: "top" | "center" | "bottom";
        horizontal: "left" | "center" | "right";
      }
    | "top"
    | "bottom"
    | "left"
    | "right";
  legendOrientation?: "horizontal" | "vertical";
  colorPalette?: string;
  colorMode?: "default" | "palette" | "custom";
  seriesColors?: Record<string, string>;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  width,
  height,
  className,
  theme,
  horizontal = false,
  valueType = "default",
  showLegend = true,
  showGrid = false,
  showValues = false,
  showXAxis = true,
  showYAxis = true,
  rotateXLabels = false,
  barWidth = 0.06, // Valor por defecto para el ancho relativo
  barGap = 2, // Valor por defecto para el espacio entre columnas
  legendPosition = "bottom",
  legendOrientation = "horizontal",
  colorPalette = "default",
  colorMode = "default",
  seriesColors = {},
}) => {
  // Función para obtener colores basados en la configuración
  const getColors = () => {
    // Si es modo personalizado, crear array de colores basado en seriesColors
    if (colorMode === "custom" && Object.keys(seriesColors).length > 0) {
      return data.series.map((series, index) => {
        // Buscar color personalizado por nombre de serie
        const customColor = seriesColors[series.name];
        if (customColor) return customColor;

        // Si no hay color personalizado, usar colores por defecto
        const defaultColors = [
          "#5470c6",
          "#91cc75",
          "#fac858",
          "#ee6666",
          "#73c0de",
        ];
        return defaultColors[index % defaultColors.length];
      });
    }

    // Función para obtener colores basados en la paleta seleccionada
    const getColorPalette = (palette: string) => {
      switch (palette) {
        case "black":
          return ["#000000", "#404040", "#666666", "#808080", "#999999"];
        case "blue":
          return ["#1f77b4", "#5ca3d6", "#9ecae1", "#c6dbef", "#deebf7"];
        case "violet":
          return ["#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe"];
        case "green":
          return ["#10b981", "#34d399", "#6ee7b7", "#9df9d0", "#c6f6d5"];
        default:
          return ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de"];
      }
    };

    // Para modo palette o default
    return getColorPalette(colorMode === "palette" ? colorPalette : "default");
  };

  const colors = getColors();

  // Función para calcular márgenes dinámicamente basándose en la posición de la leyenda
  const getGridMargins = () => {
    const isLegendMiddleLeft =
      typeof legendPosition === "object" &&
      legendPosition.vertical === "center" &&
      legendPosition.horizontal === "left";
    const isLegendMiddleRight =
      typeof legendPosition === "object" &&
      legendPosition.vertical === "center" &&
      legendPosition.horizontal === "right";

    return {
      left: isLegendMiddleLeft ? "20%" : "3%",
      right: isLegendMiddleRight ? "20%" : "4%",
      bottom: showLegend && data.series.length > 1 ? "15%" : "3%",
      containLabel: true,
      show: false, // Nunca mostrar borde alrededor del gráfico
      borderWidth: 0, // Seguridad adicional para evitar bordes
    };
  };

  const option: EChartsOption = {
    color: colors,
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      backgroundColor:
        theme === "dark"
          ? "rgba(45, 45, 45, 0.95)"
          : "rgba(255, 255, 255, 0.95)",
      borderColor:
        theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      borderWidth: 1,
      borderRadius: 8,
      textStyle: {
        color: theme === "dark" ? "#ffffff" : "#333333",
        fontSize: 13,
        fontWeight: 400,
      },
      padding: [12, 16],
      formatter: (params: unknown) => {
        if (Array.isArray(params) && params.length > 0) {
          const firstParam = params[0] as { name: string };

          let tooltipContent = `
            <div style="margin-bottom: 8px;">
              <span style="
                font-weight: 500;
                font-size: 14px;
                color: ${theme === "dark" ? "#ffffff" : "#1a1a1a"};
              ">${firstParam.name}</span>
            </div>
          `;

          params.forEach((param) => {
            const typedParam = param as {
              seriesName: string;
              value: number;
              color: string;
            };
            const formattedValue = formatValue(typedParam.value, valueType);

            tooltipContent += `
              <div style="
                display: flex;
                align-items: center;
                margin-bottom: 4px;
                gap: 8px;
              ">
                <div style="
                  width: 10px;
                  height: 10px;
                  border-radius: 50%;
                  background-color: ${typedParam.color};
                  flex-shrink: 0;
                "></div>
                <span style="
                  font-size: 13px;
                  color: ${theme === "dark" ? "#e0e0e0" : "#555555"};
                  flex: 1;
                ">${typedParam.seriesName}:</span>
                <span style="
                  font-weight: 600;
                  font-size: 13px;
                  color: ${theme === "dark" ? "#ffffff" : "#1a1a1a"};
                ">${formattedValue}</span>
              </div>
            `;
          });

          return tooltipContent;
        }
        return "";
      },
    },
    legend: {
      show: showLegend && data.series.length > 1,
      // Manejo del posicionamiento de leyenda mejorado
      top: (() => {
        if (typeof legendPosition === "object") {
          return legendPosition.vertical === "top"
            ? "top"
            : legendPosition.vertical === "bottom"
            ? "bottom"
            : legendPosition.vertical === "center"
            ? "middle"
            : undefined;
        }
        return legendPosition === "top"
          ? "top"
          : legendPosition === "bottom"
          ? "bottom"
          : undefined;
      })(),
      left: (() => {
        if (typeof legendPosition === "object") {
          return legendPosition.horizontal === "left"
            ? "left"
            : legendPosition.horizontal === "center"
            ? "center"
            : legendPosition.horizontal === "right"
            ? "right"
            : undefined;
        }
        return legendPosition === "left"
          ? "left"
          : legendPosition === "right"
          ? "right"
          : undefined;
      })(),
      orient: legendOrientation,
    },
    grid: getGridMargins(),
    xAxis: horizontal
      ? {
          type: "value",
          show: showXAxis,
          axisLine: { show: showXAxis },
          axisTick: { show: showXAxis },
          axisLabel: {
            show: showXAxis,
            formatter: (value: number) => formatValue(value, valueType),
          },
          splitLine: {
            show: showGrid, // Líneas verticales solo en gráficos horizontales (barras)
            lineStyle: {
              color:
                theme === "dark"
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.1)",
            },
          },
        }
      : {
          type: "category",
          data: data.categories,
          show: showXAxis,
          axisLine: { show: showXAxis },
          axisTick: {
            show: showXAxis,
            alignWithLabel: true,
          },
          axisLabel: {
            show: showXAxis,
            rotate: rotateXLabels ? 45 : 0,
          },
          splitLine: {
            show: false, // Nunca mostrar líneas verticales en gráficos verticales (columnas)
            lineStyle: {
              color:
                theme === "dark"
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.1)",
            },
          },
        },
    yAxis: horizontal
      ? {
          type: "category",
          data: data.categories,
          show: showYAxis,
          axisLine: { show: showYAxis },
          axisTick: { show: showYAxis },
          axisLabel: {
            show: showYAxis,
          },
          splitLine: {
            show: false, // Nunca mostrar líneas horizontales en gráficos horizontales (barras)
            lineStyle: {
              color:
                theme === "dark"
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.1)",
            },
          },
        }
      : {
          type: "value",
          show: showYAxis,
          axisLine: { show: showYAxis },
          axisTick: { show: showYAxis },
          axisLabel: {
            show: showYAxis,
            formatter: (value: number) => formatValue(value, valueType),
          },
          splitLine: {
            show: showGrid, // Líneas horizontales solo en gráficos verticales (columnas)
            lineStyle: {
              color:
                theme === "dark"
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.1)",
            },
          },
        },
    series: data.series.map((series) => ({
      name: series.name,
      type: "bar" as const,
      data: series.data,
      barWidth: `${barWidth * 100}%`, // Convertir el valor relativo a porcentaje
      barGap: `${barGap}px`,
      label: {
        show: showValues,
        position: horizontal ? "right" : "top",
        formatter: (params: { value: unknown }) => {
          const value = typeof params.value === "number" ? params.value : 0;
          return formatValue(value, valueType);
        },
      },
    })),
  };

  return (
    <BaseChart
      option={option}
      width={width}
      height={height}
      className={className}
      theme={theme}
    />
  );
};
