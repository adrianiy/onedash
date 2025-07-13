import React from "react";
import { Icon } from "@/common/Icon";
import { ConfigButtonProps } from "./types";
import { Tooltip } from "react-tooltip";
import { useUIStore } from "@/store/uiStore";
import { useGridStore } from "@/store/gridStore";

/**
 * Botón de configuración que aparece cuando hay un widget seleccionado
 */
export const ConfigButton: React.FC<ConfigButtonProps> = ({
  openConfigSidebar,
}) => {
  const { selectedWidgetId } = useUIStore();
  const { widgets } = useGridStore();

  // Solo mostrar el botón si hay un widget seleccionado
  if (!selectedWidgetId || !widgets) {
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

  if (!selectedWidgetId || !widgets[selectedWidgetId]) {
    return null;
  }

  return (
    <div className="edit-toolbar__section edit-toolbar__section--config">
      <button
        className="edit-toolbar__button edit-toolbar__button--config"
        onClick={handleConfigClick}
        data-tooltip-id="config-tooltip"
      >
        <Icon name={getWidgetIcon(widgets[selectedWidgetId].type)} size={20} />
        <span>
          Configurar {getWidgetTypeName(widgets[selectedWidgetId].type)}
        </span>
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
