import type { Widget } from "@/types/widget";
import { WidgetFiltersConfig } from "@/components/widgets/config/common/controls/WidgetFiltersConfig";
import React from "react";
import { BreakdownLevelConfig } from "./BreakdownLevelConfig";
import { TableColumnsConfig } from "./TableColumnsConfig";

interface DataConfigProps {
  widget: Widget;
}

export const DataConfig: React.FC<DataConfigProps> = ({ widget }) => {
  return (
    <div className="data-config">
      <div className="data-config-section">
        <BreakdownLevelConfig widget={widget} />
      </div>
      <div className="data-config-section">
        <TableColumnsConfig widget={widget} />
      </div>
      <WidgetFiltersConfig widget={widget} />
    </div>
  );
};
