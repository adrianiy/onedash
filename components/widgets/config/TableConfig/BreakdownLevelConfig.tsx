import React, { useState, useRef } from "react";
import type { Widget, TableWidgetConfig } from "@/types/widget";
import { ConfigDropdown } from "@/components/widgets/config/common/ui/ConfigDropdown";
import { EmptyPlaceholder } from "@/components/widgets/config/common/ui/EmptyPlaceholder";
import { Icon } from "@/common/Icon";
import { useWidgetStore } from "@/store/widgetStore";
import { breakdownCategories } from "@/types/breakdownLevels";
import { BreakdownItem } from "./components/BreakdownItem";
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

interface BreakdownLevelConfigProps {
  widget: Widget;
}

export const BreakdownLevelConfig: React.FC<BreakdownLevelConfigProps> = ({
  widget,
}) => {
  const tableConfig =
    widget.type === "table" ? widget.config : { breakdownLevels: [] };
  const breakdownLevels =
    (tableConfig as TableWidgetConfig).breakdownLevels || [];

  // Estado para el texto de búsqueda
  const [searchText, setSearchText] = useState("");

  // Referencia para controlar el estado del dropdown
  const setDropdownOpenRef = useRef<((isOpen: boolean) => void) | null>(null);

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

      useWidgetStore.getState().updateWidget(widget._id, {
        config: {
          ...widget.config,
          breakdownLevels: updatedLevels,
        },
      });
    }
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
        useWidgetStore.getState().updateWidget(widget._id, {
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

  // Filtrar categorías basado en el texto de búsqueda y opciones ya seleccionadas
  const filteredCategories = breakdownCategories
    .map((category) => ({
      ...category,
      options: category.options.filter((option) => {
        // Filtrar por búsqueda si hay texto
        const matchesSearch =
          !searchText ||
          option.name.toLowerCase().includes(searchText.toLowerCase());

        // Filtrar opciones ya seleccionadas
        const notAlreadySelected = !breakdownLevels.includes(option.id);

        return matchesSearch && notAlreadySelected;
      }),
    }))
    .filter((category) => category.options.length > 0);

  // Manejador para seleccionar una opción
  const handleSelectOption = (option: { id: string }) => {
    // Obtener niveles actuales o inicializar un array vacío
    const currentLevels = breakdownLevels || [];

    // Añadir el nuevo nivel si no existe ya
    if (!currentLevels.includes(option.id)) {
      const updatedLevels = [...currentLevels, option.id];

      if (widget.type === "table") {
        // Actualizar el widget asegurándose que tiene todas las propiedades requeridas
        useWidgetStore.getState().updateWidget(widget._id, {
          config: {
            ...widget.config,
            breakdownLevels: updatedLevels,
          },
        });

        // Cerrar el dropdown después de seleccionar
        if (setDropdownOpenRef.current) {
          setDropdownOpenRef.current(false);
        }
      }
    }
  };

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
          <div className="breakdown-levels-list config-panel__items-list">
            {breakdownLevels.map((levelId, index) => {
              const option = findOptionById(levelId);
              const category = findCategoryByOptionId(levelId);

              if (!option || !category) return null;

              return (
                <BreakdownItem
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
    <div
      className={`breakdown-levels config-panel ${
        breakdownLevels.length > 0 ? "config-panel--resizable" : ""
      }`}
    >
      <ConfigDropdown
        className="breakdown-dropdown"
        setIsOpenRef={setDropdownOpenRef}
        triggerElement={({ ref, onClick, referenceProps }) =>
          breakdownLevels.length > 0 ? (
            <>
              <div className="breakdown-levels__header config-panel__header">
                <span className="breakdown-levels__title config-panel__title">
                  DESGLOSE
                </span>
                <button
                  ref={ref}
                  className="breakdown-levels__add-button config-panel__add-button"
                  onClick={onClick}
                  {...referenceProps}
                >
                  <Icon name="plus" size={12} /> Añadir
                </button>
              </div>
              {renderBreakdownLevels()}
            </>
          ) : (
            <EmptyPlaceholder
              iconName="plus"
              text="Añadir desglose"
              onClick={onClick}
              referenceProps={referenceProps}
              forwardedRef={ref}
              className="breakdown-levels__placeholder config-panel__placeholder"
            />
          )
        }
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
                onClick={() => {
                  setSearchText("");
                  if (setDropdownOpenRef.current) {
                    setDropdownOpenRef.current(false);
                  }
                }}
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
      </ConfigDropdown>
    </div>
  );
};
