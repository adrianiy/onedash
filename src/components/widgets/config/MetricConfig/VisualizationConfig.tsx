import React, { useRef, useState } from "react";
import type {
  MetricWidget,
  ConditionalFormatRule,
} from "../../../../types/widget";
import { useWidgetStore } from "../../../../store/widgetStore";
import { ConfigDropdown } from "../../common/ConfigDropdown";
import { ConditionalFormatForm } from "../TableConfig/components/ConditionalFormatForm";
import { Icon } from "../../../common/Icon";
import { Tooltip } from "react-tooltip";

interface VisualizationConfigProps {
  widget: MetricWidget;
}

export const VisualizationConfig: React.FC<VisualizationConfigProps> = ({
  widget,
}) => {
  const { updateWidget } = useWidgetStore();
  const [editingFormat, setEditingFormat] =
    useState<ConditionalFormatRule | null>(null);
  const setDropdownOpenRef = useRef<((isOpen: boolean) => void) | null>(null);

  const currentSize = widget.config.size || "medium";
  const conditionalFormats =
    widget.config.visualization?.conditionalFormats || [];

  // Manejar cambio de tamaño
  const handleSizeChange = (size: "small" | "medium" | "large") => {
    updateWidget(widget.id, {
      config: {
        ...widget.config,
        size,
      },
    });
  };

  // Funciones para formatos condicionales
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
    updateWidget(widget.id, {
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

    updateWidget(widget.id, {
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
    updateWidget(widget.id, {
      config: {
        ...widget.config,
        visualization: {
          ...widget.config.visualization,
          conditionalFormats: updatedFormats,
        },
      },
    });
  };

  // Crear columnas simuladas para el formulario de formatos condicionales
  const availableColumns = [
    ...(widget.config.primaryMetric
      ? [
          {
            ...widget.config.primaryMetric,
            id: "primaryMetric",
            visible: true,
          },
        ]
      : []),
    ...(widget.config.secondaryMetric
      ? [
          {
            ...widget.config.secondaryMetric,
            id: "secondaryMetric",
            visible: true,
          },
        ]
      : []),
  ];

  const getConditionPreview = (
    condition: ConditionalFormatRule["condition"],
    value: string | number
  ) => {
    const conditionSymbols = {
      greater_than: ">",
      less_than: "<",
      equals: "=",
      contains: "⊇",
    };

    const symbol = conditionSymbols[condition] || "=";
    return `${symbol} ${value}`;
  };

  return (
    <div className="viz-config">
      {/* Configurador de métrica con placeholder visual */}
      <div className="viz-metric-configurator">
        {/* Preview de la métrica */}
        <div className="viz-metric-preview">
          <div
            className={`viz-metric-sample viz-metric-sample--${currentSize}`}
          >
            <div className="viz-metric-placeholder viz-metric-placeholder--primary">
              <div className="viz-metric-placeholder__value"></div>
              <div className="viz-metric-placeholder__label"></div>
            </div>
            {widget.config.secondaryMetric && (
              <div className="viz-metric-placeholder viz-metric-placeholder--secondary">
                <div className="viz-metric-placeholder__value"></div>
                <div className="viz-metric-placeholder__label"></div>
              </div>
            )}
          </div>
        </div>

        {/* Controles de tamaño */}
        <div className="viz-metric-controls viz-metric-controls--bottom">
          <button
            className={`viz-control-btn ${
              currentSize === "small" ? "viz-control-btn--active" : ""
            }`}
            onClick={() => handleSizeChange("small")}
            data-tooltip-id="metric-size-small-tooltip"
          >
            <Icon name="type" size={12} />
          </button>

          <button
            className={`viz-control-btn ${
              currentSize === "medium" ? "viz-control-btn--active" : ""
            }`}
            onClick={() => handleSizeChange("medium")}
            data-tooltip-id="metric-size-medium-tooltip"
          >
            <Icon name="type" size={16} />
          </button>

          <button
            className={`viz-control-btn ${
              currentSize === "large" ? "viz-control-btn--active" : ""
            }`}
            onClick={() => handleSizeChange("large")}
            data-tooltip-id="metric-size-large-tooltip"
          >
            <Icon name="type" size={20} />
          </button>
        </div>
      </div>

      {/* Sección de formatos condicionales - usando estilos de tabla */}
      {availableColumns.length > 0 && (
        <div className="viz-conditional-formats">
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
              columns={availableColumns}
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
      )}

      {/* Tooltips */}
      <Tooltip id="metric-size-small-tooltip" content="Tamaño pequeño" />
      <Tooltip id="metric-size-medium-tooltip" content="Tamaño mediano" />
      <Tooltip id="metric-size-large-tooltip" content="Tamaño grande" />
    </div>
  );
};
