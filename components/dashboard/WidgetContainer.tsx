import React, { useState, useRef, useEffect } from "react";
import { useUIStore } from "@/store/uiStore";
import { useGridStore } from "@/store/gridStore";
import { Tooltip } from "react-tooltip";
import { Icon } from "@/common/Icon";
import {
  ChartWidget,
  MetricWidget,
  TableWidget,
  TextWidget,
  ErrorWidget,
} from "@/widgets/render";
import type { Widget } from "@/types/widget";
import type { DashboardLayout } from "@/types/dashboard";
import { generateId } from "@/utils/helpers";

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
  const { isEditing, selectWidget, openConfigSidebar, clearSelection } =
    useUIStore();
  const { dashboard, addWidget, removeWidget } = useGridStore();
  const [showFloatingHeader, setShowFloatingHeader] = useState(false);
  const [isHiding, setIsHiding] = useState(false);
  const [isPinned, setIsPinned] = useState(true); // Pinned por defecto
  const [isTextEditing, setIsTextEditing] = useState(false); // Estado para edición de texto
  const hideTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleDelete = () => {
    if (dashboard) {
      // Eliminar el widget del GridStore (automáticamente actualiza layout y lista de widgets)
      removeWidget(widget._id);
    }

    // Limpiar la selección si el widget eliminado está seleccionado
    clearSelection();
  };

  const handleCopy = () => {
    if (dashboard) {
      // Find the original widget in the layout to get its size
      const originalLayout = dashboard.layout.find(
        (item: DashboardLayout) => item.i === widget._id
      );

      // Use original widget size or default values
      const widgetWidth = originalLayout?.w || 4;
      const widgetHeight = originalLayout?.h || 3;

      // Find the first free position for the copied widget
      const freePosition = findFirstFreePosition(
        dashboard.layout,
        widgetWidth,
        widgetHeight,
        12 // Usar un valor por defecto para gridCols
      );

      // Crear una copia del widget con el nuevo store
      // El layout no se pasa directamente al widget, sino que se actualizará
      // a través del dashboard en el gridStore
      const newWidgetData = {
        type: widget.type,
        title: `${widget.title} (Copy)`,
        config: { ...widget.config },
        dashboardId: dashboard._id,
        _id: generateId(),
        ...freePosition,
      };

      const newLayout = {
        i: newWidgetData._id,
        ...freePosition,
      };

      // Añadir el nuevo widget al store, que automáticamente actualiza el dashboard
      addWidget(newWidgetData as Widget, newLayout as DashboardLayout);
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

  // Handle exit text editing mode
  const handleExitTextEditing = () => {
    setIsTextEditing(false);
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
      } else if (visualization) {
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
        return <TextWidget widget={widget} isTextEditing={isTextEditing} />;
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
      {isTextEditing && (
        <button
          className="text-widget__floating-button"
          onClick={handleExitTextEditing}
          aria-label="Exit editing mode"
          title="Salir del modo edición"
        >
          <Icon name="check" size={16} />
        </button>
      )}
      {isEditing && !isTextEditing && (
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
                  !isPinned ? "active" : ""
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

        // Para widgets de gráfico, verificar la configuración de visualización
        if (widget.type === "chart") {
          const visualization = widget.config.visualization || {};
          const showTitle = visualization.showTitle !== false;

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

      {renderWidgetContent()}
    </div>
  );
};
