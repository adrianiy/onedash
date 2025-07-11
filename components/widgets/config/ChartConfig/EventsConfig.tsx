import React from "react";
import type { ChartWidget } from "@/types/widget";
import { BaseEventsConfig } from "@/components/widgets/config/common/BaseEventsConfig";

interface EventsConfigProps {
  widget: ChartWidget;
}

export const EventsConfig: React.FC<EventsConfigProps> = ({ widget }) => {
  return <BaseEventsConfig widget={widget} />;
};
