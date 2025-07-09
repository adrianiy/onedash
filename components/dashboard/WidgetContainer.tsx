import React, { useState, useRef, useEffect } from "react";
import { useDashboardStore } from "../../store/dashboardStore";
import { useWidgetStore } from "../../store/widgetStore";
import { Tooltip } from "react-tooltip";
import { Icon } from "../common/Icon";
import {
  ChartWidget,
  MetricWidget,
  TableWidget,
  TextWidget,
  ErrorWidget,
} from "../widgets/render";
import type { Widget } from "../../types/widget";
import type { DashboardLayout } from "../../types/dashboard";

interface WidgetContainerProps {
  widget: Widget;
  isSelected?: boolean;
}

// Function to find the first available position in the grid
const findFirstFreePosition = (
  layout: DashboardLayout[],
  width: number,
  height: number,
  gridCols: number = 12
): { x: number; y: number } => {
  // Create a grid to track occupied positions
  const maxRows = Math.max(...layout.map((item) => item.y + item.h), 0);
  const grid: boolean[][] = Array(maxRows + height)
    .fill(false)
    .map(() => Array(gridCols).fill(false));

  // Mark occupied positions
  layout.forEach((item) => {
    for (let y = item.y; y < item.y + item.h; y++) {
      for (let x = item.x; x < item.x + item.w; x++) {
        if (grid[y] && grid[y][x] !== undefined) {
          grid[y][x] = true;
        }
      }
    }
  });

  // Find the first free position
  for (let y = 0; y < grid.length - height + 1; y++) {
    for (let x = 0; x <= gridCols - width; x++) {
      let canPlace = true;

      // Check if the widget can be placed at this position
      for (let dy = 0; dy < height && canPlace; dy++) {
        for (let dx = 0; dx < width && canPlace; dx++) {
          if (grid[y + dy] && grid[y + dy][x + dx]) {
            canPlace = false;
          }
        }
      }

      if (canPlace) {
        return { x, y };
      }
    }
  }

  // If no position is found, place at the bottom
  return { x: 0, y: maxRows };
};

export const WidgetContainer: React.FC<WidgetContainerProps> = ({
  widget,
  isSelected = false,
}) => {
  const {
    isEditing,
    selectWidget,
    openConfigSidebar,
    tempDashboard,
    updateTempDashboard,
    currentDashboard,
    updateDashboard,
  } = useDashboardStore();
  const { deleteWidget, addWidget } = useWidgetStore();
  const [showFloatingHeader, setShowFloatingHeader] = useState(false);
  const [isHiding, setIsHiding] = useState(false);
  const [isPinned, setIsPinned] = useState(true); // Pinned por defecto
  const [isTextEditing, setIsTextEditing] = useState(false); // Estado para edición de texto
  const hideTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleDelete = () => {
    if (isEditing && tempDashboard) {
      // En modo edición, solo eliminar el widget del dashboard temporal
      const updatedWidgets = tempDashboard.widgets.filter(
        (id) => id !== widget._id
      );
      const updatedLayout = tempDashboard.layout.filter(
        (item) => item.i !== widget._id
      );

      updateTempDashboard({
        widgets: updatedWidgets,
        layout: updatedLayout,
      });
    } else if (currentDashboard) {
      // Fuera de modo edición, eliminar el widget del dashboard actual y del store
      const updatedWidgets = currentDashboard.widgets.filter(
        (id) => id !== widget._id
      );
      const updatedLayout = currentDashboard.layout.filter(
        (item) => item.i !== widget._id
      );

      updateDashboard(currentDashboard._id, {
        widgets: updatedWidgets,
        layout: updatedLayout,
      });

      // También eliminar del store de widgets
      deleteWidget(widget._id);
    }
  };

  const handleCopy = () => {
    const newWidget = addWidget({
      type: widget.type,
      title: `${widget.title} (Copy)`,
      config: { ...widget.config },
    });

    // Add to current dashboard or temp dashboard if in editing mode
    const {
      currentDashboard,
      tempDashboard,
      isEditing,
      updateDashboard,
      updateTempDashboard,
      settings,
    } = useDashboardStore.getState();

    const targetDashboard = isEditing ? tempDashboard : currentDashboard;

    if (targetDashboard) {
      // Find the original widget in the layout to get its size
      const originalLayout = targetDashboard.layout.find(
        (item) => item.i === widget._id
      );

      // Use original widget size or default values
      const widgetWidth = originalLayout?.w || 4;
      const widgetHeight = originalLayout?.h || 3;

      // Find the first free position for the copied widget
      const freePosition = findFirstFreePosition(
        targetDashboard.layout,
        widgetWidth,
        widgetHeight,
        settings.gridCols
      );

      const newLayout = {
        i: newWidget._id,
        x: freePosition.x,
        y: freePosition.y,
        w: widgetWidth,
        h: widgetHeight,
      };

      if (isEditing) {
        // En modo edición, actualizar el dashboard temporal
        updateTempDashboard({
          widgets: [...targetDashboard.widgets, newWidget._id],
          layout: [...targetDashboard.layout, newLayout],
        });
      } else {
        // Fuera del modo edición, actualizar directamente
        updateDashboard(targetDashboard._id, {
          widgets: [...targetDashboard.widgets, newWidget._id],
          layout: [...targetDashboard.layout, newLayout],
        });
      }
    }
  };

  const handleEdit = () => {
    selectWidget(widget._id);
    openConfigSidebar();
  };

  const handleWidgetClick = (e: React.MouseEvent) => {
    // Solo manejar selección en modo edición
    if (isEditing) {
      e.stopPropagation(); // Evitar propagación para no interferir con grid layout
      if (!isSelected) {
        selectWidget(widget._id); // Seleccionar solo si no está ya seleccionado
      }
    }
  };

  const handleButtonMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const handleMouseEnter = () => {
    // Cancelar timeout si existe
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = undefined;
    }

    setShowFloatingHeader(true);
    setIsHiding(false);
  };

  const handleMouseLeave = () => {
    // Si el widget está seleccionado y no está pinned, aplicamos la transición con delay
    if (isSelected && !isPinned) {
      // Iniciar countdown para ocultar
      hideTimeoutRef.current = setTimeout(() => {
        setIsHiding(true);
        // Después de la transición, ocultar completamente
        setTimeout(() => {
          setShowFloatingHeader(false);
          setIsHiding(false);
        }, 400); // duración de la transición
      }, 1000); // 1 segundo de delay
    } else if (!isSelected) {
      // Si no está seleccionado, ocultar inmediatamente
      setShowFloatingHeader(false);
      setIsHiding(false);
    }
    // Si está pinned, no hacer nada al salir del widget
  };

  const handleTogglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsPinned(!isPinned);
  };

  // Handle text editing mode toggle
  const handleToggleTextEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsTextEditing(!isTextEditing);
  };

  // Limpiar el timeout cuando se desmonta el componente
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // Función para renderizar filtros de widget si existen
  const renderWidgetFilters = () => {
    // Solo tabla tiene filtros de widget por ahora
    if (widget.type === "table" && widget.config.widgetFilters) {
      const widgetFilters = widget.config.widgetFilters;
      // Indicador de que el widget tiene filtros propios
      const hasWidgetFilters =
        widgetFilters &&
        ((widgetFilters.products && widgetFilters.products.length > 0) ||
          (widgetFilters.sections && widgetFilters.sections.length > 0) ||
          (widgetFilters.dateRange &&
            (widgetFilters.dateRange.start || widgetFilters.dateRange.end)));

      if (!hasWidgetFilters) return null;

      const visualization = widget.config.visualization || {};
      // Tratamiento para el valor "hidden" y establecer "badges" por defecto
      let filterDisplayMode: "badges" | "info" | undefined;

      if (visualization.filterDisplayMode === "hidden") {
        // Si está explícitamente oculto, no mostrar nada
        filterDisplayMode = undefined;
      } else if (visualization.filterDisplayMode === undefined) {
        // Si no está configurado, usar "badges" por defecto
        filterDisplayMode = "badges";
      } else {
        // Usar el valor configurado (badges o info)
        filterDisplayMode = visualization.filterDisplayMode;
      }

      if (!filterDisplayMode) return null;

      return (
        <div className="widget-filters-container">
          {filterDisplayMode === "info" && (
            <div
              className="widget-filter-indicator"
              data-tooltip-id="widget-filters-tooltip"
              data-tooltip-content={`${
                widgetFilters?.products?.length
                  ? `Productos: ${widgetFilters.products.join(", ")}\n`
                  : ""
              }${
                widgetFilters?.sections?.length
                  ? `Secciones: ${widgetFilters.sections.join(", ")}\n`
                  : ""
              }${
                widgetFilters?.dateRange?.start || widgetFilters?.dateRange?.end
                  ? `Fechas: ${widgetFilters.dateRange.start || ""} - ${
                      widgetFilters.dateRange.end || ""
                    }`
                  : ""
              }`}
            >
              <Icon name="filter" size={12} />
            </div>
          )}

          {filterDisplayMode === "badges" && (
            <div className="widget-filter-badges">
              {widgetFilters?.dateRange?.start ||
              widgetFilters?.dateRange?.end ? (
                <span
                  className="widget-filter-badge widget-filter-badge--date"
                  data-tooltip-id="filter-date-tooltip"
                  data-tooltip-content={`Fechas: ${
                    widgetFilters.dateRange.start || ""
                  } - ${widgetFilters.dateRange.end || ""}`}
                >
                  <span>Fecha</span>
                </span>
              ) : null}

              {widgetFilters?.products && widgetFilters.products.length > 0 && (
                <span
                  className="widget-filter-badge widget-filter-badge--product"
                  data-tooltip-id="filter-products-tooltip"
                  data-tooltip-content={`Productos: ${widgetFilters.products.join(
                    ", "
                  )}`}
                >
                  <span>
                    {widgetFilters.products.length === 1
                      ? widgetFilters.products[0]
                      : `${widgetFilters.products.length} Productos`}
                  </span>
                </span>
              )}

              {widgetFilters?.sections && widgetFilters.sections.length > 0 && (
                <span
                  className="widget-filter-badge widget-filter-badge--section"
                  data-tooltip-id="filter-sections-tooltip"
                  data-tooltip-content={`Secciones: ${widgetFilters.sections.join(
                    ", "
                  )}`}
                >
                  <span>
                    {widgetFilters.sections.length === 1
                      ? widgetFilters.sections[0]
                      : `${widgetFilters.sections.length} Secciones`}
                  </span>
                </span>
              )}
            </div>
          )}

          {/* Tooltips para filtros */}
          <Tooltip
            id="widget-filters-tooltip"
            place="top"
            style={{ whiteSpace: "pre-line" }}
          />
          <Tooltip id="filter-date-tooltip" place="top" />
          <Tooltip id="filter-products-tooltip" place="top" />
          <Tooltip id="filter-sections-tooltip" place="top" />
        </div>
      );
    }
    return null;
  };

  const renderWidgetContent = () => {
    switch (widget.type) {
      case "chart":
        return <ChartWidget widget={widget} />;
      case "metric":
        return <MetricWidget widget={widget} />;
      case "table":
        return <TableWidget widget={widget} />;
      case "text":
        return (
          <TextWidget
            widget={widget}
            isTextEditing={isTextEditing}
            isSelected={isSelected}
          />
        );
      default:
        return <ErrorWidget />;
    }
  };

  return (
    <div
      className={`widget-container ${isSelected ? "widget-selected" : ""}`}
      onClick={handleWidgetClick}
      onMouseEnter={isEditing ? handleMouseEnter : undefined}
      onMouseLeave={isEditing ? handleMouseLeave : undefined}
    >
      {isEditing && (
        <div
          className={`floating-widget-header draggable-handle ${
            showFloatingHeader
              ? isHiding
                ? "floating-widget-header--hiding"
                : "floating-widget-header--visible"
              : ""
          }`}
        >
          <div className="floating-widget-title-section">
            <Icon name="grip-vertical" size={14} className="drag-icon" />
            <h4 className="floating-widget-title">{widget.title}</h4>
          </div>
          <div
            className="floating-widget-actions no-drag"
            onMouseDown={handleButtonMouseDown}
          >
            {isSelected && (
              <button
                className={`floating-action-btn pin ${
                  isPinned ? "active" : ""
                }`}
                onClick={handleTogglePin}
                onMouseDown={handleButtonMouseDown}
                data-tooltip-id="pin-tooltip"
                data-tooltip-content={
                  isPinned ? "Desanclar cabecera" : "Anclar cabecera"
                }
              >
                <Icon name={isPinned ? "pin" : "pin-off"} size={14} />
              </button>
            )}
            <button
              className="floating-action-btn copy"
              onClick={handleCopy}
              onMouseDown={handleButtonMouseDown}
              data-tooltip-id="copy-tooltip"
              data-tooltip-content="Copiar widget"
            >
              <Icon name="copy" size={14} />
            </button>
            {/* Para widgets de texto, mostrar botón de edición de texto en lugar del botón de edición normal */}
            {widget.type === "text" ? (
              <button
                className={`floating-action-btn text-edit ${
                  isTextEditing ? "active" : ""
                }`}
                onClick={handleToggleTextEdit}
                onMouseDown={handleButtonMouseDown}
                data-tooltip-id="text-edit-tooltip"
                data-tooltip-content={
                  isTextEditing ? "Salir de edición de texto" : "Editar texto"
                }
              >
                <Icon name="pen" size={14} />
              </button>
            ) : (
              <button
                className="floating-action-btn edit"
                onClick={handleEdit}
                onMouseDown={handleButtonMouseDown}
                data-tooltip-id="edit-widget-tooltip"
                data-tooltip-content="Editar widget"
              >
                <Icon name="edit" size={14} />
              </button>
            )}
            <button
              className="floating-action-btn delete"
              onClick={handleDelete}
              onMouseDown={handleButtonMouseDown}
              data-tooltip-id="delete-tooltip"
              data-tooltip-content="Eliminar widget"
            >
              <Icon name="trash" size={14} />
            </button>
          </div>

          {/* Tooltips */}
          <Tooltip id="pin-tooltip" place="bottom" />
          <Tooltip id="text-edit-tooltip" place="bottom" />
          <Tooltip id="copy-tooltip" place="bottom" />
          <Tooltip id="edit-widget-tooltip" place="bottom" />
          <Tooltip id="delete-tooltip" place="bottom" />
        </div>
      )}

      {/* Header del widget con título y filtros */}
      {(() => {
        // Para widgets de tabla, verificar la configuración de visualización
        if (widget.type === "table") {
          const visualization = widget.config.visualization || {};
          const showTitle = visualization.showTitle !== false;
          const filters = renderWidgetFilters();
          const hasFilters =
            !!filters && widget.config.visualization?.filterDisplayMode;

          if ((widget.title && showTitle) || hasFilters) {
            return (
              <div className="widget-header-container">
                {widget.title && showTitle && (
                  <h4 className="widget-title">{widget.title}</h4>
                )}
                {hasFilters && filters}
              </div>
            );
          }
          return null;
        }

        // Para widgets de métrica, verificar la configuración de visualización
        if (widget.type === "metric") {
          const visualization = widget.config.visualization || {};
          const showTitle =
            visualization.showTitle !== undefined
              ? visualization.showTitle
              : false; // Por defecto false

          return widget.title && showTitle ? (
            <div className="widget-header-container">
              <h4 className="widget-title">{widget.title}</h4>
            </div>
          ) : null;
        }

        // Para otros tipos de widgets, mostrar el título si existe
        return widget.title ? (
          <div className="widget-header-container">
            <h4 className="widget-title">{widget.title}</h4>
          </div>
        ) : null;
      })()}

      <div className="widget-content">{renderWidgetContent()}</div>
    </div>
  );
};
