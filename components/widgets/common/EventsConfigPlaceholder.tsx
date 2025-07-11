import React from "react";
import { Icon } from "@/common/Icon";

interface EventsConfigPlaceholderProps {
  widgetType: string;
  className?: string;
}

export const EventsConfigPlaceholder: React.FC<
  EventsConfigPlaceholderProps
> = ({ widgetType, className = "" }) => {
  return (
    <div className={`${widgetType}-config__placeholder ${className}`.trim()}>
      <Icon name="zap" size={32} />
      <span>Configuración de eventos</span>
      <p>
        Próximamente: Definición de interacciones, eventos y acciones entre
        widgets
      </p>
    </div>
  );
};
