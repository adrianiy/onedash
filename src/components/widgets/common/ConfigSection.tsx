import React, { type ReactNode, useState } from "react";
import { Icon } from "../../common/Icon";

interface ConfigSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
  actionButton?: ReactNode;
  defaultCollapsed?: boolean;
  useVizStyles?: boolean;
}

export const ConfigSection: React.FC<ConfigSectionProps> = ({
  title,
  children,
  className = "",
  actionButton,
  defaultCollapsed = true,
  useVizStyles = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Determinar qué conjunto de clases usar
  const baseClass = useVizStyles ? "viz-section" : "config-section";
  const collapsedClass = `${baseClass}--collapsed`;
  const headerClass = `${baseClass}__header`;
  const titleContainerClass = `${baseClass}__title-container`;
  const collapseIconClass = `${baseClass}__collapse-icon`;
  const titleClass = `${baseClass}__title`;
  const actionClass = `${baseClass}__action`;
  const contentClass = `${baseClass}__content`;

  return (
    <div
      className={`${baseClass} ${className} ${
        isCollapsed ? collapsedClass : ""
      }`}
    >
      <div className={headerClass} onClick={toggleCollapse}>
        <div className={titleContainerClass}>
          <Icon
            name={isCollapsed ? "chevron-right" : "chevron-down"}
            size={14}
            className={collapseIconClass}
          />
          <div className={titleClass}>{title}</div>
        </div>
        {actionButton && (
          <div className={actionClass} onClick={(e) => e.stopPropagation()}>
            {actionButton}
          </div>
        )}
      </div>
      {!isCollapsed && <div className={contentClass}>{children}</div>}
    </div>
  );
};
