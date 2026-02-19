import React from "react";
import type { ComparisonWidget } from "@/types/widget";
import { BaseEventsConfig } from "@/components/widgets/config/common/BaseEventsConfig";

interface EventsConfigProps {
  widget: ComparisonWidget;
}

export const EventsConfig: React.FC<EventsConfigProps> = ({ widget }) => {
  return <BaseEventsConfig widget={widget} />;
};
