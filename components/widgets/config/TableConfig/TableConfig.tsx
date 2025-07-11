import React from "react";
import type { Widget, TableWidget } from "@/types/widget";
import { BaseWidgetConfig } from "../base";

interface TableConfigProps {
  widget: Widget;
}

export const TableConfig: React.FC<TableConfigProps> = ({ widget }) => {
  // Asegúrate de que es una tabla
  if (widget.type !== "table") {
    console.error("Widget no es de tipo tabla", widget);
    return null;
  }

  const tableWidget = widget as TableWidget;

  return (
    <div className="table-config">
      <BaseWidgetConfig widget={tableWidget} className="table-config__base" />
    </div>
  );
};
