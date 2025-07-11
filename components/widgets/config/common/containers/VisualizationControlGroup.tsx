import React from "react";

interface VisualizationControlGroupProps {
  label?: string;
  controls: React.ReactNode;
  orientation?: "horizontal" | "vertical";
  className?: string;
  showLabel?: boolean;
}

export const VisualizationControlGroup: React.FC<
  VisualizationControlGroupProps
> = ({
  label,
  controls,
  orientation = "horizontal",
  className = "",
  showLabel = true,
}) => {
  const baseClass = `viz-control-group viz-control-group--${orientation}`;
  const finalClass = `${baseClass} ${className}`.trim();

  return (
    <div className={finalClass}>
      {label && showLabel && (
        <div className="viz-control-with-label">
          {controls}
          <span className="viz-control-label">{label}</span>
        </div>
      )}
      {(!label || !showLabel) && controls}
    </div>
  );
};
