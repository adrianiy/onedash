import React from "react";
import { Icon } from "@/common/Icon";

interface ErrorWidgetProps {
  message?: string;
}

export const ErrorWidget: React.FC<ErrorWidgetProps> = ({
  message = "Unknown widget type",
}) => {
  return (
    <div className="widget-error">
      <Icon name="alert-circle" size={24} />
      <span>{message}</span>
    </div>
  );
};
