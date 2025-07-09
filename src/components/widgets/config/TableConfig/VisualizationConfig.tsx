import React, { useRef, useState } from "react";
import { Icon } from "../../../common/Icon";
import type { Widget, ConditionalFormatRule } from "../../../../types/widget";
import { useWidgetStore } from "../../../../store/widgetStore";
import { Tooltip } from "react-tooltip";
import { ConfigDropdown } from "../../common/ConfigDropdown";
import { ConditionalFormatForm } from "./components/ConditionalFormatForm";

interface VisualizationConfigProps {
  widget: Widget;
}

export const VisualizationConfig: React.FC<VisualizationConfigProps> = ({
  widget,
}) => {
  // Acceso al store para actualizar el widget
  const { updateWidget } = useWidgetStore();
  const [editingFormat, setEditingFormat] =
    useState<ConditionalFormatRule | null>(null);

  const setDropdownOpenRef = useRef<((isOpen: boolean) => void) | null>(null);

  const conditionalFormats =
    (widget.type === "table" &&
      widget.config.visualization?.conditionalFormats) ||
    [];

  // Asegurar que el widget es de tipo table y obtener su configuración
  if (widget.type !== "table") {
    return (
      <div className="table-config__placeholder">
        <Icon name="warning" size={32} />
        <span>Tipo de widget no compatible</span>
        <p>Esta configuración solo está disponible para widgets de tabla</p>
      </div>
    );
  }

  // Obtener valores actuales o valores predeterminados
  const visualization = widget.config.visualization || {};
  const showTitle = visualization.showTitle !== false;
  const isCompact = visualization.compact === true;
  const showBorders = visualization.showBorders !== false;
  const alternateRows = visualization.alternateRowColors === true;
  const showPagination = visualization.showPagination !== false;
  const showHeaderBackground = visualization.showHeaderBackground !== false;
  const textAlign = visualization.textAlign || "left";
  const totalRow = visualization.totalRow || "top";
  const filterDisplayMode = visualization.filterDisplayMode;

  // Verificar si hay filtros de widget configurados
  const widgetFilters = widget.config.widgetFilters;
  const hasWidgetFilters =
    widgetFilters &&
    ((widgetFilters.products && widgetFilters.products.length > 0) ||
      (widgetFilters.sections && widgetFilters.sections.length > 0) ||
      (widgetFilters.dateRange &&
        (widgetFilters.dateRange.start || widgetFilters.dateRange.end)));

  // Verificar si hay título para habilitar/deshabilitar la opción
  const hasTitleDisabled = !widget.title || widget.title.trim() === "";

  // Manejadores de eventos para actualizar configuración
  const handleToggleOption = (option: string, value: boolean) => {
    updateWidget(widget._id, {
      config: {
        ...widget.config,
        visualization: {
          ...visualization,
          [option]: value,
        },
      },
    });
  };

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

  const handleChangeAlignment = (alignment: "left" | "center" | "right") => {
    updateWidget(widget._id, {
      config: {
        ...widget.config,
        visualization: {
          ...visualization,
          textAlign: alignment,
        },
      },
    });
  };

  const handleChangeTotalRow = (position: "top" | "bottom" | "none") => {
    updateWidget(widget._id, {
      config: {
        ...widget.config,
        visualization: {
          ...visualization,
          totalRow: position,
        },
      },
    });
  };

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
          ...visualization,
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
          ...visualization,
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
          ...visualization,
          conditionalFormats: updatedFormats,
        },
      },
    });
  };

  return (
    <div className="viz-config">
      {/* Contenedor del visualizador de tabla */}
      <div className="viz-table-configurator">
        {/* Controles superiores */}
        <div className="viz-table-controls viz-table-controls--top">
          <div className="viz-control-with-label">
            <button
              className={`viz-control-btn ${
                showTitle ? "viz-control-btn--active" : ""
              } ${hasTitleDisabled ? "viz-control-btn--disabled" : ""}`}
              onClick={() =>
                !hasTitleDisabled && handleToggleOption("showTitle", !showTitle)
              }
              data-tooltip-id="viz-title-tooltip"
              disabled={hasTitleDisabled}
            >
              <Icon name={showTitle ? "type" : "type"} size={16} />
            </button>
            <span className="viz-control-label">Título</span>
          </div>

          <div className="viz-alignment-controls">
            <button
              className={`viz-control-btn ${
                textAlign === "left" ? "viz-control-btn--active" : ""
              }`}
              onClick={() => handleChangeAlignment("left")}
              data-tooltip-id="align-left-tooltip"
            >
              <Icon name="align-left" size={16} />
            </button>
            <button
              className={`viz-control-btn ${
                textAlign === "center" ? "viz-control-btn--active" : ""
              }`}
              onClick={() => handleChangeAlignment("center")}
              data-tooltip-id="align-center-tooltip"
            >
              <Icon name="align-center" size={16} />
            </button>
            <button
              className={`viz-control-btn ${
                textAlign === "right" ? "viz-control-btn--active" : ""
              }`}
              onClick={() => handleChangeAlignment("right")}
              data-tooltip-id="align-right-tooltip"
            >
              <Icon name="align-right" size={16} />
            </button>
          </div>
        </div>

        {/* Visualizador de tabla */}
        <div className="viz-table-preview">
          <table
            className={`viz-table-sample ${
              isCompact ? "viz-table-sample--compact" : ""
            } ${showBorders ? "viz-table-sample--bordered" : ""} ${
              alternateRows ? "viz-table-sample--alternating" : ""
            } ${
              !showHeaderBackground ? "viz-table-sample--no-header-bg" : ""
            } viz-table-sample--${textAlign}`}
          >
            <thead>
              <tr>
                <th>
                  <div className="viz-table-placeholder viz-table-placeholder--header viz-table-placeholder--medium"></div>
                </th>
                <th>
                  <div className="viz-table-placeholder viz-table-placeholder--header viz-table-placeholder--short"></div>
                </th>
                <th>
                  <div className="viz-table-placeholder viz-table-placeholder--header viz-table-placeholder--short"></div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="viz-table-placeholder viz-table-placeholder--long"></div>
                </td>
                <td>
                  <div className="viz-table-placeholder viz-table-placeholder--medium"></div>
                </td>
                <td>
                  <div className="viz-table-placeholder viz-table-placeholder--short"></div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="viz-table-placeholder viz-table-placeholder--medium"></div>
                </td>
                <td>
                  <div className="viz-table-placeholder viz-table-placeholder--short"></div>
                </td>
                <td>
                  <div className="viz-table-placeholder viz-table-placeholder--short"></div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="viz-table-placeholder viz-table-placeholder--long"></div>
                </td>
                <td>
                  <div className="viz-table-placeholder viz-table-placeholder--medium"></div>
                </td>
                <td>
                  <div className="viz-table-placeholder viz-table-placeholder--short"></div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="viz-table-placeholder viz-table-placeholder--medium"></div>
                </td>
                <td>
                  <div className="viz-table-placeholder viz-table-placeholder--short"></div>
                </td>
                <td>
                  <div className="viz-table-placeholder viz-table-placeholder--medium"></div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="viz-table-placeholder viz-table-placeholder--short"></div>
                </td>
                <td>
                  <div className="viz-table-placeholder viz-table-placeholder--long"></div>
                </td>
                <td>
                  <div className="viz-table-placeholder viz-table-placeholder--short"></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Controles laterales */}
        <div className="viz-table-controls viz-table-controls--right">
          <button
            className={`viz-control-btn ${
              showHeaderBackground ? "viz-control-btn--active" : ""
            }`}
            onClick={() =>
              handleToggleOption("showHeaderBackground", !showHeaderBackground)
            }
            data-tooltip-id="header-bg-tooltip"
          >
            <Icon name="table-row" size={16} />
          </button>

          <button
            className={`viz-control-btn ${
              alternateRows ? "viz-control-btn--active" : ""
            }`}
            onClick={() =>
              handleToggleOption("alternateRowColors", !alternateRows)
            }
            data-tooltip-id="alternate-tooltip"
          >
            <Icon name="table-striped" size={16} />
          </button>

          <button
            className={`viz-control-btn ${
              showBorders ? "viz-control-btn--active" : ""
            }`}
            onClick={() => handleToggleOption("showBorders", !showBorders)}
            data-tooltip-id="borders-tooltip"
          >
            <Icon name="border-grid" size={16} />
          </button>
        </div>

        {/* Controles inferiores */}
        <div className="viz-table-controls viz-table-controls--bottom">
          <div className="viz-control-with-label">
            <button
              className={`viz-control-btn ${
                showPagination ? "viz-control-btn--active" : ""
              }`}
              onClick={() =>
                handleToggleOption("showPagination", !showPagination)
              }
              data-tooltip-id="pagination-tooltip"
            >
              <Icon name="list-ordered" size={16} />
            </button>
            <span className="viz-control-label">Paginación</span>
          </div>
        </div>
      </div>

      {/* Contenedor de secciones de configuración */}
      <div className="viz-config-sections-container">
        {/* Sección de fila de total */}
        <div className="viz-config-section viz-total-row">
          <div className="viz-section-header viz-total-row-header">
            <h3 className="viz-section-title">Posición del Total</h3>
            <div className="viz-total-row-controls">
              <button
                className={`viz-control-btn ${
                  totalRow === "top" ? "viz-control-btn--active" : ""
                }`}
                onClick={() =>
                  handleChangeTotalRow(totalRow === "top" ? "none" : "top")
                }
                data-tooltip-id="total-top-tooltip"
              >
                <Icon name="panel-top" size={16} />
              </button>
              <button
                className={`viz-control-btn ${
                  totalRow === "bottom" ? "viz-control-btn--active" : ""
                }`}
                onClick={() =>
                  handleChangeTotalRow(
                    totalRow === "bottom" ? "none" : "bottom"
                  )
                }
                data-tooltip-id="total-bottom-tooltip"
              >
                <Icon name="panel-bottom" size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Sección de modo de visualización */}
        <div className="viz-config-section viz-display-mode">
          <div className="viz-section-header viz-display-mode-header">
            <h3 className="viz-section-title">Modo de Visualización</h3>
            <div className="viz-display-mode-controls">
              <button
                className={`viz-control-btn ${
                  !isCompact ? "viz-control-btn--active" : ""
                }`}
                onClick={() => handleToggleOption("compact", false)}
                data-tooltip-id="relaxed-mode-tooltip"
              >
                <Icon name="rows-3" size={16} />
              </button>
              <button
                className={`viz-control-btn ${
                  isCompact ? "viz-control-btn--active" : ""
                }`}
                onClick={() => handleToggleOption("compact", true)}
                data-tooltip-id="compact-mode-tooltip"
              >
                <Icon name="rows-4" size={16} />
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
                    filterDisplayMode === "info"
                      ? "viz-control-btn--active"
                      : ""
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

        {/* Sección de formatos condicionales */}
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
              columns={widget.config.columns}
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
      </div>

      {/* Tooltips */}
      <Tooltip id="viz-title-tooltip" content="Mostrar título en la tabla" />
      <Tooltip id="align-left-tooltip" content="Alinear a la izquierda" />
      <Tooltip id="align-center-tooltip" content="Centrar" />
      <Tooltip id="align-right-tooltip" content="Alinear a la derecha" />
      <Tooltip id="compact-mode-tooltip" content="Modo compacto" />
      <Tooltip id="relaxed-mode-tooltip" content="Modo relajado" />
      <Tooltip id="header-bg-tooltip" content="Fondo de cabecera" />
      <Tooltip id="alternate-tooltip" content="Filas alternadas" />
      <Tooltip id="borders-tooltip" content="Mostrar bordes" />
      <Tooltip id="pagination-tooltip" content="Mostrar paginación" />
      <Tooltip id="total-top-tooltip" content="Mostrar total arriba" />
      <Tooltip id="total-bottom-tooltip" content="Mostrar total abajo" />
      <Tooltip id="badges-mode-tooltip" content="Mostrar filtros como badges" />
      <Tooltip id="info-mode-tooltip" content="Mostrar filtros como icono" />
    </div>
  );
};
