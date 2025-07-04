import React, { useState } from "react";
import type { Widget } from "../../../../types/widget";
import { ConfigTabs } from "../../common";
import type { ConfigTab } from "../../common";
import { DataConfig } from "./DataConfig";
import { VisualizationConfig } from "./VisualizationConfig";
import { EventsConfig } from "./EventsConfig";

interface TableConfigTabsProps {
  widget: Widget;
}

export const TableConfigTabs: React.FC<TableConfigTabsProps> = ({ widget }) => {
  const [activeTab, setActiveTab] = useState("data");

  // Definición de las pestañas disponibles
  const tabs: ConfigTab[] = [
    {
      id: "data",
      label: "Datos",
      icon: "database",
      component: DataConfig,
    },
    {
      id: "visualization",
      label: "Vista",
      icon: "eye",
      component: VisualizationConfig,
    },
    {
      id: "events",
      label: "Eventos",
      icon: "zap",
      component: EventsConfig,
    },
  ];

  // Obtener el componente de la pestaña activa
  const ActiveTabComponent =
    tabs.find((tab) => tab.id === activeTab)?.component || DataConfig;

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <>
      <ConfigTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        className="table-config__tabs"
      />
      <div className="table-config__content">
        <ActiveTabComponent widget={widget} />
      </div>
    </>
  );
};
