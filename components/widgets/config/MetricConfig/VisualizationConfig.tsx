import React from "react";
import type { MetricWidget } from "@/types/widget";
import { useWidgetStore } from "@/store/widgetStore";
import {
  FilterDisplayControl,
  ConditionalFormatsControl,
  VisualizationToggleButton,
  VisualizationControlGroup,
} from "@/components/widgets/common";
import { useVisualizationLogic } from "@/config/hooks/useVisualizationLogic";

interface VisualizationConfigProps {
  widget: MetricWidget;
}

export const VisualizationConfig: React.FC<VisualizationConfigProps> = ({
  widget,
}) => {
  const { updateWidget } = useWidgetStore();

  // Usar hook de lógica común
  const vizLogic = useVisualizationLogic(widget);

  const currentSize = widget.config.size || "medium";
  const currentAlignment = widget.config.alignment || "center";
  const conditionalFormats =
    widget.config.visualization?.conditionalFormats || [];

  // Usar valores del hook
  const { showTitle, filterDisplayMode, hasTitleDisabled } = vizLogic;

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

  // Usar handlers del hook
  const { handleToggleTitle, handleFilterDisplayMode } = vizLogic;

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

  return (
    <div className="viz-config">
      {/* Configurador de métrica con placeholder visual */}
      <div className="viz-metric-configurator">
        {/* Controles superiores: título */}
        <div className="viz-metric-controls viz-metric-controls--top">
          <div className="viz-control-with-label">
            <VisualizationToggleButton
              isActive={showTitle}
              onClick={() => handleToggleTitle(!showTitle)}
              icon="type"
              tooltipId="metric-title-tooltip"
              tooltipContent="Mostrar título del widget"
              disabled={hasTitleDisabled}
            />
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
          <VisualizationControlGroup
            controls={
              <>
                <VisualizationToggleButton
                  isActive={currentSize === "small"}
                  onClick={() => handleSizeChange("small")}
                  icon="type"
                  size={12}
                  tooltipId="metric-size-small-tooltip"
                  tooltipContent="Tamaño pequeño"
                />
                <VisualizationToggleButton
                  isActive={currentSize === "medium"}
                  onClick={() => handleSizeChange("medium")}
                  icon="type"
                  size={16}
                  tooltipId="metric-size-medium-tooltip"
                  tooltipContent="Tamaño mediano"
                />
                <VisualizationToggleButton
                  isActive={currentSize === "large"}
                  onClick={() => handleSizeChange("large")}
                  icon="type"
                  size={20}
                  tooltipId="metric-size-large-tooltip"
                  tooltipContent="Tamaño grande"
                />
              </>
            }
          />

          {/* Controles de alineación */}
          <VisualizationControlGroup
            controls={
              <>
                <VisualizationToggleButton
                  isActive={currentAlignment === "left"}
                  onClick={() => handleAlignmentChange("left")}
                  icon="align-left"
                  size={14}
                  tooltipId="metric-align-left-tooltip"
                  tooltipContent="Alinear a la izquierda"
                />
                <VisualizationToggleButton
                  isActive={currentAlignment === "center"}
                  onClick={() => handleAlignmentChange("center")}
                  icon="align-center"
                  size={14}
                  tooltipId="metric-align-center-tooltip"
                  tooltipContent="Alinear al centro"
                />
                <VisualizationToggleButton
                  isActive={currentAlignment === "right"}
                  onClick={() => handleAlignmentChange("right")}
                  icon="align-right"
                  size={14}
                  tooltipId="metric-align-right-tooltip"
                  tooltipContent="Alinear a la derecha"
                />
              </>
            }
          />
        </div>
      </div>

      {/* Sección de visibilidad de filtros */}
      <FilterDisplayControl
        widget={widget}
        filterDisplayMode={filterDisplayMode}
        onFilterDisplayModeChange={handleFilterDisplayMode}
      />

      {/* Sección de formatos condicionales */}
      <ConditionalFormatsControl
        widget={widget}
        columns={availableColumns}
        conditionalFormats={conditionalFormats}
      />
    </div>
  );
};
