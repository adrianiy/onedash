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
  const currentAlignment = widget.config.alignment || "center";
  const conditionalFormats =
    widget.config.visualization?.conditionalFormats || [];

  // Configuración de visualización
  const visualization = widget.config.visualization || {};
  const showTitle =
    visualization.showTitle !== undefined ? visualization.showTitle : false; // Por defecto false
  const filterDisplayMode = visualization.filterDisplayMode;

  // Verificar si hay título para habilitar/deshabilitar la opción
  const hasTitleDisabled = !widget.title || widget.title.trim() === "";

  // Verificar si hay filtros de widget configurados
  const widgetFilters = widget.config.widgetFilters;
  const hasWidgetFilters =
    widgetFilters &&
    ((widgetFilters.products && widgetFilters.products.length > 0) ||
      (widgetFilters.sections && widgetFilters.sections.length > 0) ||
      (widgetFilters.dateRange &&
        (widgetFilters.dateRange.start || widgetFilters.dateRange.end)));

  // Manejar cambio de tamaño
  const handleSizeChange = (size: "small" | "medium" | "large") => {
    updateWidget(widget._id, {
      config: {
        ...widget.config,
        size,
      },
    });
  };

  // Manejar cambio de alineación
  const handleAlignmentChange = (alignment: "left" | "center" | "right") => {
    updateWidget(widget._id, {
      config: {
        ...widget.config,
        alignment,
      },
    });
  };

  // Manejar toggle del título
  const handleToggleTitle = (show: boolean) => {
    updateWidget(widget._id, {
      config: {
        ...widget.config,
        visualization: {
          ...visualization,
          showTitle: show,
        },
      },
    });
  };

  // Manejar el modo de visualización de filtros
  const handleFilterDisplayMode = (mode: "badges" | "info") => {
    // Si clico en la opción ya activa, cambia a hidden
    // Si clico en otra opción, la activa
    // Si está en hidden, la activa
    let newMode: "badges" | "info" | "hidden" | undefined;

    if (mode === filterDisplayMode) {
      newMode = "hidden"; // Ocultar filtros si se clica en la opción activa
    } else {
      newMode = mode; // Activar la opción clicada
    }

    updateWidget(widget._id, {
      config: {
        ...widget.config,
        visualization: {
          ...visualization,
          filterDisplayMode: newMode,
        },
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
        {/* Controles superiores: título */}
        <div className="viz-metric-controls viz-metric-controls--top">
          <div className="viz-control-with-label">
            <button
              className={`viz-control-btn ${
                showTitle ? "viz-control-btn--active" : ""
              } ${hasTitleDisabled ? "viz-control-btn--disabled" : ""}`}
              onClick={() => !hasTitleDisabled && handleToggleTitle(!showTitle)}
              data-tooltip-id="metric-title-tooltip"
              disabled={hasTitleDisabled}
            >
              <Icon name="type" size={16} />
            </button>
            <span className="viz-control-label">Título</span>
          </div>
        </div>

        {/* Preview de la métrica */}
        <div className="viz-metric-preview">
          <div
            className={`viz-metric-sample viz-metric-sample--${currentSize}`}
          >
            <div className="viz-metric-placeholder viz-metric-placeholder--primary">
              <div className="viz-metric-placeholder__value"></div>
              <div className="viz-metric-placeholder__label"></div>
            </div>
          </div>
        </div>

        {/* Controles de tamaño y alineación */}
        <div className="viz-metric-controls viz-metric-controls--bottom">
          {/* Controles de tamaño */}
          <div className="viz-control-group">
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

          {/* Controles de alineación */}
          <div className="viz-control-group">
            <button
              className={`viz-control-btn ${
                currentAlignment === "left" ? "viz-control-btn--active" : ""
              }`}
              onClick={() => handleAlignmentChange("left")}
              data-tooltip-id="metric-align-left-tooltip"
            >
              <Icon name="align-left" size={14} />
            </button>

            <button
              className={`viz-control-btn ${
                currentAlignment === "center" ? "viz-control-btn--active" : ""
              }`}
              onClick={() => handleAlignmentChange("center")}
              data-tooltip-id="metric-align-center-tooltip"
            >
              <Icon name="align-center" size={14} />
            </button>

            <button
              className={`viz-control-btn ${
                currentAlignment === "right" ? "viz-control-btn--active" : ""
              }`}
              onClick={() => handleAlignmentChange("right")}
              data-tooltip-id="metric-align-right-tooltip"
            >
              <Icon name="align-right" size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Sección de visibilidad de filtros - Solo visible si hay filtros de widget */}
      {hasWidgetFilters && (
        <div className="viz-config-section viz-filters-display">
          <div className="viz-section-header viz-filters-display-header">
            <h3 className="viz-section-title">Visibilidad de Filtros</h3>
            <div className="viz-filters-display-controls">
              <button
                className={`viz-control-btn ${
                  filterDisplayMode === "badges"
                    ? "viz-control-btn--active"
                    : ""
                }`}
                onClick={() => handleFilterDisplayMode("badges")}
                data-tooltip-id="badges-mode-tooltip"
              >
                <Icon name="label" size={16} />
              </button>
              <button
                className={`viz-control-btn ${
                  filterDisplayMode === "info" ? "viz-control-btn--active" : ""
                }`}
                onClick={() => handleFilterDisplayMode("info")}
                data-tooltip-id="info-mode-tooltip"
              >
                <Icon name="filter" size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

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
      <Tooltip id="metric-title-tooltip" content="Mostrar título del widget" />
      <Tooltip id="metric-size-small-tooltip" content="Tamaño pequeño" />
      <Tooltip id="metric-size-medium-tooltip" content="Tamaño mediano" />
      <Tooltip id="metric-size-large-tooltip" content="Tamaño grande" />
      <Tooltip
        id="metric-align-left-tooltip"
        content="Alinear a la izquierda"
      />
      <Tooltip id="metric-align-center-tooltip" content="Alinear al centro" />
      <Tooltip id="metric-align-right-tooltip" content="Alinear a la derecha" />
      <Tooltip
        id="badges-mode-tooltip"
        content="Mostrar filtros como etiquetas"
      />
      <Tooltip id="info-mode-tooltip" content="Mostrar filtros como iconos" />
    </div>
  );
};
