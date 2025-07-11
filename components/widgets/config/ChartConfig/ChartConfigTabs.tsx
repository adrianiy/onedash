import React, { useState } from "react";
import type { ChartWidget, Widget } from "../../../../types/widget";
import type { ConfigTab } from "../../common/ConfigTabs";
import { ConfigTabs } from "../../common/ConfigTabs";
import { DataConfig } from "./DataConfig";
import { VisualizationConfig } from "./VisualizationConfig";
import { EventsConfig } from "./EventsConfig";

interface ChartConfigTabsProps {
  widget: ChartWidget;
}

export const ChartConfigTabs: React.FC<ChartConfigTabsProps> = ({ widget }) => {
  const [activeTab, setActiveTab] = useState("data");

  const tabs: ConfigTab[] = [
    {
      id: "data",
      label: "Datos",
      component: DataConfig as React.ComponentType<{ widget: Widget }>,
    },
    {
      id: "visualization",
      label: "Vista",
      component: VisualizationConfig as React.ComponentType<{ widget: Widget }>,
    },
    {
      id: "events",
      label: "Eventos",
      component: EventsConfig as React.ComponentType<{ widget: Widget }>,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "data":
        return <DataConfig widget={widget} />;
      case "visualization":
        return <VisualizationConfig widget={widget} />;
      case "events":
        return <EventsConfig widget={widget} />;
      default:
        return null;
    }
  };

  return (
    <div className="chart-config-tabs">
      <ConfigTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <div className="chart-config-tabs__content">{renderTabContent()}</div>
    </div>
  );
};
