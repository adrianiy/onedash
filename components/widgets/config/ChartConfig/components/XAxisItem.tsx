import React from "react";
import { Icon } from "@/common/Icon";
import type {
  BreakdownOption,
  BreakdownCategory,
} from "@/types/breakdownLevels";

interface XAxisItemProps {
  option: BreakdownOption;
  category: BreakdownCategory;
  onRemove: (id: string) => void;
}

export const XAxisItem: React.FC<XAxisItemProps> = ({
  option,
  category,
  onRemove,
}) => {
  return (
    <div className="xaxis-item config-item">
      <div className="xaxis-item__content config-item__content">
        <div
          className={`xaxis-item__icon-container xaxis-item__icon-container--${category.color}`}
        >
          <Icon
            name={category.icon}
            size={14}
            className={`xaxis-item__icon--${category.color}`}
          />
        </div>
        <div className="xaxis-item__name config-item__name">{option.name}</div>
        <button
          onClick={() => onRemove(option.id)}
          className="xaxis-item__remove config-item__remove"
          title="Eliminar dimensión"
        >
          <Icon name="trash" size={14} />
        </button>
      </div>
    </div>
  );
};
