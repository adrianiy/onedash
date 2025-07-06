import React from "react";
import { type CheckboxItemProps } from "../types";

/**
 * Componente reutilizable para los elementos checkbox/radio del selector de métricas.
 * Permite hacer click en todo el elemento para seleccionar y muestra indicador
 * de valor por defecto si corresponde.
 * En modo single usa radio buttons, en modo multiple usa checkboxes.
 */
export const CheckboxItem: React.FC<CheckboxItemProps> = ({
  label,
  value,
  checked,
  onChange,
  disabled = false,
  hasDefaultTip = false,
  defaultTipText = "Valor por defecto",
  mode = "multiple",
  radioGroupName,
}) => {
  const handleClick = () => {
    if (!disabled) {
      if (mode === "single") {
        // En modo single, siempre seleccionar (como radio button)
        onChange(value, true);
      } else {
        // En modo multiple, toggle (como checkbox)
        onChange(value, !checked);
      }
    }
  };

  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (mode === "single") {
      // En modo single, siempre seleccionar
      onChange(value, true);
    } else {
      // En modo multiple, usar el valor del checkbox
      onChange(value, e.target.checked);
    }
  };

  return (
    <div
      className={`metric-selector__checkbox-item ${
        mode === "single" ? "metric-selector__radio-item" : ""
      }`}
      onClick={handleClick}
    >
      <input
        type={mode === "single" ? "radio" : "checkbox"}
        name={
          mode === "single"
            ? radioGroupName || "metric-selector-radio"
            : undefined
        }
        checked={checked}
        onChange={handleInputChange}
        onClick={handleInputClick}
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
