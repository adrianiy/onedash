import React from "react";
import type { MetricDefinition } from "../../../../../types/metricConfig";
import { Icon } from "../../../../common/Icon";
import { useSortable } from "@dnd-kit/sortable";

interface MetricItemProps {
  id: string;
  metric: MetricDefinition;
  type: "primary" | "secondary";
  onRemove: (type: "primary" | "secondary") => void;
  onEdit: (type: "primary" | "secondary") => void;
}

export const MetricItem: React.FC<MetricItemProps> = ({
  id,
  metric,
  type,
  onRemove,
  onEdit,
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

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(type);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(type);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`metric-item column-item config-item ${
        isDragging ? "column-item--dragging config-item--dragging" : ""
      }`}
    >
      <div className="metric-item__content column-item__content config-item__content">
        {/* Drag handle reutilizando clases existentes */}
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

        {/* Contenido principal */}
        <div className="column-item__main config-item__main">
          <div className="metric-item__info-container">
            <div className="column-item__name config-item__name">
              {metric.title}
            </div>
            {/* Badge específico para métricas debajo del título */}
            <div className="metric-item__badge-container">
              <span
                className={`metric-item__badge metric-item__badge--${type}`}
              >
                {type === "primary" ? "PRIMARIA" : "SECUNDARIA"}
              </span>
            </div>
          </div>
        </div>

        {/* Acciones reutilizando clases existentes */}
        <button
          onClick={handleEdit}
          className="column-item__visibility"
          title="Editar métrica"
        >
          <Icon name="edit" size={14} />
        </button>

        <button
          onClick={handleRemove}
          className="column-item__remove config-item__remove"
          title="Eliminar métrica"
        >
          <Icon name="trash" size={14} />
        </button>
      </div>
    </div>
  );
};
