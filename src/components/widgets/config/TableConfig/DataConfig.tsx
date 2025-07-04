import React, { useState } from "react";
import { Icon } from "../../../common/Icon";
import type { Widget, TableWidgetConfig } from "../../../../types/widget";
import {
  useFloating,
  offset,
  flip,
  shift,
  useInteractions,
  useClick,
  useRole,
  useDismiss,
} from "@floating-ui/react";
import { breakdownCategories } from "../../../../types/breakdownLevels";
import type { BreakdownOption } from "../../../../types/breakdownLevels";
import { useWidgetStore } from "../../../../store/widgetStore";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface DataConfigProps {
  widget: Widget;
}

import type { IconName } from "../../../common/Icon";

// Componente para el elemento arrastrable
interface SortableItemProps {
  id: string;
  index: number;
  option: BreakdownOption;
  category: {
    id: string;
    name: string;
    description: string;
    color: string;
    icon: IconName;
    options: BreakdownOption[];
  };
  onRemove: (id: string) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({
  id,
  index,
  option,
  category,
  onRemove,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: id,
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`breakdown-level ${
        isDragging ? "breakdown-level--dragging" : ""
      }`}
    >
      <div className="breakdown-level__content">
        <div
          {...attributes}
          {...listeners}
          className="breakdown-level__grip-container"
        >
          <Icon
            name="grip-vertical"
            size={14}
            className="breakdown-level__grip"
          />
        </div>

        <div className="breakdown-level__index">{index + 1}</div>

        <div className="breakdown-level__main">
          <div className="breakdown-level__info">
            <div
              className={`breakdown-level__icon-container breakdown-level__icon-container--${category.color}`}
            >
              <Icon
                name={category.icon}
                size={14}
                className={`breakdown-level__icon breakdown-level__icon--${category.color}`}
              />
            </div>
            <div className="breakdown-level__name">{option.name}</div>
          </div>
        </div>

        <button
          onClick={() => onRemove(id)}
          className="breakdown-level__remove"
          title="Eliminar nivel"
        >
          <Icon name="trash" size={14} />
        </button>
      </div>
    </div>
  );
};

export const DataConfig: React.FC<DataConfigProps> = ({ widget }) => {
  // Aseguramos que estamos trabajando con un TableWidget y accedemos a sus breakdownLevels
  const tableConfig =
    widget.type === "table" ? widget.config : { breakdownLevels: [] };
  const breakdownLevels =
    (tableConfig as TableWidgetConfig).breakdownLevels || [];

  // Estado para controlar la visibilidad del dropdown
  const [isOpen, setIsOpen] = useState(false);
  // Estado para el texto de búsqueda
  const [searchText, setSearchText] = useState("");

  // Configuración de Floating UI
  const { refs, floatingStyles, context } = useFloating({
    placement: "left-start",
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [
      offset(10), // Espacio entre el botón y el dropdown
      flip(), // Cambiar lado si no hay espacio
      shift(), // Desplazar si es necesario
    ],
  });

  // Configurar interacciones
  const click = useClick(context);
  const dismiss = useDismiss(context, {
    outsidePress: true, // Esto habilita el clickOutside
  });
  const role = useRole(context);

  // Combinar interacciones
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  const handleAddBreakdown = () => {
    // Ya no necesitamos gestionar isOpen manualmente
    // El estado es gestionado por useInteractions
    console.log("Añadir desglose clicked", widget.id);
  };

  const handleSelectOption = (option: BreakdownOption) => {
    // Obtener niveles actuales o inicializar un array vacío
    const currentLevels = breakdownLevels || [];

    // Añadir el nuevo nivel si no existe ya
    if (!currentLevels.includes(option.id)) {
      const updatedLevels = [...currentLevels, option.id];

      if (widget.type === "table") {
        // Actualizar el widget asegurándose que tiene todas las propiedades requeridas
        useWidgetStore.getState().updateWidget(widget.id, {
          config: {
            ...widget.config,
            breakdownLevels: updatedLevels,
          },
        });
      }
    }

    setIsOpen(false);
  };

  // Funciones auxiliares para encontrar opciones y categorías
  const findOptionById = (optionId: string) => {
    for (const category of breakdownCategories) {
      const option = category.options.find((opt) => opt.id === optionId);
      if (option) return option;
    }
    return null;
  };

  const findCategoryByOptionId = (optionId: string) => {
    for (const category of breakdownCategories) {
      if (category.options.some((opt) => opt.id === optionId)) {
        return category;
      }
    }
    return null;
  };

  // Función para eliminar un nivel
  const handleRemoveLevel = (levelId: string) => {
    if (widget.type === "table") {
      const updatedLevels = breakdownLevels.filter((id) => id !== levelId);

      useWidgetStore.getState().updateWidget(widget.id, {
        config: {
          ...widget.config,
          breakdownLevels: updatedLevels,
        },
      });
    }
  };

  // Filtrar categorías basado en el texto de búsqueda
  const filteredCategories = searchText
    ? breakdownCategories
        .map((category) => ({
          ...category,
          options: category.options.filter((option) =>
            option.name.toLowerCase().includes(searchText.toLowerCase())
          ),
        }))
        .filter((category) => category.options.length > 0)
    : breakdownCategories;

  // Renderizar el dropdown de selección de niveles
  const renderDropdown = () => {
    if (!isOpen) return null;

    return (
      <div
        ref={refs.setFloating}
        style={floatingStyles}
        className="breakdown-dropdown"
        {...getFloatingProps()}
      >
        <div className="breakdown-search-container">
          <div className="breakdown-search-input-wrapper">
            <Icon name="search" size={16} className="breakdown-search-icon" />
            <input
              type="text"
              className="breakdown-search-input"
              placeholder="Busca desglose a añadir"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            {searchText && (
              <button
                className="breakdown-search-clear"
                onClick={() => setSearchText("")}
              >
                <Icon name="close" size={14} />
              </button>
            )}
          </div>
        </div>

        {filteredCategories.map((category) => (
          <div key={category.id} className="breakdown-category">
            <div
              className={`breakdown-category__header breakdown-category__header--${category.color}`}
            >
              <Icon
                name={category.icon}
                size={16}
                className={`breakdown-icon--${category.color}`}
              />
              <div>
                <h3
                  className={`breakdown-category__title breakdown-category__title--${category.color}`}
                >
                  {category.name}
                </h3>
                <p
                  className={`breakdown-category__description breakdown-category__description--${category.color}`}
                >
                  {category.description}
                </p>
              </div>
            </div>

            <div className="breakdown-options">
              {category.options.map((option) => (
                <button
                  key={option.id}
                  className="breakdown-option"
                  onClick={() => handleSelectOption(option)}
                >
                  <div
                    className={`breakdown-icon-container breakdown-icon-container--${category.color}`}
                  >
                    <Icon
                      name={category.icon}
                      size={14}
                      className={`breakdown-icon--${category.color}`}
                    />
                  </div>
                  <div className="breakdown-option__title">{option.name}</div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Manejador para cuando termina el arrastre
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Obtener índices antiguo y nuevo
      const oldIndex = breakdownLevels.indexOf(active.id as string);
      const newIndex = breakdownLevels.indexOf(over.id as string);

      // Reordenar la lista
      const newOrderLevels = arrayMove(breakdownLevels, oldIndex, newIndex);

      // Actualizar el widget
      if (widget.type === "table") {
        useWidgetStore.getState().updateWidget(widget.id, {
          config: {
            ...widget.config,
            breakdownLevels: newOrderLevels,
          },
        });
      }
    }
  };

  // Configuración de sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Renderizar los niveles de desglose seleccionados
  const renderBreakdownLevels = () => {
    if (breakdownLevels.length === 0) return null;

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={breakdownLevels}
          strategy={verticalListSortingStrategy}
        >
          <div className="breakdown-levels-list">
            {breakdownLevels.map((levelId, index) => {
              const option = findOptionById(levelId);
              const category = findCategoryByOptionId(levelId);

              if (!option || !category) return null;

              return (
                <SortableItem
                  key={levelId}
                  id={levelId}
                  index={index}
                  option={option}
                  category={category}
                  onRemove={handleRemoveLevel}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    );
  };

  return (
    <div className="data-config">
      <div className="data-config-section">
        <div className="breakdown-levels">
          {breakdownLevels.length > 0 ? (
            <>
              <div className="breakdown-levels__header">
                <span className="breakdown-levels__title">DESGLOSE</span>
                <button
                  ref={refs.setReference}
                  className="breakdown-levels__add-button"
                  onClick={handleAddBreakdown}
                  {...getReferenceProps()}
                >
                  <Icon name="plus" size={12} /> Añadir
                </button>
              </div>
              {renderBreakdownLevels()}
            </>
          ) : (
            <button
              ref={refs.setReference}
              onClick={handleAddBreakdown}
              {...getReferenceProps()}
              className="breakdown-levels__placeholder breakdown-levels__placeholder--empty breakdown-levels__placeholder--clickable"
            >
              <div className="breakdown-levels__placeholder-content">
                <Icon
                  name="plus"
                  size={16}
                  className="breakdown-levels__placeholder-icon"
                />
                <p>Añadir desglose</p>
              </div>
            </button>
          )}
        </div>
        {renderDropdown()}
      </div>
    </div>
  );
};
