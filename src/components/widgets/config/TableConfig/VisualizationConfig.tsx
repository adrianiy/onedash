import React from "react";
import { Icon } from "../../../common/Icon";
import type { Widget } from "../../../../types/widget";

interface VisualizationConfigProps {
  widget: Widget;
}

export const VisualizationConfig: React.FC<VisualizationConfigProps> = () => {
  return (
    <div className="table-config__placeholder">
      <Icon name="eye" size={32} />
      <span>Configuración de visualización</span>
      <p>
        Próximamente: Personalización de columnas, estilos y formatos de tabla
      </p>
    </div>
  );
};
