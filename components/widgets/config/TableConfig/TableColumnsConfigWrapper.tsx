import { useWidgetStore } from "@/store/widgetStore";
import type { MetricDefinition } from "@/types/metricConfig";
import type { TableWidgetConfig, Widget } from "@/types/widget";
import { GenericMetricListConfig } from "@/components/widgets/config/common/controls/GenericMetricListConfig";
import React from "react";
import { ColumnItemAdapter } from "./components/ColumnItemAdapter";

interface TableColumnsConfigWrapperProps {
  widget: Widget;
}

export const TableColumnsConfigWrapper: React.FC<
  TableColumnsConfigWrapperProps
> = ({ widget }) => {
  const { updateWidget } = useWidgetStore();

  // Verificar que es un widget de table y obtener las columnas
  const tableConfig = widget.type === "table" ? widget.config : { columns: [] };
  const columns = (tableConfig as TableWidgetConfig).columns || [];

  // Función para actualizar las columnas en el widget
  const handleUpdateColumns = (updatedColumns: MetricDefinition[]) => {
    if (widget.type === "table") {
      updateWidget(widget._id, {
        config: {
          ...widget.config,
          columns: updatedColumns,
        },
      });
    }
  };

  // Configuración de labels para columnas
  const columnsLabels = {
    title: "COLUMNAS",
    addText: "Añadir columnas",
    itemName: "columna",
  };

  return (
    <GenericMetricListConfig
      items={columns}
      onUpdate={handleUpdateColumns}
      labels={columnsLabels}
      className="columns-config config-panel"
      itemComponent={ColumnItemAdapter}
    />
  );
};
