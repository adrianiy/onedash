import React from "react";

interface ChartPreviewContainerProps {
  chartOrientation: "horizontal" | "vertical";
  showGrid: boolean;
  showXAxis: boolean;
  showYAxis: boolean;
  rotateXLabels: boolean;
}

export const ChartPreviewContainer: React.FC<ChartPreviewContainerProps> = ({
  chartOrientation,
  showGrid,
  showXAxis,
  showYAxis,
  rotateXLabels,
}) => {
  return (
    <div className="viz-chart-preview">
      <div
        className={`viz-chart-sample ${
          chartOrientation === "horizontal"
            ? "viz-chart-sample--horizontal"
            : "viz-chart-sample--vertical"
        } ${showGrid ? "viz-chart-sample--grid" : ""}`}
      >
        {chartOrientation === "vertical" ? (
          // Gráfico de columnas
          <div className="viz-chart-bars viz-chart-bars--vertical">
            <div className="viz-chart-placeholder viz-chart-placeholder--short"></div>
            <div className="viz-chart-placeholder viz-chart-placeholder--tall"></div>
            <div className="viz-chart-placeholder viz-chart-placeholder--medium"></div>
            <div className="viz-chart-placeholder viz-chart-placeholder--tall"></div>
            <div className="viz-chart-placeholder viz-chart-placeholder--short"></div>
          </div>
        ) : (
          // Gráfico de barras
          <div className="viz-chart-bars viz-chart-bars--horizontal">
            <div className="viz-chart-placeholder viz-chart-placeholder--short"></div>
            <div className="viz-chart-placeholder viz-chart-placeholder--medium"></div>
            <div className="viz-chart-placeholder viz-chart-placeholder--tall"></div>
            <div className="viz-chart-placeholder viz-chart-placeholder--medium"></div>
            <div className="viz-chart-placeholder viz-chart-placeholder--short"></div>
          </div>
        )}

        {/* Ejes */}
        {showXAxis && (
          <div
            className={`viz-chart-axis viz-chart-axis--x ${
              rotateXLabels ? "viz-chart-axis--rotated" : ""
            }`}
          >
            <div className="viz-chart-axis-line"></div>
          </div>
        )}
        {showYAxis && (
          <div className="viz-chart-axis viz-chart-axis--y">
            <div className="viz-chart-axis-line"></div>
          </div>
        )}
      </div>
    </div>
  );
};
