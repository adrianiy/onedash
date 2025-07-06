import React, { useState } from "react";
import type { MetricWidget } from "../../../../types/widget";
import type { ConfigTab } from "../../common/ConfigTabs";
import { ConfigTabs } from "../../common/ConfigTabs";
import { DataConfig } from "./DataConfig";
import { VisualizationConfig } from "./VisualizationConfig";

interface MetricConfigTabsProps {
  widget: MetricWidget;
}

export const MetricConfigTabs: React.FC<MetricConfigTabsProps> = ({
  widget,
}) => {
  const [activeTab, setActiveTab] = useState("data");

  const tabs: ConfigTab[] = [
    {
      id: "data",
      label: "Datos",
      component: DataConfig,
    },
    {
      id: "visualization",
      label: "Visualización",
      component: VisualizationConfig,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "data":
        return <DataConfig widget={widget} />;
      case "visualization":
        return <VisualizationConfig widget={widget} />;
      default:
        return null;
    }
  };

  return (
    <div className="metric-config-tabs">
      <ConfigTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <div className="metric-config-tabs__content">{renderTabContent()}</div>
    </div>
  );
};
