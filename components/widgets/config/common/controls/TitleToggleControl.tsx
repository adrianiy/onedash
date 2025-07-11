import React from "react";
import { Icon } from "@/common/Icon";
import { Tooltip } from "react-tooltip";
import type { Widget } from "@/types/widget";

interface TitleToggleControlProps {
  widget: Widget;
  showTitle: boolean;
  onToggleTitle: (show: boolean) => void;
  className?: string;
}

export const TitleToggleControl: React.FC<TitleToggleControlProps> = ({
  widget,
  showTitle,
  onToggleTitle,
  className = "",
}) => {
  // Verificar si hay título para habilitar/deshabilitar la opción
  const hasTitleDisabled = !widget.title || widget.title.trim() === "";

  return (
    <div className={`viz-control-with-label ${className}`.trim()}>
      <button
        className={`viz-control-btn ${
          showTitle ? "viz-control-btn--active" : ""
        } ${hasTitleDisabled ? "viz-control-btn--disabled" : ""}`}
        onClick={() => !hasTitleDisabled && onToggleTitle(!showTitle)}
        data-tooltip-id="viz-title-tooltip"
        disabled={hasTitleDisabled}
      >
        <Icon name="type" size={16} />
      </button>
      <span className="viz-control-label">Título</span>
      <Tooltip id="viz-title-tooltip" content="Mostrar título del widget" />
    </div>
  );
};
