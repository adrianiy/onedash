import React, { useState } from "react";
import { HexColorPicker } from "react-colorful";

interface CustomColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  onAccept?: (color: string) => void;
  onCancel?: () => void;
  label?: string;
}

// Paleta de colores predefinidos basada en las variables del sistema
const PRESET_COLORS = [
  // Transparente como primera opción
  "transparent", // Transparente

  // Colores del sistema
  "#3b82f6", // primary
  "#10b981", // success
  "#f59e0b", // warning
  "#ef4444", // danger
  "#06b6d4", // info
  "#6b7280", // secondary

  // Colores de widget
  "#60a5fa", // widget-table
  "#8b5cf6", // widget-text

  // Colores de chart
  "#5470c6", // chart-1
  "#91cc75", // chart-2
  "#fac858", // chart-3
  "#ee6666", // chart-4
  "#73c0de", // chart-5
  "#3ba272", // chart-6
  "#fc8452", // chart-7
  "#9a60b4", // chart-8

  // Neutrales y comunes
  "#000000", // Negro
  "#ffffff", // Blanco
  "#6b7280", // Gris
  "#1f2937", // Gris oscuro
];

export const CustomColorPicker: React.FC<CustomColorPickerProps> = ({
  value,
  onChange,
  onAccept,
  onCancel,
}) => {
  const [hexInput, setHexInput] = useState(value);

  const handlePresetClick = (color: string) => {
    onChange(color);
    setHexInput(color);
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setHexInput(newValue);

    // Validar formato hex o transparent
    if (
      /^#[0-9A-F]{6}$/i.test(newValue) ||
      newValue.toLowerCase() === "transparent"
    ) {
      onChange(newValue);
    }
  };

  const handleAdvancedChange = (color: string) => {
    onChange(color);
    setHexInput(color);
  };

  // Sincronizar hexInput cuando value cambie externamente
  React.useEffect(() => {
    setHexInput(value);
  }, [value]);

  return (
    <div className="custom-color-picker">
      {/* Color actual */}
      <div className="custom-color-picker__current">
        <div
          className="custom-color-picker__current-swatch"
          style={{ backgroundColor: value }}
        />
        <span className="custom-color-picker__current-value">{value}</span>
      </div>

      {/* Paleta de colores predefinidos */}
      <div className="custom-color-picker__presets">
        <div className="custom-color-picker__presets-grid">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              className={`custom-color-picker__preset ${
                value.toLowerCase() === color.toLowerCase()
                  ? "custom-color-picker__preset--selected"
                  : ""
              }`}
              style={{ backgroundColor: color }}
              onClick={() => handlePresetClick(color)}
              title={color}
              type="button"
            />
          ))}
        </div>
      </div>

      {/* Picker avanzado siempre visible */}
      <div className="custom-color-picker__advanced-content">
        <HexColorPicker
          color={value === "transparent" ? "#000000" : value}
          onChange={handleAdvancedChange}
        />
      </div>

      {/* Input hex manual */}
      <div className="custom-color-picker__hex-input">
        <input
          type="text"
          value={hexInput}
          onChange={handleHexInputChange}
          placeholder="#000000"
          className="custom-color-picker__hex-field"
        />
      </div>

      {/* Footer con botones de acción */}
      {(onAccept || onCancel) && (
        <div className="custom-color-picker__footer">
          {onCancel && (
            <button
              type="button"
              className="custom-color-picker__button custom-color-picker__button--cancel"
              onClick={onCancel}
            >
              Cancelar
            </button>
          )}
          {onAccept && (
            <button
              type="button"
              className="custom-color-picker__button custom-color-picker__button--accept"
              onClick={() => onAccept(value)}
            >
              Aceptar
            </button>
          )}
        </div>
      )}
    </div>
  );
};
