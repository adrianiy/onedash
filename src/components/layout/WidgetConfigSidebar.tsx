import React from "react";
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
  const { getWidget } = useWidgetStore();

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

  const getWidgetTitle = (type: string) => {
    switch (type) {
      case "table":
        return "Configurar Tabla";
      case "chart":
        return "Configurar Gráfico";
      case "metric":
        return "Configurar Métrica";
      case "text":
        return "Configurar Texto";
      default:
        return "Configuración";
    }
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
        <div className="widget-config-sidebar__title">
          <Icon name={getWidgetIcon(widget.type)} size={20} />
          <span>{getWidgetTitle(widget.type)}</span>
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
