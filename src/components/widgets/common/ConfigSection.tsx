import React, { type ReactNode } from "react";

interface ConfigSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
  actionButton?: ReactNode;
}

export const ConfigSection: React.FC<ConfigSectionProps> = ({
  title,
  children,
  className = "",
  actionButton,
}) => {
  return (
    <div className={`config-section ${className}`}>
      <div className="config-section__header">
        <div className="config-section__title">{title}</div>
        {actionButton && (
          <div className="config-section__action">{actionButton}</div>
        )}
      </div>
      <div className="config-section__content">{children}</div>
    </div>
  );
};
