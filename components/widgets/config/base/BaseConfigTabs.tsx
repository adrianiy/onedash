import React from "react";
import type { BaseConfigTabsProps } from "./types";
import { useTabNavigation } from "../hooks";

export const BaseConfigTabs: React.FC<BaseConfigTabsProps> = ({
  widget,
  tabs,
  defaultActiveTab = "data",
  className = "",
}) => {
  const { activeTab, setActiveTab } = useTabNavigation({
    defaultTab: defaultActiveTab,
  });

  // Filter enabled tabs
  const enabledTabs = tabs.filter((tab) =>
    tab.isEnabled ? tab.isEnabled(widget) : true
  );

  // Get the active tab component
  const activeTabData = enabledTabs.find((tab) => tab.id === activeTab);
  const ActiveComponent = activeTabData?.component;

  // If no active component found, default to first enabled tab
  const fallbackTab = enabledTabs[0];
  const FallbackComponent = fallbackTab?.component;
  const ComponentToRender = ActiveComponent || FallbackComponent;

  return (
    <div className={`base-config-tabs ${className}`}>
      {/* Tab navigation */}
      <div className="config-tabs">
        {enabledTabs.map((tab) => (
          <button
            key={tab.id}
            className={`config-tab ${
              activeTab === tab.id ? "config-tab--active" : ""
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="base-config-tabs__content">
        {ComponentToRender && <ComponentToRender widget={widget} />}
      </div>
    </div>
  );
};
