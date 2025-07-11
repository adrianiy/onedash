import { WidgetFiltersConfig } from "@/config/common/controls/WidgetFiltersConfig";
import type { Widget } from "@/types/widget";
import React from "react";
import { BreakdownLevelConfig } from "./data/BreakdownLevelConfig";
import { TableColumnsConfig } from "./data/TableColumnsConfig";

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
