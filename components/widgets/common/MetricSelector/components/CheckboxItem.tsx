import React from "react";
import { type CheckboxItemProps } from "../types";
import { Icon } from "../../../../common/Icon";

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
  icon,
  iconColor,
  isDynamic = false,
}) => {
  const handleClick = () => {
    if (!disabled) {
      if (mode === "single") {
        // En modo single, permitir deseleccionar si ya está seleccionado
        onChange(value, !checked);
      } else {
        // En modo multiple, toggle (como checkbox)
        onChange(value, !checked);
      }
    }
  };

  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    // En modo single, permitir que el input maneje su propio evento
    if (mode === "single") {
      e.stopPropagation();
      // Aplicar la misma lógica que en handleClick
      onChange(value, !checked);
    } else {
      e.stopPropagation();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Para mode múltiple, usar el valor del checkbox
    if (mode === "multiple") {
      onChange(value, e.target.checked);
    }
    // Para mode single, el comportamiento se maneja en handleInputClick
  };

  return (
    <div
      className={`metric-selector__checkbox-item ${
        mode === "single" ? "metric-selector__radio-item" : ""
      } ${isDynamic ? "metric-selector__dynamic-option" : ""}`}
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
        <label>
          {icon && (
            <Icon
              name={icon}
              size={14}
              color={iconColor}
              className="metric-selector__dynamic-icon"
            />
          )}
          {label}
        </label>
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
