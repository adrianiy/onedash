import React from "react";
import type { Widget } from "@/types/widget";
import { BaseEventsConfig } from "@/components/widgets/config/common/BaseEventsConfig";

interface EventsConfigProps {
  widget: Widget;
}

export const EventsConfig: React.FC<EventsConfigProps> = ({ widget }) => {
  return <BaseEventsConfig widget={widget} />;
};
