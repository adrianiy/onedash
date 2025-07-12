import type { MetricWidget, Widget } from "@/types/widget";
import React, { useState } from "react";
import { DataConfig } from "./DataConfig";
import { EventsConfig } from "./EventsConfig";
import { VisualizationConfig } from "./VisualizationConfig";

interface MetricConfigProps {
  widget: Widget;
}

export const MetricConfig: React.FC<MetricConfigProps> = ({ widget }) => {
  const [activeTab, setActiveTab] = useState<string>("data");

  // Asegúrate de que es una métrica
  if (widget.type !== "metric") {
    console.error("Widget no es de tipo métrica", widget);
    return null;
  }

  const metricWidget = widget as MetricWidget;

  const tabs = [
    { id: "data", label: "Datos", component: DataConfig },
    { id: "visualization", label: "Vista", component: VisualizationConfig },
    { id: "events", label: "Eventos", component: EventsConfig },
  ];

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="metric-config">
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
      <div className="metric-config__content">
        {ActiveComponent && <ActiveComponent widget={metricWidget} />}
      </div>
    </div>
  );
};
