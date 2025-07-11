import React, { useState, useEffect } from "react";
import type { ConditionalFormatRule } from "@/types/widget";
import type { MetricDefinition } from "@/types/metricConfig";
import { Icon } from "@/common/Icon";
import { CustomSelect } from "@/common/CustomSelect";
import type { SelectOption } from "@/common/CustomSelect";
import { CustomColorPicker } from "@/common/CustomColorPicker";
import { ConfigDropdown } from "@/components/widgets/config/common/ui/ConfigDropdown";
import { Tooltip } from "react-tooltip";

interface ConditionalFormatFormProps {
  columns: (MetricDefinition & { visible?: boolean })[];
  onSave: (newFormat: Omit<ConditionalFormatRule, "id" | "isEnabled">) => void;
  onClose: () => void;
  initialData?: ConditionalFormatRule | null;
}

const conditionOptions: SelectOption[] = [
  { value: "less_than", label: "Menor que" },
  { value: "greater_than", label: "Mayor que" },
  { value: "equals", label: "Igual a" },
  { value: "contains", label: "Contiene" },
];

export const ConditionalFormatForm: React.FC<ConditionalFormatFormProps> = ({
  columns,
  onSave,
  onClose,
  initialData,
}) => {
  const [columnId, setColumnId] = useState(
    initialData?.columnId || columns[0]?.id || ""
  );
  const [condition, setCondition] = useState<
    ConditionalFormatRule["condition"]
  >(initialData?.condition || "greater_than");
  const [value, setValue] = useState<string | number>(initialData?.value || "");
  const [backgroundColor, setBackgroundColor] = useState(
    initialData?.style.backgroundColor || "transparent"
  );
  const [textColor, setTextColor] = useState(
    initialData?.style.textColor || "#000000"
  );
  const [isBold, setIsBold] = useState(
    initialData?.style.fontWeight === "bold"
  );
  const [isItalic, setIsItalic] = useState(
    initialData?.style.fontStyle === "italic"
  );
  const [errors, setErrors] = useState<{
    columnId?: boolean;
    value?: boolean;
  }>({});

  useEffect(() => {
    if (initialData) {
      setColumnId(initialData.columnId);
      setCondition(initialData.condition);
      setValue(initialData.value);
      setBackgroundColor(initialData.style.backgroundColor);
      setTextColor(initialData.style.textColor);
      setIsBold(initialData.style.fontWeight === "bold");
      setIsItalic(initialData.style.fontStyle === "italic");
    } else {
      // Si no hay datos iniciales, usar los valores por defecto
      const style = getComputedStyle(document.documentElement);
      const textColorValue = style
        .getPropertyValue("--color-text-primary")
        .trim();
      setBackgroundColor("transparent"); // Transparente por defecto
      setTextColor(textColorValue);
      setIsBold(false);
      setIsItalic(false);
      setValue("");
      setColumnId(columns[0]?.id || "");
    }
  }, [initialData, columns]);

  const validateForm = () => {
    const newErrors: { columnId?: boolean; value?: boolean } = {};

    if (!columnId) {
      newErrors.columnId = true;
    }

    if (!value || value.toString().trim() === "") {
      newErrors.value = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const selectedColumn = columns.find((c) => c.id === columnId);

    onSave({
      columnId,
      columnName: selectedColumn?.title || "N/A",
      condition,
      value,
      style: {
        backgroundColor,
        textColor,
        fontWeight: isBold ? "bold" : "normal",
        fontStyle: isItalic ? "italic" : "normal",
      },
    });
  };

  // Limpiar errores cuando los campos cambien
  const handleColumnChange = (newValue: string) => {
    setColumnId(newValue);
    if (errors.columnId) {
      setErrors((prev) => ({ ...prev, columnId: false }));
    }
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (errors.value) {
      setErrors((prev) => ({ ...prev, value: false }));
    }
  };

  // Crear opciones para el select de columnas
  const columnOptions: SelectOption[] = columns.map((col) => ({
    value: col.id,
    label: col.title,
  }));

  return (
    <div className="conditional-format-form">
      <div className="form-header">
        <h4>{initialData ? "Editar Regla" : "Nueva Regla de Formato"}</h4>
        <button onClick={onClose} className="close-button">
          <Icon name="close" size={16} />
        </button>
      </div>
      <div className="form-body">
        <div
          className={`form-group ${errors.columnId ? "form-group--error" : ""}`}
        >
          <label>
            Columna {errors.columnId && <span className="error-text">*</span>}
          </label>
          <CustomSelect
            options={columnOptions}
            value={columnId}
            onChange={handleColumnChange}
            placeholder="Seleccionar columna..."
            className={errors.columnId ? "error" : ""}
          />
          {errors.columnId && (
            <span className="error-message">
              <Icon name="alert-circle" size={12} />
              Selecciona una columna
            </span>
          )}
        </div>
        <div className="form-group">
          <label>Condición</label>
          <CustomSelect
            options={conditionOptions}
            value={condition}
            onChange={(value) =>
              setCondition(value as ConditionalFormatRule["condition"])
            }
            placeholder="Seleccionar condición..."
          />
        </div>
        <div
          className={`form-group ${errors.value ? "form-group--error" : ""}`}
        >
          <label>
            Valor {errors.value && <span className="error-text">*</span>}
          </label>
          <input
            type="text"
            value={value}
            onChange={handleValueChange}
            className={errors.value ? "error" : ""}
            placeholder="Ingresa un valor..."
          />
          {errors.value && (
            <span className="error-message">
              <Icon name="alert-circle" size={12} />
              Ingresa un valor para la comparación
            </span>
          )}
        </div>
        <div className="form-group">
          <label className="form-group__header">Formato</label>
          <div className="form-group--styling">
            <ConfigDropdown
              className="color-picker-dropdown"
              placement="top"
              usePortal={true}
              triggerElement={({ ref, onClick, referenceProps }) => (
                <button
                  ref={ref}
                  className="style-button"
                  onClick={onClick}
                  data-tooltip-id="bg-color-tooltip"
                  data-tooltip-content="Color de fondo"
                  type="button"
                  {...referenceProps}
                >
                  <Icon name="paint-bucket" size={16} />
                  <div
                    className="color-indicator"
                    style={{ backgroundColor: backgroundColor }}
                  />
                </button>
              )}
            >
              <CustomColorPicker
                value={backgroundColor}
                onChange={setBackgroundColor}
              />
            </ConfigDropdown>

            <ConfigDropdown
              className="color-picker-dropdown"
              placement="top"
              usePortal={true}
              triggerElement={({ ref, onClick, referenceProps }) => (
                <button
                  ref={ref}
                  className="style-button"
                  onClick={onClick}
                  data-tooltip-id="text-color-tooltip"
                  data-tooltip-content="Color de texto"
                  type="button"
                  {...referenceProps}
                >
                  <Icon name="type" size={16} />
                  <div
                    className="color-indicator"
                    style={{ backgroundColor: textColor }}
                  />
                </button>
              )}
            >
              <CustomColorPicker value={textColor} onChange={setTextColor} />
            </ConfigDropdown>

            <button
              className={`style-button ${isBold ? "style-button--active" : ""}`}
              onClick={() => setIsBold(!isBold)}
              data-tooltip-id="bold-tooltip"
              data-tooltip-content="Negrita"
              type="button"
            >
              <Icon name="bold" size={16} />
            </button>
            <button
              className={`style-button ${
                isItalic ? "style-button--active" : ""
              }`}
              onClick={() => setIsItalic(!isItalic)}
              data-tooltip-id="italic-tooltip"
              data-tooltip-content="Cursiva"
              type="button"
            >
              <Icon name="italic" size={16} />
            </button>
          </div>
        </div>
      </div>
      <div className="form-footer">
        <button onClick={handleSave} className="save-button">
          {initialData ? "Guardar Cambios" : "Guardar Regla"}
        </button>
      </div>

      {/* Tooltips */}
      <Tooltip id="bg-color-tooltip" />
      <Tooltip id="text-color-tooltip" />
      <Tooltip id="bold-tooltip" />
      <Tooltip id="italic-tooltip" />
    </div>
  );
};
