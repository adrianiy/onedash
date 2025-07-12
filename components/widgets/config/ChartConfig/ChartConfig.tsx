import type { ChartWidget, Widget } from "@/types/widget";
import React, { useState } from "react";
import { DataConfig } from "./DataConfig";
import { EventsConfig } from "./EventsConfig";
import { VisualizationConfig } from "./VisualizationConfig";

interface ChartConfigProps {
  widget: Widget;
}

export const ChartConfig: React.FC<ChartConfigProps> = ({ widget }) => {
  const [activeTab, setActiveTab] = useState<string>("data");

  // Asegúrate de que es un gráfico
  if (widget.type !== "chart") {
    console.error("Widget no es de tipo gráfico", widget);
    return null;
  }

  const chartWidget = widget as ChartWidget;

  const tabs = [
    { id: "data", label: "Datos", component: DataConfig },
    { id: "visualization", label: "Vista", component: VisualizationConfig },
    { id: "events", label: "Eventos", component: EventsConfig },
  ];

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="chart-config">
      {/* Tab navigation */}
      <div className="config-tabs">
        {tabs.map((tab) => (
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
      <div className="chart-config__content">
        {ActiveComponent && <ActiveComponent widget={chartWidget} />}
      </div>
    </div>
  );
};
