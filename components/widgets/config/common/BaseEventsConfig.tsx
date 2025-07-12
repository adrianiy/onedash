import React from "react";
import type { Widget } from "@/types/widget";
import { EventsConfigPlaceholder } from "./EventsConfigPlaceholder";

interface BaseEventsConfigProps {
  widget: Widget;
  children?: React.ReactNode;
}

// Registry de componentes implementados por tipo de widget
const EVENTS_CONFIG_REGISTRY = {
  metric: true, // MetricConfig tiene implementación completa
  table: false, // TableConfig usa placeholder
  chart: false, // ChartConfig usa placeholder
} as const;

export const BaseEventsConfig: React.FC<BaseEventsConfigProps> = ({
  widget,
  children,
}) => {
  // Si hay children (implementación específica), usarlos
  if (children) {
    return <>{children}</>;
  }

  // Si el widget tiene implementación en el registry, delegar al componente específico
  const hasImplementation =
    EVENTS_CONFIG_REGISTRY[widget.type as keyof typeof EVENTS_CONFIG_REGISTRY];

  // Si no hay implementación, mostrar placeholder
  if (!hasImplementation) {
    return (
      <EventsConfigPlaceholder
        widgetType={widget.type}
        className="events-config"
      />
    );
  }

  // Para widgets con implementación pero sin children, mostrar placeholder por defecto
  // (esto no debería pasar en uso normal, pero es un fallback seguro)
  return (
    <EventsConfigPlaceholder
      widgetType={widget.type}
      className="events-config"
    />
  );
};
