import React, { useRef, useState } from "react";
import type {
  ConditionalFormatRule,
  ChartWidget,
  MetricWidget,
  TableWidget,
} from "@/types/widget";
import type { MetricDefinition } from "@/types/metricConfig";
import { useWidgetStore } from "@/store/widgetStore";
import { ConfigDropdown } from "../ui/ConfigDropdown";
import { ConditionalFormatForm } from "@/config/TableConfig/components/ConditionalFormatForm";
import { Icon } from "@/common/Icon";

interface ConditionalFormatsControlProps {
  widget: ChartWidget | MetricWidget | TableWidget;
  columns: MetricDefinition[];
  conditionalFormats: ConditionalFormatRule[];
}

export const ConditionalFormatsControl: React.FC<
  ConditionalFormatsControlProps
> = ({ widget, columns, conditionalFormats }) => {
  const { updateWidget } = useWidgetStore();
  const [editingFormat, setEditingFormat] =
    useState<ConditionalFormatRule | null>(null);
  const setDropdownOpenRef = useRef<((isOpen: boolean) => void) | null>(null);

  // Solo mostrar si hay columnas disponibles
  if (!columns || columns.length === 0) {
    return null;
  }

  const getConditionPreview = (
    condition: ConditionalFormatRule["condition"],
    value: string | number
  ) => {
    const conditionSymbols: {
      [key in ConditionalFormatRule["condition"]]: string;
    } = {
      greater_than: ">",
      less_than: "<",
      equals: "=",
      contains: "⊇",
    };

    const symbol = conditionSymbols[condition] || "=";
    return `${symbol} ${value}`;
  };

  const handleCloseForm = () => {
    setEditingFormat(null);
    if (setDropdownOpenRef.current) {
      setDropdownOpenRef.current(false);
    }
  };

  const handleEditFormat = (format: ConditionalFormatRule) => {
    setEditingFormat(format);
    if (setDropdownOpenRef.current) {
      setDropdownOpenRef.current(true);
    }
  };

  const handleToggleFormat = (formatId: string) => {
    const updatedFormats = conditionalFormats.map((f) =>
      f.id === formatId ? { ...f, isEnabled: !f.isEnabled } : f
    );
    updateWidget(widget._id, {
      config: {
        ...widget.config,
        visualization: {
          ...widget.config.visualization,
          conditionalFormats: updatedFormats,
        },
      },
    });
  };

  const handleSaveFormat = (
    formatData: Omit<ConditionalFormatRule, "id" | "isEnabled">
  ) => {
    let updatedFormats;
    if (editingFormat) {
      // Update existing format
      updatedFormats = conditionalFormats.map((f) =>
        f.id === editingFormat.id
          ? { ...editingFormat, ...formatData, style: formatData.style }
          : f
      );
    } else {
      // Add new format
      const newFormat = {
        ...formatData,
        id: `format-${Date.now()}`,
        isEnabled: true,
      };
      updatedFormats = [...conditionalFormats, newFormat];
    }

    updateWidget(widget._id, {
      config: {
        ...widget.config,
        visualization: {
          ...widget.config.visualization,
          conditionalFormats: updatedFormats,
        },
      },
    });

    handleCloseForm();
  };

  const removeConditionalFormat = (formatId: string) => {
    const updatedFormats = conditionalFormats.filter((f) => f.id !== formatId);
    updateWidget(widget._id, {
      config: {
        ...widget.config,
        visualization: {
          ...widget.config.visualization,
          conditionalFormats: updatedFormats,
        },
      },
    });
  };

  return (
    <div className="viz-config-section viz-conditional-formats">
      <ConfigDropdown
        className="conditional-format-dropdown"
        setIsOpenRef={setDropdownOpenRef}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setEditingFormat(null);
          }
        }}
        triggerElement={({ ref, onClick, referenceProps }) => (
          <div className="viz-section-header viz-conditional-formats-header">
            <h3 className="viz-section-title">Formatos condicionales</h3>
            <button
              ref={ref}
              className="viz-add-button"
              onClick={() => {
                setEditingFormat(null);
                onClick();
              }}
              {...referenceProps}
            >
              <Icon name="plus" size={14} /> Añadir formato
            </button>
          </div>
        )}
      >
        <ConditionalFormatForm
          columns={columns}
          onSave={handleSaveFormat}
          onClose={handleCloseForm}
          initialData={editingFormat}
        />
      </ConfigDropdown>

      {conditionalFormats.length > 0 && (
        <ul className="viz-formats-list">
          {conditionalFormats.map((format) => (
            <li
              key={format.id}
              className={`format-rule-chip ${
                !format.isEnabled ? "format-rule-chip--disabled" : ""
              }`}
            >
              <div className="format-preview">
                <div
                  className="format-preview__sample"
                  style={{
                    backgroundColor: format.style.backgroundColor,
                    color: format.style.textColor,
                    fontWeight: format.style.fontWeight,
                    fontStyle: format.style.fontStyle,
                  }}
                >
                  {getConditionPreview(format.condition, format.value)}
                </div>
              </div>
              <div className="format-description">
                <span className="format-rule">{format.columnName}</span>
              </div>
              <div className="format-actions">
                <button
                  onClick={() => handleEditFormat(format)}
                  className="format-action-btn format-action-btn--edit"
                  title="Editar"
                >
                  <Icon name="edit" size={16} />
                </button>
                <button
                  onClick={() => handleToggleFormat(format.id)}
                  className="format-toggle-btn"
                  title={format.isEnabled ? "Desactivar" : "Activar"}
                >
                  <div
                    className={`format-toggle ${
                      format.isEnabled ? "format-toggle--active" : ""
                    }`}
                  >
                    <div className="format-toggle__slider"></div>
                  </div>
                </button>
                <button
                  onClick={() => removeConditionalFormat(format.id)}
                  className="format-action-btn format-action-btn--danger"
                  title="Eliminar"
                >
                  <Icon name="trash" size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
