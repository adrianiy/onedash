import React from "react";

interface WidgetSkeletonProps {
  className?: string;
}

export const WidgetSkeleton: React.FC<WidgetSkeletonProps> = ({
  className = "",
}) => {
  return (
    <div className={`widget-skeleton ${className}`}>
      <div className="widget-skeleton__content">
        <div className="widget-skeleton__rect widget-skeleton__rect--title"></div>
        <div className="widget-skeleton__rect widget-skeleton__rect--content"></div>
        <div className="widget-skeleton__rect widget-skeleton__rect--footer"></div>
      </div>
    </div>
  );
};
