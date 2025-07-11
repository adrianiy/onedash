import { Icon } from "@/common/Icon";
import type { MetricDefinition } from "@/types/metricConfig";
import { getDisplayTitle } from "@/types/metricConfig";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ConfigDropdown } from "../ui/ConfigDropdown";
import { EmptyPlaceholder } from "../ui/EmptyPlaceholder";
import { MetricSelector } from "../MetricSelector";

// Extendemos MetricDefinition para incluir propiedades de visualización
interface ItemConfig extends MetricDefinition {
  visible?: boolean;
  selected?: boolean;
}

interface GenericMetricListConfigProps {
  items: MetricDefinition[];
  onUpdate: (items: MetricDefinition[]) => void;

  // Configuración de textos y comportamiento
  labels: {
    title: string; // "COLUMNAS" | "SERIES (EJE Y)"
    addText: string; // "Añadir columnas" | "Añadir series"
    itemName: string; // "columna" | "serie"
  };

  // Configuración específica
  className?: string;
  itemComponent: React.ComponentType<{
    id: string;
    index: number;
    item: MetricDefinition;
    isVisible: boolean;
    isSelected: boolean;
    onRemove: (id: string) => void;
    onToggleVisibility: (id: string) => void;
    onToggleSelect: (id: string) => void;
    onRename: (id: string, newTitle: string) => void;
    onCopy: (id: string) => void;
    onEdit: (id: string) => void;
  }>;
}

export const GenericMetricListConfig: React.FC<
  GenericMetricListConfigProps
> = ({
  items,
  onUpdate,
  labels,
  className = "config-panel",
  itemComponent: ItemComponent,
}) => {
  // Convertimos los items base a ItemConfig y memorizamos el resultado
  const itemsFromConfig: ItemConfig[] = useMemo(() => {
    return items.map((item) => {
      // Usar el valor visible existente o establecer true por defecto
      const itemWithVisibility = item as ItemConfig;
      return {
        ...item,
        visible:
          itemWithVisibility.visible !== undefined
            ? itemWithVisibility.visible
            : true,
        selected: false,
      };
    });
  }, [items]);

  // Estado para controlar qué items están seleccionados
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Estado para controlar el item en edición
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Estado para almacenar el item que se está editando
  const [editingItem, setEditingItem] = useState<MetricDefinition | null>(null);

  // Referencia para controlar el estado del dropdown
  const setDropdownOpenRef = useRef<((isOpen: boolean) => void) | null>(null);

  // Configuración de sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Efecto para establecer el item en edición cuando cambia el ID
  useEffect(() => {
    if (editingItemId) {
      const item = itemsFromConfig.find((i) => i.id === editingItemId);
      if (item) {
        setEditingItem(item);
      }
    } else {
      setEditingItem(null);
    }
  }, [editingItemId, itemsFromConfig]);

  // Función para actualizar el widget con los nuevos items
  const handleAddItems = (newMetrics: MetricDefinition[]) => {
    // Añadir la propiedad visible por defecto a true para los nuevos items
    const newItemsWithVisibility: ItemConfig[] = newMetrics.map((item) => ({
      ...item,
      visible: true,
      selected: false,
    }));

    // Crear un nuevo array con todos los items
    const updatedItems = [...itemsFromConfig, ...newItemsWithVisibility];

    // Actualizar a través del callback
    onUpdate(updatedItems);

    // Cerrar el dropdown después de seleccionar
    if (setDropdownOpenRef.current) {
      setDropdownOpenRef.current(false);
    }

    // Resetear el modo de edición
    setEditingItemId(null);
  };

  // Función para editar un item existente
  const handleEditItem = (updatedMetric: MetricDefinition) => {
    if (editingItemId) {
      // Crear una copia de los items actuales
      const updatedItems = itemsFromConfig.map((item) => {
        if (item.id === editingItemId) {
          // Mantener el id, visible y selected del item original
          return {
            ...updatedMetric,
            id: editingItemId,
            visible: item.visible,
            selected: item.selected,
          };
        }
        return item;
      });

      // Actualizar a través del callback
      onUpdate(updatedItems);

      // Resetear el modo de edición
      setEditingItemId(null);

      // Cerrar el dropdown
      if (setDropdownOpenRef.current) {
        setDropdownOpenRef.current(false);
      }
    }
  };

  // Función para copiar un item
  const handleCopyItem = (itemId: string) => {
    // Encontrar el item a copiar
    const itemToCopy = itemsFromConfig.find((item) => item.id === itemId);

    if (itemToCopy) {
      // Crear una copia del item con un nuevo ID único
      const newId = `${itemToCopy.id}_copy_${Date.now()}`;
      const copiedItem: ItemConfig = {
        ...JSON.parse(JSON.stringify(itemToCopy)), // Deep copy para evitar problemas de referencia
        id: newId,
        displayName: `${
          itemToCopy.displayName || getDisplayTitle(itemToCopy, {})
        } (Copia)`,
      };

      // Encontrar el índice del item original para insertar la copia justo después
      const originalIndex = itemsFromConfig.findIndex(
        (item) => item.id === itemId
      );

      // Crear un nuevo array con todos los items, insertando la copia después del original
      const updatedItems = [...itemsFromConfig];
      updatedItems.splice(originalIndex + 1, 0, copiedItem);

      // Actualizar a través del callback
      onUpdate(updatedItems);
    }
  };

  // Función para eliminar un item
  const handleRemoveItem = (itemId: string) => {
    // Filtrar el item a eliminar
    const updatedItems: ItemConfig[] = itemsFromConfig.filter(
      (item) => item.id !== itemId
    );

    // Actualizar a través del callback
    onUpdate(updatedItems);

    // Actualizar estados locales si es necesario
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    }
  };

  // Función para cambiar la visibilidad de un item
  const handleToggleVisibility = (itemId: string) => {
    // Crear una copia de los items y actualizar la visibilidad del item específico
    const updatedItems = itemsFromConfig.map((item) => {
      if (item.id === itemId) {
        const currentVisibility =
          item.visible !== undefined ? item.visible : true;
        return { ...item, visible: !currentVisibility };
      }
      return item;
    });

    // Actualizar a través del callback
    onUpdate(updatedItems);
  };

  // Función para seleccionar/deseleccionar un item
  const handleToggleSelect = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  // Seleccionar todos los items
  const handleSelectAll = () => {
    setSelectedItems(itemsFromConfig.map((item) => item.id));
  };

  // Borrar selección
  const handleClearSelection = () => {
    setSelectedItems([]);
  };

  // Borrar items seleccionados
  const handleRemoveSelected = () => {
    const updatedItems = itemsFromConfig.filter(
      (item) => !selectedItems.includes(item.id)
    );
    onUpdate(updatedItems);
    setSelectedItems([]);
  };

  // Renombrar un item
  const handleRenameItem = (itemId: string, newTitle: string) => {
    const updatedItems = itemsFromConfig.map((item) => {
      if (item.id === itemId) {
        return { ...item, displayName: newTitle };
      }
      return item;
    });
    onUpdate(updatedItems);
  };

  // Manejador para cuando termina el arrastre
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Obtener índices antiguo y nuevo
      const oldIndex = itemsFromConfig.findIndex(
        (item) => item.id === active.id
      );
      const newIndex = itemsFromConfig.findIndex((item) => item.id === over.id);

      // Reordenar la lista
      const newOrderItems = arrayMove(itemsFromConfig, oldIndex, newIndex);

      // Actualizar a través del callback
      onUpdate(newOrderItems);
    }
  };

  // Renderizar los elementos de los items
  const renderItemElements = () => {
    if (itemsFromConfig.length === 0) return null;

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={itemsFromConfig.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="config-panel__items-list">
            {itemsFromConfig.map((item, index) => {
              const isVisible = item.visible ?? true;
              const isSelected = selectedItems.includes(item.id);

              return (
                <ItemComponent
                  key={item.id}
                  id={item.id}
                  index={index}
                  item={item}
                  isVisible={isVisible}
                  isSelected={isSelected}
                  onRemove={handleRemoveItem}
                  onToggleVisibility={handleToggleVisibility}
                  onToggleSelect={handleToggleSelect}
                  onRename={handleRenameItem}
                  onCopy={handleCopyItem}
                  onEdit={(id) => {
                    setEditingItemId(id);
                    if (setDropdownOpenRef.current) {
                      setDropdownOpenRef.current(true);
                    }
                  }}
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
      className={`${className} ${
        itemsFromConfig.length > 0 ? "config-panel--resizable" : ""
      }`}
    >
      <ConfigDropdown
        className="metrics-dropdown"
        setIsOpenRef={setDropdownOpenRef}
        offsetDistance={20}
        triggerElement={({ ref, onClick, referenceProps }) =>
          itemsFromConfig.length > 0 ? (
            <>
              <div className="config-panel__header">
                <span className="config-panel__title">
                  {labels.title}
                  {selectedItems.length > 0 && (
                    <span className="config-panel__counter">
                      ({selectedItems.length})
                    </span>
                  )}
                </span>
                {selectedItems.length > 0 ? (
                  <div className="config-panel__actions">
                    <button
                      className="config-panel__action-button"
                      onClick={handleSelectAll}
                      title="Seleccionar todo"
                    >
                      Todo
                    </button>
                    <button
                      className="config-panel__action-button"
                      onClick={handleClearSelection}
                      title="Quitar selección"
                    >
                      Ninguno
                    </button>
                    <button
                      className="config-panel__action-button--danger"
                      onClick={handleRemoveSelected}
                      title={`Eliminar ${labels.itemName}s seleccionadas`}
                    >
                      Borrar
                    </button>
                  </div>
                ) : (
                  <button
                    ref={ref}
                    className="config-panel__add-button"
                    onClick={onClick}
                    {...referenceProps}
                  >
                    <Icon name="plus" size={12} /> Añadir
                  </button>
                )}
              </div>
              {renderItemElements()}
            </>
          ) : (
            <EmptyPlaceholder
              iconName="plus"
              text={labels.addText}
              onClick={onClick}
              referenceProps={referenceProps}
              forwardedRef={ref}
              className="config-panel__placeholder"
            />
          )
        }
      >
        {editingItemId ? (
          <MetricSelector
            mode="single"
            selectedMetric={editingItem || undefined}
            onSelectMetric={handleEditItem}
            onClose={() => {
              setEditingItemId(null);
              if (setDropdownOpenRef.current) {
                setDropdownOpenRef.current(false);
              }
            }}
          />
        ) : (
          <MetricSelector
            mode="multiple"
            onSelectMetrics={handleAddItems}
            onClose={() =>
              setDropdownOpenRef.current && setDropdownOpenRef.current(false)
            }
          />
        )}
      </ConfigDropdown>
    </div>
  );
};
