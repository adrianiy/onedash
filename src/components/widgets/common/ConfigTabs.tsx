import React from "react";
import { Icon } from "../../common/Icon";
import type { Widget } from "../../../types/widget";

// Tipos para los iconos
type IconName =
  | "close"
  | "settings"
  | "target"
  | "bar-chart"
  | "line-chart"
  | "pie-chart"
  | "plus"
  | "edit"
  | "trash"
  | "sun"
  | "moon"
  | "save"
  | "menu"
  | "grid"
  | "trending-up"
  | "trending-down"
  | "table"
  | "database"
  | "eye"
  | "zap";

export interface ConfigTab {
  id: string;
  label: string;
  icon: IconName;
  component: React.ComponentType<{ widget: Widget }>;
}

interface ConfigTabsProps {
  tabs: ConfigTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const ConfigTabs: React.FC<ConfigTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = "",
}) => {
  return (
    <div className={`config-tabs ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`config-tab ${
            activeTab === tab.id ? "config-tab--active" : ""
          }`}
          onClick={() => onTabChange(tab.id)}
        >
          <Icon name={tab.icon} size={18} />
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};
