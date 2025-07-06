import React, { useRef } from "react";
import type { Widget, TableWidgetConfig } from "../../../../types/widget";
import type { MetricDefinition } from "../../../../types/metricConfig";
import { ConfigDropdown } from "../../common/ConfigDropdown";
import { EmptyPlaceholder } from "../../common/EmptyPlaceholder";
import { Icon } from "../../../common/Icon";
import { MetricSelector } from "../../common/MetricSelector";
import { useWidgetStore } from "../../../../store/widgetStore";

interface TableColumnsConfigProps {
  widget: Widget;
}

export const TableColumnsConfig: React.FC<TableColumnsConfigProps> = ({
  widget,
}) => {
  const tableConfig = widget.type === "table" ? widget.config : { columns: [] };
  const columns = (tableConfig as TableWidgetConfig).columns || [];

  // Referencia para controlar el estado del dropdown
  const setDropdownOpenRef = useRef<((isOpen: boolean) => void) | null>(null);

  // Función para actualizar el widget con las nuevas columnas
  const handleAddColumns = (newMetrics: MetricDefinition[]) => {
    if (widget.type === "table") {
      // Obtener el store para actualizar el widget
      const { updateWidget } = useWidgetStore.getState();

      // Crear un nuevo array con todas las columnas
      const updatedColumns = [...columns, ...newMetrics];

      // Asegurar que estamos manejando el tipo correcto y todos los campos requeridos
      const typedConfig = tableConfig as TableWidgetConfig;

      // Actualizar el widget con las nuevas columnas
      updateWidget(widget.id, {
        config: {
          columns: updatedColumns,
          data: typedConfig.data || [],
          pagination: typedConfig.pagination,
          breakdownLevels: typedConfig.breakdownLevels,
          dataSource: typedConfig.dataSource,
        },
      });
    }

    // Cerrar el dropdown después de seleccionar
    if (setDropdownOpenRef.current) {
      setDropdownOpenRef.current(false);
    }
  };

  return (
    <div className="columns-config">
      <ConfigDropdown
        className="columns-dropdown"
        setIsOpenRef={setDropdownOpenRef}
        offsetDistance={20}
        triggerElement={({ ref, onClick, referenceProps }) =>
          columns.length > 0 ? (
            <>
              <div className="columns-config__header">
                <span className="columns-config__title">COLUMNAS</span>
                <button
                  ref={ref}
                  className="columns-config__add-button"
                  onClick={onClick}
                  {...referenceProps}
                >
                  <Icon name="plus" size={12} /> Añadir
                </button>
              </div>
              <div className="columns-list">
                <p className="columns-config__placeholder-message">
                  Lista de columnas (por implementar)
                </p>
              </div>
            </>
          ) : (
            <EmptyPlaceholder
              iconName="plus"
              text="Añadir columnas"
              onClick={onClick}
              referenceProps={referenceProps}
              forwardedRef={ref}
              className="columns-config__placeholder"
            />
          )
        }
      >
        <MetricSelector
          mode="multiple"
          onSelectMetrics={handleAddColumns}
          onClose={() =>
            setDropdownOpenRef.current && setDropdownOpenRef.current(false)
          }
        />
      </ConfigDropdown>
    </div>
  );
};
