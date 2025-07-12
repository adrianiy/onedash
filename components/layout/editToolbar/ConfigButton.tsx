import React from "react";
import { Icon } from "@/common/Icon";
import { ConfigButtonProps } from "./types";
import { Tooltip } from "react-tooltip";

/**
 * Botón de configuración que aparece cuando hay un widget seleccionado
 */
export const ConfigButton: React.FC<ConfigButtonProps> = ({
  selectedWidgetId,
  getWidget,
  openConfigSidebar,
}) => {
  // Solo mostrar el botón si hay un widget seleccionado
  if (!selectedWidgetId) {
    return null;
  }

  const widget = getWidget(selectedWidgetId);
  if (!widget) {
    return null;
  }

  /**
   * Obtiene el nombre del tipo de widget para mostrar en la interfaz
   */
  const getWidgetTypeName = (type: string) => {
    switch (type) {
      case "table":
        return "Tabla";
      case "chart":
        return "Gráfico";
      case "metric":
        return "Métrica";
      case "text":
        return "Texto";
      default:
        return "Widget";
    }
  };

  /**
   * Obtiene el icono correspondiente al tipo de widget
   */
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

  /**
   * Maneja el clic en el botón de configuración
   */
  const handleConfigClick = () => {
    openConfigSidebar();
  };

  return (
    <div className="edit-toolbar__section edit-toolbar__section--config">
      <button
        className="edit-toolbar__button edit-toolbar__button--config"
        onClick={handleConfigClick}
        data-tooltip-id="config-tooltip"
      >
        <Icon name={getWidgetIcon(widget.type)} size={20} />
        <span>Configurar {getWidgetTypeName(widget.type)}</span>
      </button>

      {/* Tooltip */}
      <Tooltip
        id="config-tooltip"
        content="Configurar widget seleccionado"
        place="bottom"
      />
    </div>
  );
};
