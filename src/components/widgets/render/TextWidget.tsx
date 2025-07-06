import React from "react";
import type { TextWidget as TextWidgetType } from "../../../types/widget";

interface TextWidgetProps {
  widget: TextWidgetType;
}

export const TextWidget: React.FC<TextWidgetProps> = ({ widget }) => {
  return (
    <div
      className="text-widget"
      style={{
        fontSize: widget.config.fontSize || 16,
        textAlign: widget.config.textAlign || "left",
      }}
    >
      {String(widget.config.content)}
    </div>
  );
};
