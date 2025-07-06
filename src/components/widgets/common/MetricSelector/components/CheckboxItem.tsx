import React from "react";
import { type CheckboxItemProps } from "../types";

/**
 * Componente reutilizable para los elementos checkbox del selector de métricas.
 * Permite hacer click en todo el elemento para seleccionar y muestra indicador
 * de valor por defecto si corresponde.
 */
export const CheckboxItem: React.FC<CheckboxItemProps> = ({
  label,
  value,
  checked,
  onChange,
  disabled = false,
  hasDefaultTip = false,
  defaultTipText = "Valor por defecto",
}) => {
  const handleClick = () => {
    if (!disabled) {
      onChange(value, !checked);
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
  };

  return (
    <div className="metric-selector__checkbox-item" onClick={handleClick}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(value, e.target.checked)}
        onClick={handleCheckboxClick}
        disabled={disabled}
      />
      <div className="metric-selector__option-content">
        <label>{label}</label>
        {hasDefaultTip && (
          <div className="metric-selector__default-tip">
            <span>{defaultTipText}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckboxItem;
