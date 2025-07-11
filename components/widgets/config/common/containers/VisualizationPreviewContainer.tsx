import React from "react";

interface VisualizationPreviewContainerProps {
  children: React.ReactNode;
  className?: string;
  type?: "chart" | "metric" | "table";
}

export const VisualizationPreviewContainer: React.FC<
  VisualizationPreviewContainerProps
> = ({ children, className = "", type }) => {
  const baseClass = "viz-preview-container";
  const typeClass = type ? `viz-preview-container--${type}` : "";
  const finalClass = `${baseClass} ${typeClass} ${className}`.trim();

  return <div className={finalClass}>{children}</div>;
};
