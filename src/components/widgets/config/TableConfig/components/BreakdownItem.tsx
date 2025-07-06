import React from "react";
import { Icon, type IconName } from "../../../../common/Icon";
import { useSortable } from "@dnd-kit/sortable";
import type { BreakdownOption } from "../../../../../types/breakdownLevels";

interface BreakdownItemProps {
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

export const BreakdownItem: React.FC<BreakdownItemProps> = ({
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
