import React, { useState } from "react";
import type { Widget, TableWidget } from "../../../../types/widget";
import { useWidgetStore } from "../../../../store/widgetStore";
import { TableConfigTabs } from "./TableConfigTabs";

interface TableConfigProps {
  widget: Widget;
}

export const TableConfig: React.FC<TableConfigProps> = ({ widget }) => {
  // Los hooks deben llamarse siempre, antes de cualquier return
  const [title, setTitle] = useState(widget.title || "");
  const { updateWidget } = useWidgetStore();

  // Asegúrate de que es una tabla
  if (widget.type !== "table") {
    console.error("Widget no es de tipo tabla", widget);
    return null;
  }

  const tableWidget = widget as TableWidget;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;

    // Actualizar estado local primero para mantener el foco del input
    setTitle(newTitle);

    // Actualizar el store sin causar re-renderizado problemático
    updateWidget(widget.id, { title: newTitle });
  };

  return (
    <div className="table-config">
      <input
        className="config-input table-config__title-input"
        value={title}
        onChange={handleTitleChange}
        placeholder="Título de la tabla"
      />
      <TableConfigTabs widget={tableWidget} />
    </div>
  );
};
