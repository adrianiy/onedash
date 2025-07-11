import React from "react";
import type { Widget } from "@/types/widget";
import { BaseConfigTabs } from "./BaseConfigTabs";
import { getTabsForWidget } from "@/components/widgets/config/registry/tabRegistry";

interface BaseWidgetConfigProps {
  widget: Widget;
  className?: string;
}

export const BaseWidgetConfig: React.FC<BaseWidgetConfigProps> = ({
  widget,
  className = "",
}) => {
  const tabs = getTabsForWidget(widget.type);

  if (!tabs || tabs.length === 0) {
    return (
      <div className={`base-widget-config ${className}`}>
        <div className="base-widget-config__error">
          <span>No hay configuración disponible para este tipo de widget</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`base-widget-config ${className}`}>
      <BaseConfigTabs
        widget={widget}
        tabs={tabs}
        className="base-widget-config__tabs"
      />
    </div>
  );
};
