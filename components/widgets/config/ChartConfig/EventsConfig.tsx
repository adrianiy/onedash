import React from "react";
import { Icon } from "../../../common/Icon";
import type { ChartWidget } from "../../../../types/widget";

interface EventsConfigProps {
  widget: ChartWidget;
}

export const EventsConfig: React.FC<EventsConfigProps> = () => {
  return (
    <div className="chart-config__placeholder">
      <Icon name="zap" size={32} />
      <span>Configuración de eventos</span>
      <p>
        Próximamente: Definición de interacciones, eventos y acciones entre
        widgets
      </p>
    </div>
  );
};
