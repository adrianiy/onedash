import React from "react";
import { Icon, type IconName } from "@/common/Icon";

interface WidgetPlaceholderProps {
  icon: IconName;
  title: string;
  description: string;
  className?: string;
}

export const WidgetPlaceholder: React.FC<WidgetPlaceholderProps> = ({
  icon,
  title,
  description,
  className = "",
}) => {
  return (
    <div className={`widget-placeholder ${className}`}>
      <Icon name={icon} size={48} />
      <h3>{title}</h3>
      <div className="placeholder-tip">
        <Icon name="info" size={16} />
        <p>{description}</p>
      </div>
    </div>
  );
};
