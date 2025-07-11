import React from "react";
import type { Widget } from "@/types/widget";
import { TableColumnsConfigWrapper } from "./TableColumnsConfigWrapper";

interface TableColumnsConfigProps {
  widget: Widget;
}

export const TableColumnsConfig: React.FC<TableColumnsConfigProps> = ({
  widget,
}) => {
  return <TableColumnsConfigWrapper widget={widget} />;
};
