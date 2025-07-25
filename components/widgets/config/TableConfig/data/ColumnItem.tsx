import React, { useState, useRef, useEffect } from "react";
import { Tooltip } from "react-tooltip";
import { Icon } from "@/common/Icon";
import { useSortable } from "@dnd-kit/sortable";
import type {
  MetricDefinition,
  MetricModifiers,
} from "@/types/metricConfig";
import {
  ModifiersMetadata,
  getDisplayTitle,
} from "@/types/metricConfig";
import { useVariableStore } from "@/store/variableStore";
import { TextInterpolationInput } from "@/common/TextInterpolationInput";

interface ColumnItemProps {
  id: string;
  index: number;
  column: MetricDefinition;
  isSelected: boolean;
  isVisible: boolean;
  onRemove: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onCopy: (id: string) => void;
  onEdit: (id: string) => void;
}

export const ColumnItem: React.FC<ColumnItemProps> = ({
  id,
  index,
  column,
  isSelected,
  isVisible,
  onRemove,
  onToggleVisibility,
  onToggleSelect,
  onRename,
  onCopy,
  onEdit,
}) => {
  // Obtener variables actuales del store
  const { variables } = useVariableStore();

  // Estados
  const [isEditing, setIsEditing] = useState(false);
  const [titleValue, setTitleValue] = useState(
    column.displayName || getDisplayTitle(column, variables)
  );
  const [isClosing, setIsClosing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isSavingRef = useRef(false);

  // Usar la función getDisplayTitle centralizada que maneja la prioridad correctamente
  const displayTitle = getDisplayTitle(column, variables);

  // Función para obtener la etiqueta de un modificador para mostrar en los chips
  const getModifierLabel = (
    modKey: string,
    modValue: string | number | boolean | MetricModifiers[keyof MetricModifiers]
  ): React.ReactNode => {
    if (!modValue) return "";

    const metadata =
      ModifiersMetadata[modKey as keyof typeof ModifiersMetadata];

    // Verificar si es un valor dinámico (variable binding)
    if (
      typeof modValue === "object" &&
      modValue !== null &&
      "type" in modValue &&
      (modValue as { type: string }).type === "variable"
    ) {
      const variableBinding = modValue as { type: "variable"; key: string };
      const resolvedValue = variables[variableBinding.key];

      let text = "Dinámico";
      if (resolvedValue !== undefined && resolvedValue !== null) {
        // Si tenemos metadatos, buscar la etiqueta correspondiente
        if (metadata) {
          const option = metadata.options.find(
            (opt) => opt.value === resolvedValue
          );
          text = option ? option.label : String(resolvedValue);
        } else {
          text = String(resolvedValue);
        }
      }

      return (
        <>
          <Icon name="zap" size={12} />
          {text}
        </>
      );
    }

    if (!metadata) return String(modValue);

    if (
      typeof modValue === "object" &&
      modValue !== null &&
      "type" in modValue &&
      "value" in modValue
    ) {
      // Caso especial para comparison con type a-n
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((modValue as any).type === "a-n") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return `Hace ${(modValue as any).value} años`;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return String((modValue as any).value);
    }

    // Buscar la opción correspondiente
    const option = metadata.options.find((opt) => opt.value === modValue);
    return option ? option.label : String(modValue);
  };

  // Función para obtener la etiqueta del indicador para mostrar en los chips
  const getIndicatorLabel = (): React.ReactNode => {
    // Si es dinámico, resolver con las variables actuales
    const isDynamic =
      typeof column.indicator === "object" &&
      column.indicator !== null &&
      "type" in column.indicator &&
      column.indicator.type === "variable";

    if (isDynamic) {
      const variableBinding = column.indicator as {
        type: "variable";
        key: string;
      };
      const resolvedIndicator = variables[variableBinding.key];
      const text = resolvedIndicator ? String(resolvedIndicator) : "Dinámico";

      return (
        <>
          <Icon name="zap" size={12} />
          {text}
        </>
      );
    }

    // Si es estático, buscar en los metadatos de indicadores
    // Por ahora usamos el valor directamente, pero se podría mapear a etiquetas amigables
    const text =
      typeof column.indicator === "string"
        ? column.indicator
        : String(column.indicator);

    return text;
  };

  // Función para verificar si el indicador es dinámico
  const isIndicatorDynamic = (): boolean => {
    return (
      typeof column.indicator === "object" &&
      column.indicator !== null &&
      "type" in column.indicator &&
      column.indicator.type === "variable"
    );
  };

  // Manejar clic en el botón de expandir/contraer
  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // Actualizar titleValue cuando cambien las variables (solo si no hay displayName personalizado)
  useEffect(() => {
    if (!column.displayName && !isEditing) {
      setTitleValue(getDisplayTitle(column, variables));
    }
  }, [variables, column, isEditing]);

  // Enfocar el input al entrar en modo edición
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Iniciar la edición
  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se propague el evento de clic
    setIsEditing(true);
  };

  // Manejar teclas especiales (Enter para guardar, Escape para cancelar)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // Marcar que estamos guardando para evitar interferencias
      isSavingRef.current = true;

      // Guardar cambios si el valor no está vacío
      if (titleValue.trim() !== "") {
        onRename(id, titleValue.trim());
      } else {
        setTitleValue(column.displayName || getDisplayTitle(column, variables));
      }
      setIsEditing(false);

      // Resetear la bandera después de un breve retraso
      setTimeout(() => {
        isSavingRef.current = false;
      }, 100);
    } else if (e.key === "Escape") {
      // Solo cancelar sin guardar cambios
      setTitleValue(column.displayName || getDisplayTitle(column, variables));
      setIsEditing(false);
    }
  };

  // Referencia al contenedor de edición para detectar clics fuera
  const containerRef = useRef<HTMLDivElement>(null);

  // Efecto para detectar clics fuera del componente
  useEffect(() => {
    if (!isEditing) return;

    const handleClickOutside = (e: MouseEvent) => {
      // Si está en modo edición, no está cerrándose ya, no estamos guardando, y se hace clic fuera del contenedor
      if (
        !isClosing &&
        !isSavingRef.current &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        // Restaurar el valor original y salir del modo edición
        setIsClosing(true);
        setTitleValue(column.displayName || getDisplayTitle(column, variables));
        setIsEditing(false);

        // Resetear la bandera después de un breve retraso
        setTimeout(() => {
          setIsClosing(false);
        }, 100);
      }
    };

    // Añadir event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Limpiar el event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing, column.title]);
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

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelect(id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`column-item config-item ${
        isDragging ? "column-item--dragging config-item--dragging" : ""
      } ${isSelected ? "column-item--selected" : ""} ${
        !isVisible ? "column-item--hidden" : ""
      }`}
      onClick={handleClick}
    >
      <div className="column-item__content config-item__content">
        <div
          {...attributes}
          {...listeners}
          className="column-item__grip-container config-item__grip-container"
        >
          <Icon
            name="grip-vertical"
            size={14}
            className="column-item__grip config-item__grip"
          />
        </div>

        <div className="column-item__index config-item__index">{index + 1}</div>

        <div className="column-item__main config-item__main">
          <div className="column-item__info config-item__info">
            {isEditing ? (
              <div
                ref={containerRef}
                className="column-item__name-edit-wrapper"
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="column-item__name-edit-container"
                  onClick={(e) => e.stopPropagation()}
                >
                  <TextInterpolationInput
                    value={titleValue}
                    onChange={setTitleValue}
                    onKeyDown={handleKeyDown}
                    variables={variables}
                    metric={column}
                    className="column-item__name-input"
                    autoFocus={true}
                  />
                  <div
                    className="column-item__name-actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="column-item__name-action"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Marcar que estamos guardando para evitar que otros eventos interfieran
                        isSavingRef.current = true;

                        if (titleValue.trim() !== "") {
                          onRename(id, titleValue.trim());
                        } else {
                          setTitleValue(
                            column.displayName ||
                              getDisplayTitle(column, variables)
                          );
                        }
                        setIsEditing(false);

                        // Restaurar la bandera después de un breve retraso
                        setTimeout(() => {
                          isSavingRef.current = false;
                        }, 100);
                      }}
                      data-tooltip-id={`column-action-tooltip-${id}`}
                      data-tooltip-content="Aceptar"
                    >
                      <Icon name="check" size={12} />
                    </button>
                    <button
                      className="column-item__name-action"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Marcar que estamos cancelando para evitar que otros eventos interfieran
                        isSavingRef.current = true;

                        setTitleValue(
                          column.displayName ||
                            getDisplayTitle(column, variables)
                        );
                        setIsEditing(false);

                        // Restaurar la bandera después de un breve retraso
                        setTimeout(() => {
                          isSavingRef.current = false;
                        }, 100);
                      }}
                      data-tooltip-id={`column-action-tooltip-${id}`}
                      data-tooltip-content="Cancelar"
                    >
                      <Icon name="close" size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="column-item__name config-item__name column-item__name--editable"
                onClick={handleTitleClick}
              >
                {displayTitle}
              </div>
            )}
          </div>
        </div>

        {!isEditing && (
          <>
            <button
              onClick={handleToggleExpand}
              className="column-item__expand"
              data-tooltip-id={`column-action-tooltip-${id}`}
              data-tooltip-content={
                isExpanded ? "Contraer detalles" : "Expandir detalles"
              }
            >
              <Icon
                name={isExpanded ? "chevrons-down-up" : "chevrons-up-down"}
                size={14}
              />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility(id);
              }}
              className="column-item__visibility"
              data-tooltip-id={`column-action-tooltip-${id}`}
              data-tooltip-content={
                isVisible ? "Ocultar columna" : "Mostrar columna"
              }
            >
              <Icon name={isVisible ? "eye" : "eye-off"} size={14} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopy(id);
              }}
              className="column-item__action"
              data-tooltip-id={`column-action-tooltip-${id}`}
              data-tooltip-content="Copiar columna"
            >
              <Icon name="copy" size={14} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(id);
              }}
              className="column-item__action"
              data-tooltip-id={`column-action-tooltip-${id}`}
              data-tooltip-content="Editar columna"
            >
              <Icon name="edit" size={14} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(id);
              }}
              className="column-item__remove config-item__remove"
              data-tooltip-id={`column-action-tooltip-${id}`}
              data-tooltip-content="Eliminar columna"
            >
              <Icon name="trash" size={14} />
            </button>
          </>
        )}
      </div>

      {/* Contenedor de chips expandible */}
      {!isEditing && (
        <div
          className={`column-item__chips-container ${
            isExpanded ? "column-item__chips-container--expanded" : ""
          }`}
        >
          <div className="column-item__chips-content">
            <div className="metric-selector__chip-modifiers">
              {/* Chip del indicador (siempre visible) */}
              <span
                className={`metric-selector__chip-tag metric-selector__chip-tag--indicator ${
                  isIndicatorDynamic()
                    ? "metric-selector__chip-tag--dynamic"
                    : ""
                }`}
                key={`${column.id}-indicator`}
              >
                {getIndicatorLabel()}
              </span>

              {/* Chips de modificadores */}
              {Object.entries(column.modifiers).map(([modKey, modValue]) =>
                modValue ? (
                  <span
                    className={`metric-selector__chip-tag metric-selector__chip-tag--${modKey} ${
                      typeof modValue === "object" &&
                      modValue !== null &&
                      "type" in modValue &&
                      (modValue as { type: string }).type === "variable"
                        ? "metric-selector__chip-tag--dynamic"
                        : ""
                    }`}
                    key={`${column.id}-${modKey}`}
                  >
                    {getModifierLabel(modKey, modValue)}
                  </span>
                ) : null
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tooltip único para esta columna */}
      <Tooltip id={`column-action-tooltip-${id}`} place="top" />
    </div>
  );
};
