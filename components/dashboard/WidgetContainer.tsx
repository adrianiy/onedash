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
import { WidgetFiltersDisplay } from "@/widgets/config/common";
import type { Widget } from "@/types/widget";
import type { DashboardLayout } from "@/types/dashboard";
import { generateId } from "@/utils/helpers";
import { findFirstFreePosition } from "@/utils/layoutUtils";

interface WidgetContainerProps {
  widget: Widget;
  isSelected?: boolean;
}

export const WidgetContainer: React.FC<WidgetContainerProps> = ({
  widget,
  isSelected = false,
}) => {
  const {
    isEditing,
    currentBreakpoint,
    selectWidget,
    openConfigSidebar,
    clearSelection,
  } = useUIStore();
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
      const originalLayout = dashboard.layouts[currentBreakpoint].find(
        (item: DashboardLayout) => item.i === widget._id
      );

      // Use original widget size or default values
      const widgetWidth = originalLayout?.w || 4;
      const widgetHeight = originalLayout?.h || 3;

      // Find the first free position for the copied widget
      const freePosition = findFirstFreePosition(
        dashboard.layouts[currentBreakpoint],
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
    // Para widgets de tipo "table" o "chart"
    if (
      (widget.type === "table" || widget.type === "chart") &&
      widget.config.widgetFilters
    ) {
      const widgetFilters = widget.config.widgetFilters;
      const visualization = widget.config.visualization || {};

      // Verificar si hay filtros configurados
      const hasWidgetFilters =
        widgetFilters &&
        ((widgetFilters.products && widgetFilters.products.length > 0) ||
          (widgetFilters.sections && widgetFilters.sections.length > 0) ||
          (widgetFilters.dateRange &&
            (widgetFilters.dateRange.start || widgetFilters.dateRange.end)));

      if (!hasWidgetFilters) return null;

      // Determinar el modo de visualización de filtros
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
        <WidgetFiltersDisplay
          filters={{
            products: widgetFilters.products,
            sections: widgetFilters.sections,
            dateRange: widgetFilters.dateRange
              ? {
                  start: widgetFilters.dateRange.start || undefined,
                  end: widgetFilters.dateRange.end || undefined,
                }
              : undefined,
          }}
          mode={filterDisplayMode}
          widgetId={widget._id}
          className="widget-filters-container"
          widgetType={widget.type}
        />
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
          const visualization = widget.config?.visualization || {};
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
