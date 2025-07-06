import React, { useState, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";
import { useDashboardStore } from "../../store/dashboardStore";
import { useWidgetStore } from "../../store/widgetStore";
import { Icon } from "../common/Icon";
import { TableConfig } from "../widgets/config/TableConfig";

export const WidgetConfigSidebar: React.FC = () => {
  const {
    selectedWidgetId,
    isEditing,
    isConfigSidebarOpen,
    closeConfigSidebar,
  } = useDashboardStore();
  const { getWidget, updateWidget } = useWidgetStore();

  // Estados para la edición del título
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editableTitle, setEditableTitle] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Usar useEffect antes de cualquier return condicional
  useEffect(() => {
    if (selectedWidgetId) {
      const currentWidget = getWidget(selectedWidgetId);
      if (currentWidget) {
        setEditableTitle(currentWidget.title || "");
      }
    }
  }, [selectedWidgetId, getWidget]);

  // Solo mostrar el sidebar si hay un widget seleccionado, estamos en modo edición y el sidebar debe estar abierto
  if (!selectedWidgetId || !isEditing || !isConfigSidebarOpen) {
    return null;
  }

  const widget = getWidget(selectedWidgetId);
  if (!widget) {
    return null;
  }

  const handleClose = () => {
    closeConfigSidebar();
  };

  const getWidgetIcon = (type: string) => {
    switch (type) {
      case "table":
        return "table";
      case "chart":
        return "bar-chart";
      case "metric":
        return "target";
      case "text":
        return "edit";
      default:
        return "settings";
    }
  };

  // Obtener el título del widget o un valor predeterminado
  const getWidgetTitle = () => {
    if (widget.title) {
      return widget.title;
    }

    // Si no hay título, mostrar un valor predeterminado según el tipo
    switch (widget.type) {
      case "table":
        return "Nueva Tabla";
      case "chart":
        return "Nuevo Gráfico";
      case "metric":
        return "Nueva Métrica";
      case "text":
        return "Nuevo Texto";
      default:
        return "Nuevo Widget";
    }
  };

  // Función para comenzar a editar el título
  const handleEditTitle = () => {
    setIsEditingTitle(true);
    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 50);
  };

  // Función para guardar el título
  const saveTitle = () => {
    if (widget) {
      updateWidget(widget.id, { title: editableTitle });
      setIsEditingTitle(false);
    }
  };

  // Manejar teclas presionadas en el input
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      saveTitle();
    } else if (e.key === "Escape") {
      setEditableTitle(widget.title || "");
      setIsEditingTitle(false);
    }
  };

  // Comprobar si hay TANTO columnas COMO niveles de desglose configurados
  const hasColumnsAndBreakdowns = () => {
    if (widget.type === "table") {
      const columns = widget.config.columns || [];
      const breakdownLevels = widget.config.breakdownLevels || [];
      return columns.length > 0 && breakdownLevels.length > 0;
    }
    return false;
  };

  // Manejar cargar configuración
  const handleLoadConfig = () => {
    console.log("Cargar configuración - Por implementar");
    // Mostrar alerta al usuario
    alert(
      "La funcionalidad de carga de configuración aún no está disponible. Estamos trabajando en ello."
    );
  };

  // Manejar guardar configuración
  const handleSaveConfig = () => {
    console.log("Guardar configuración - Por implementar");
    // Mostrar alerta al usuario
    alert(
      "La funcionalidad de guardado de configuración aún no está disponible. Estamos trabajando en ello."
    );
  };

  const renderWidgetConfig = () => {
    if (widget.type === "table") {
      return <TableConfig widget={widget} />;
    }

    return (
      <div className="config-section">
        <div className="coming-soon-message">
          <Icon name={getWidgetIcon(widget.type)} size={48} />
          <h3>Próximamente</h3>
          <p>Estamos trabajando en los nuevos configuradores de widgets.</p>
          <p>¡Mantente atento a las próximas actualizaciones!</p>
        </div>
      </div>
    );
  };

  return (
    <div className="widget-config-sidebar">
      <div className="widget-config-sidebar__header">
        <div className="widget-config-sidebar__title-section">
          <div className="widget-config-sidebar__icon">
            <Icon name={getWidgetIcon(widget.type)} size={20} />
          </div>
          <div className="widget-config-sidebar__title-content">
            <div className="widget-config-sidebar__title">
              {isEditingTitle ? (
                <div className="widget-config-sidebar__title-edit-wrapper">
                  <div className="widget-config-sidebar__title-edit-container">
                    <input
                      ref={titleInputRef}
                      type="text"
                      className="widget-config-sidebar__title-input"
                      value={editableTitle}
                      onChange={(e) => setEditableTitle(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Titulo del widget..."
                      autoFocus
                    />
                    <div className="widget-config-sidebar__title-actions">
                      <button
                        className="widget-config-sidebar__title-action"
                        onClick={saveTitle}
                        title="Aceptar"
                      >
                        <Icon name="check" size={14} />
                      </button>
                      <button
                        className="widget-config-sidebar__title-action"
                        onClick={() => {
                          setEditableTitle(widget.title || "");
                          setIsEditingTitle(false);
                        }}
                        title="Cancelar"
                      >
                        <Icon name="close" size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="widget-config-sidebar__title-container"
                  onClick={handleEditTitle}
                >
                  <span>{getWidgetTitle()}</span>
                </div>
              )}
            </div>

            {!isEditingTitle && (
              <div className="widget-config-sidebar__config-actions">
                <button
                  className="widget-config-sidebar__config-action"
                  onClick={handleEditTitle}
                >
                  Editar título
                </button>
                <span className="widget-config-sidebar__action-separator">
                  |
                </span>
                <button
                  className="widget-config-sidebar__config-action"
                  onClick={handleLoadConfig}
                >
                  Cargar
                </button>
                <span className="widget-config-sidebar__action-separator">
                  |
                </span>
                <button
                  className="widget-config-sidebar__config-action"
                  onClick={handleSaveConfig}
                  disabled={!hasColumnsAndBreakdowns()}
                >
                  Guardar
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          className="widget-config-sidebar__close-btn"
          onClick={handleClose}
          title="Cerrar panel"
        >
          <Icon name="close" size={18} />
        </button>
      </div>

      <div className="widget-config-sidebar__content">
        {renderWidgetConfig()}
      </div>
    </div>
  );
};
