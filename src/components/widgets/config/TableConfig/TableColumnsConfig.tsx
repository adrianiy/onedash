import React, { useRef, useState } from "react";
import type { Widget, TableWidgetConfig } from "../../../../types/widget";
import type { MetricDefinition } from "../../../../types/metricConfig";
import { ConfigDropdown } from "../../common/ConfigDropdown";
import { EmptyPlaceholder } from "../../common/EmptyPlaceholder";
import { Icon } from "../../../common/Icon";
import { MetricSelector } from "../../common/MetricSelector";
import { useWidgetStore } from "../../../../store/widgetStore";
import { ColumnItem } from "./components/ColumnItem";
import {
  DndContext,
  closestCenter,
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

// Extendemos MetricDefinition para incluir propiedades de visualización
interface ColumnConfig extends MetricDefinition {
  visible?: boolean;
  selected?: boolean;
}

interface TableColumnsConfigProps {
  widget: Widget;
}

export const TableColumnsConfig: React.FC<TableColumnsConfigProps> = ({
  widget,
}) => {
  const tableConfig = widget.type === "table" ? widget.config : { columns: [] };
  // Convertimos las columnas base a ColumnConfig
  const columnsFromConfig: ColumnConfig[] = (
    (tableConfig as TableWidgetConfig).columns || []
  ).map((column) => {
    // Usar el valor visible existente o establecer true por defecto
    const columnWithVisibility = column as ColumnConfig;
    return {
      ...column,
      visible:
        columnWithVisibility.visible !== undefined
          ? columnWithVisibility.visible
          : true,
      selected: false,
    };
  });

  // Estado para controlar qué columnas están seleccionadas
  // (la visibilidad se maneja directamente en la configuración del widget)
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  // Referencia para controlar el estado del dropdown
  const setDropdownOpenRef = useRef<((isOpen: boolean) => void) | null>(null);

  // Configuración de sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Función para actualizar el widget con las nuevas columnas
  const handleAddColumns = (newMetrics: MetricDefinition[]) => {
    if (widget.type === "table") {
      // Obtener el store para actualizar el widget
      const { updateWidget } = useWidgetStore.getState();

      // Añadir la propiedad visible por defecto a true para las nuevas columnas
      const newColumnsWithVisibility: ColumnConfig[] = newMetrics.map(
        (column) => ({
          ...column,
          visible: true,
          selected: false,
        })
      );

      // Crear un nuevo array con todas las columnas
      const updatedColumns = [
        ...columnsFromConfig,
        ...newColumnsWithVisibility,
      ];

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

  // Función para eliminar una columna
  const handleRemoveColumn = (columnId: string) => {
    if (widget.type === "table") {
      // Obtener el store para actualizar el widget
      const { updateWidget } = useWidgetStore.getState();

      // Filtrar la columna a eliminar
      const updatedColumns: ColumnConfig[] = columnsFromConfig.filter(
        (column) => column.id !== columnId
      );

      // Actualizar el widget
      updateWidget(widget.id, {
        config: {
          ...widget.config,
          columns: updatedColumns,
        },
      });

      // Actualizar estados locales si es necesario
      if (selectedColumns.includes(columnId)) {
        setSelectedColumns(selectedColumns.filter((id) => id !== columnId));
      }
    }
  };

  // Función para cambiar la visibilidad de una columna
  const handleToggleVisibility = (columnId: string) => {
    if (widget.type === "table") {
      // Obtener el store para actualizar el widget
      const { updateWidget } = useWidgetStore.getState();

      // Obtener las columnas directamente del widget actual
      const currentColumns = [...widget.config.columns];

      // Crear una copia de las columnas y actualizar la visibilidad de la columna específica
      const updatedColumns = currentColumns.map((column) => {
        if (column.id === columnId) {
          // Buscar el valor actual de visible, si existe
          const currentVisibility = "visible" in column ? column.visible : true;

          // Invertir el valor de visibilidad
          const newVisibility = !currentVisibility;

          // Crear una nueva columna con el valor de visible actualizado
          // y asegurar que se guarde correctamente
          const updatedColumn = { ...column, visible: newVisibility };

          console.log(
            `Toggle visibility for column ${columnId}:`,
            `${currentVisibility} -> ${newVisibility}`,
            `Updated column:`,
            updatedColumn
          );

          return updatedColumn;
        }
        return column;
      });

      console.log(
        "Columns before update:",
        currentColumns.map((c) => ({ id: c.id, visible: c.visible }))
      );
      console.log(
        "Columns after update:",
        updatedColumns.map((c) => ({ id: c.id, visible: c.visible }))
      );

      // Actualizar el widget con las columnas actualizadas
      updateWidget(widget.id, {
        config: {
          ...widget.config,
          columns: updatedColumns,
        },
      });
    }
  };

  // Función para seleccionar/deseleccionar una columna
  const handleToggleSelect = (columnId: string) => {
    if (selectedColumns.includes(columnId)) {
      // Si está seleccionada, la deseleccionamos
      setSelectedColumns(selectedColumns.filter((id) => id !== columnId));
    } else {
      // Si no está seleccionada, la seleccionamos
      setSelectedColumns([...selectedColumns, columnId]);
    }
  };

  // Seleccionar todas las columnas
  const handleSelectAll = () => {
    setSelectedColumns(columnsFromConfig.map((column) => column.id));
  };

  // Borrar selección
  const handleClearSelection = () => {
    setSelectedColumns([]);
  };

  // Borrar columnas seleccionadas
  const handleRemoveSelected = () => {
    if (widget.type === "table") {
      // Obtener el store para actualizar el widget
      const { updateWidget } = useWidgetStore.getState();

      // Filtrar las columnas seleccionadas
      const updatedColumns = columnsFromConfig.filter(
        (column) => !selectedColumns.includes(column.id)
      );

      // Actualizar el widget
      updateWidget(widget.id, {
        config: {
          ...widget.config,
          columns: updatedColumns,
        },
      });

      // Limpiar selección después de borrar
      setSelectedColumns([]);
    }
  };

  // Renombrar una columna
  const handleRenameColumn = (columnId: string, newTitle: string) => {
    if (widget.type === "table") {
      // Obtener el store para actualizar el widget
      const { updateWidget } = useWidgetStore.getState();

      // Crear una copia de las columnas y actualizar el título de la columna específica
      const updatedColumns = columnsFromConfig.map((column) => {
        if (column.id === columnId) {
          return { ...column, title: newTitle };
        }
        return column;
      });

      // Actualizar el widget con las columnas actualizadas
      updateWidget(widget.id, {
        config: {
          ...widget.config,
          columns: updatedColumns,
        },
      });
    }
  };

  // Manejador para cuando termina el arrastre
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Obtener el store para actualizar el widget
      const { updateWidget } = useWidgetStore.getState();

      // Obtener índices antiguo y nuevo
      const oldIndex = columnsFromConfig.findIndex(
        (column) => column.id === active.id
      );
      const newIndex = columnsFromConfig.findIndex(
        (column) => column.id === over.id
      );

      // Reordenar la lista
      const newOrderColumns = arrayMove(columnsFromConfig, oldIndex, newIndex);

      // Actualizar el widget
      if (widget.type === "table") {
        updateWidget(widget.id, {
          config: {
            ...widget.config,
            columns: newOrderColumns,
          },
        });
      }
    }
  };

  // Renderizar los elementos de las columnas
  const renderColumnItems = () => {
    if (columnsFromConfig.length === 0) return null;

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={columnsFromConfig.map((column) => column.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="columns-list config-panel__items-list">
            {columnsFromConfig.map((column, index) => {
              const isVisible = column.visible ?? true;
              const isSelected = selectedColumns.includes(column.id);

              return (
                <ColumnItem
                  key={column.id}
                  id={column.id}
                  index={index}
                  column={column}
                  isVisible={isVisible}
                  isSelected={isSelected}
                  onRemove={handleRemoveColumn}
                  onToggleVisibility={handleToggleVisibility}
                  onToggleSelect={handleToggleSelect}
                  onRename={handleRenameColumn}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    );
  };

  return (
    <div
      className={`columns-config config-panel ${
        columnsFromConfig.length > 0 ? "config-panel--resizable" : ""
      }`}
    >
      <ConfigDropdown
        className="metrics-dropdown"
        setIsOpenRef={setDropdownOpenRef}
        offsetDistance={20}
        triggerElement={({ ref, onClick, referenceProps }) =>
          columnsFromConfig.length > 0 ? (
            <>
              <div className="columns-config__header config-panel__header">
                <span className="columns-config__title config-panel__title">
                  COLUMNAS
                  {selectedColumns.length > 0 && (
                    <span className="columns-config__counter config-panel__counter">
                      ({selectedColumns.length})
                    </span>
                  )}
                </span>
                {selectedColumns.length > 0 ? (
                  <div className="columns-config__actions config-panel__actions">
                    <button
                      className="columns-config__action-button config-panel__action-button"
                      onClick={handleSelectAll}
                      title="Seleccionar todo"
                    >
                      Todo
                    </button>
                    <button
                      className="columns-config__action-button config-panel__action-button"
                      onClick={handleClearSelection}
                      title="Quitar selección"
                    >
                      Ninguno
                    </button>
                    <button
                      className="columns-config__action-button--danger config-panel__action-button--danger"
                      onClick={handleRemoveSelected}
                      title="Eliminar columnas seleccionadas"
                    >
                      Borrar
                    </button>
                  </div>
                ) : (
                  <button
                    ref={ref}
                    className="columns-config__add-button config-panel__add-button"
                    onClick={onClick}
                    {...referenceProps}
                  >
                    <Icon name="plus" size={12} /> Añadir
                  </button>
                )}
              </div>
              {renderColumnItems()}
            </>
          ) : (
            <EmptyPlaceholder
              iconName="plus"
              text="Añadir columnas"
              onClick={onClick}
              referenceProps={referenceProps}
              forwardedRef={ref}
              className="columns-config__placeholder config-panel__placeholder"
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
