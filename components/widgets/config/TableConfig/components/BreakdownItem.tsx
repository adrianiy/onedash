import React from "react";
import { Tooltip } from "react-tooltip";
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
      className={`breakdown-level config-item ${
        isDragging ? "breakdown-level--dragging config-item--dragging" : ""
      }`}
    >
      <div className="breakdown-level__content config-item__content">
        <div
          {...attributes}
          {...listeners}
          className="breakdown-level__grip-container config-item__grip-container"
        >
          <Icon
            name="grip-vertical"
            size={14}
            className="breakdown-level__grip config-item__grip"
          />
        </div>

        <div className="breakdown-level__index config-item__index">
          {index + 1}
        </div>

        <div className="breakdown-level__main config-item__main">
          <div className="breakdown-level__info config-item__info">
            <div
              className={`breakdown-level__icon-container breakdown-level__icon-container--${category.color}`}
            >
              <Icon
                name={category.icon}
                size={14}
                className={`breakdown-level__icon breakdown-level__icon--${category.color}`}
              />
            </div>
            <div className="breakdown-level__name config-item__name">
              {option.name}
            </div>
          </div>
        </div>

        <button
          onClick={() => onRemove(id)}
          className="breakdown-level__remove config-item__remove"
          data-tooltip-id={`breakdown-tooltip-${id}`}
          data-tooltip-content="Eliminar nivel"
        >
          <Icon name="trash" size={14} />
        </button>

        {/* Tooltip para este breakdown item */}
        <Tooltip id={`breakdown-tooltip-${id}`} place="top" />
      </div>
    </div>
  );
};
