import React from "react";
import { Icon, type IconName } from "@/common/Icon";
import { Tooltip } from "react-tooltip";

interface VisualizationToggleButtonProps {
  isActive: boolean;
  onClick: () => void;
  icon: IconName;
  tooltipId: string;
  tooltipContent: string;
  disabled?: boolean;
  size?: number;
  className?: string;
}

export const VisualizationToggleButton: React.FC<
  VisualizationToggleButtonProps
> = ({
  isActive,
  onClick,
  icon,
  tooltipId,
  tooltipContent,
  disabled = false,
  size = 16,
  className = "",
}) => {
  return (
    <>
      <button
        className={`viz-control-btn ${
          isActive ? "viz-control-btn--active" : ""
        } ${disabled ? "viz-control-btn--disabled" : ""} ${className}`}
        onClick={onClick}
        data-tooltip-id={tooltipId}
        disabled={disabled}
      >
        <Icon name={icon} size={size} />
      </button>
      <Tooltip id={tooltipId} content={tooltipContent} />
    </>
  );
};
