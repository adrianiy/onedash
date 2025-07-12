import React from "react";
import type { Widget } from "@/types/widget";

export interface ConfigTab {
  id: string;
  label: string;
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
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};
