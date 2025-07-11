import { useEffect, useRef, useCallback } from "react";
import * as echarts from "echarts";
import type { EChartsOption, ECharts } from "echarts";
import { useThemeStore } from "../store/themeStore";

interface UseEChartsOptions {
  option: EChartsOption;
  theme?: "light" | "dark";
  autoResize?: boolean;
  onChartReady?: (chart: ECharts) => void;
}

export const useECharts = ({
  option,
  theme,
  autoResize = true,
  onChartReady,
}: UseEChartsOptions) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<ECharts | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const globalTheme = useThemeStore((state) => state.theme);

  const currentTheme = theme || globalTheme;

  // Optimized resize handler with debouncing
  const handleResize = useCallback(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.resize();
    }
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;

    // Initialize chart
    const chart = echarts.init(chartRef.current, currentTheme);
    chartInstanceRef.current = chart;

    // Set option
    chart.setOption(option);

    // Call onChartReady callback
    if (onChartReady) {
      onChartReady(chart);
    }

    if (autoResize) {
      // Window resize listener (for overall window changes)
      window.addEventListener("resize", handleResize);

      // ResizeObserver for container size changes
      if (typeof ResizeObserver !== "undefined") {
        resizeObserverRef.current = new ResizeObserver(() => {
          // Use requestAnimationFrame to debounce resize calls
          requestAnimationFrame(handleResize);
        });
        resizeObserverRef.current.observe(chartRef.current);
      }
    }

    // Cleanup
    return () => {
      if (autoResize) {
        window.removeEventListener("resize", handleResize);
        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect();
        }
      }
      chart.dispose();
      chartInstanceRef.current = null;
    };
  }, [handleResize, onChartReady, currentTheme, autoResize]);

  // Update option when it changes
  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.setOption(option, true);
    }
  }, [option]);

  // Update theme when it changes
  useEffect(() => {
    if (chartInstanceRef.current && chartRef.current) {
      chartInstanceRef.current.dispose();
      const chart = echarts.init(chartRef.current, currentTheme);
      chartInstanceRef.current = chart;
      chart.setOption(option);

      if (onChartReady) {
        onChartReady(chart);
      }
    }
  }, [currentTheme]);

  return {
    chartRef,
    chartInstance: chartInstanceRef.current,
  };
};
