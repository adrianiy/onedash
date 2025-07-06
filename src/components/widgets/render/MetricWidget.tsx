import React from "react";
import { Icon } from "../../common/Icon";
import type { MetricWidget as MetricWidgetType } from "../../../types/widget";

interface MetricWidgetProps {
  widget: MetricWidgetType;
}

export const MetricWidget: React.FC<MetricWidgetProps> = ({ widget }) => {
  return (
    <div className="metric-widget">
      <div className="metric-value">
        {widget.config.value}
        {widget.config.unit && (
          <span className="metric-unit">{widget.config.unit}</span>
        )}
      </div>
      {widget.config.trend && (
        <div className={`metric-trend ${widget.config.trend}`}>
          <Icon name={`trending-${widget.config.trend}`} size={16} />
          {widget.config.trendValue && <span>{widget.config.trendValue}%</span>}
        </div>
      )}
    </div>
  );
};
