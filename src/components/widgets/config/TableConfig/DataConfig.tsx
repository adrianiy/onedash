import React from "react";
import type { Widget } from "../../../../types/widget";
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
    </div>
  );
};
