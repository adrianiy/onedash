import React from "react";
import { Icon } from "@/common/Icon";
import type { ChartWidget } from "@/types/widget";
import { useWidgetStore } from "@/store/widgetStore";
import {
  FilterDisplayControl,
  VisualizationToggleButton,
  ChartPreviewContainer,
  ChartControlsContainer,
  LegendAccordionSection,
  ColorModeSection,
  ChartTypeSection,
} from "@/components/widgets/common";
import { useVisualizationLogic } from "@/config/hooks/useVisualizationLogic";

interface VisualizationConfigProps {
  widget: ChartWidget;
}

export const VisualizationConfig: React.FC<VisualizationConfigProps> = ({
  widget,
}) => {
  const { updateWidget } = useWidgetStore();

  // Usar hook de lógica común
  const vizLogic = useVisualizationLogic(widget);

  // Asegurar que el widget es de tipo chart
  if (widget.type !== "chart") {
    return (
      <div className="chart-config__placeholder">
        <Icon name="warning" size={32} />
        <span>Tipo de widget no compatible</span>
        <p>Esta configuración solo está disponible para widgets de gráfico</p>
      </div>
    );
  }

  // Obtener valores actuales o valores predeterminados
  const visualization = widget.config.visualization || {};
  const showTitle = vizLogic.showTitle;
  const showLegend = visualization.showLegend !== false;
  const showGrid = visualization.showGrid !== false;
  const showValues = visualization.showValues === true;
  const showXAxis = visualization.showXAxis !== false;
  const showYAxis = visualization.showYAxis !== false;
  const rotateXLabels = visualization.rotateXLabels === true;
  const chartOrientation = visualization.chartOrientation || "vertical";
  const legendPosition = visualization.legendPosition || {
    vertical: "bottom",
    horizontal: "center",
  };
  const filterDisplayMode = visualization.filterDisplayMode;
  const colorMode = visualization.colorMode || "default";
  const colorPalette = visualization.colorPalette || "default";
  const seriesColors = visualization.seriesColors || {};

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
    let newMode: "badges" | "info" | "hidden" | undefined;

    if (mode === filterDisplayMode) {
      newMode = "hidden";
    } else {
      newMode = mode;
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

  return (
    <div className="viz-config">
      {/* Contenedor del visualizador de gráfico usando ChartControlsContainer */}
      <ChartControlsContainer
        topControls={
          <>
            <div className="viz-control-with-label">
              <VisualizationToggleButton
                isActive={showTitle}
                onClick={() => vizLogic.handleToggleTitle(!showTitle)}
                icon="type"
                tooltipId="viz-title-tooltip"
                tooltipContent="Mostrar título en el gráfico"
                disabled={hasTitleDisabled}
              />
              <span className="viz-control-label">Título</span>
            </div>
            <div className="viz-control-with-label">
              <VisualizationToggleButton
                isActive={showLegend}
                onClick={() => handleToggleOption("showLegend", !showLegend)}
                icon="list"
                tooltipId="viz-legend-tooltip"
                tooltipContent="Mostrar leyenda"
              />
            </div>
          </>
        }
        rightControls={
          <>
            <VisualizationToggleButton
              isActive={showGrid}
              onClick={() => handleToggleOption("showGrid", !showGrid)}
              icon="grid-3x3"
              tooltipId="grid-tooltip"
              tooltipContent="Mostrar grilla"
            />
            <VisualizationToggleButton
              isActive={showValues}
              onClick={() => handleToggleOption("showValues", !showValues)}
              icon="hash"
              tooltipId="values-tooltip"
              tooltipContent="Mostrar valores en barras"
            />
            <VisualizationToggleButton
              isActive={showYAxis}
              onClick={() => handleToggleOption("showYAxis", !showYAxis)}
              icon="move-vertical"
              tooltipId="y-axis-tooltip"
              tooltipContent="Mostrar eje Y"
            />
          </>
        }
        bottomControls={
          <>
            <VisualizationToggleButton
              isActive={showXAxis}
              onClick={() => handleToggleOption("showXAxis", !showXAxis)}
              icon="move-horizontal"
              tooltipId="x-axis-tooltip"
              tooltipContent="Mostrar eje X"
            />
            <VisualizationToggleButton
              isActive={rotateXLabels}
              onClick={() =>
                handleToggleOption("rotateXLabels", !rotateXLabels)
              }
              icon="rotate-cw"
              tooltipId="rotate-labels-tooltip"
              tooltipContent="Rotar etiquetas del eje X"
            />
          </>
        }
      >
        <ChartPreviewContainer
          chartOrientation={chartOrientation}
          showGrid={showGrid}
          showXAxis={showXAxis}
          showYAxis={showYAxis}
          rotateXLabels={rotateXLabels}
        />
      </ChartControlsContainer>

      {/* Contenedor de secciones de configuración */}
      <div className="viz-config-sections-container">
        {/* Sección de tipo de gráfico usando ChartTypeSection */}
        <ChartTypeSection widget={widget} chartOrientation={chartOrientation} />

        {/* Sección de posición de la leyenda usando LegendAccordionSection */}
        {showLegend && (
          <LegendAccordionSection
            widget={widget}
            showLegend={showLegend}
            legendPosition={legendPosition}
          />
        )}

        {/* Sección de visibilidad de filtros */}
        <FilterDisplayControl
          widget={widget}
          filterDisplayMode={filterDisplayMode}
          onFilterDisplayModeChange={handleFilterDisplayMode}
        />

        {/* Sección de colores usando ColorModeSection */}
        <ColorModeSection
          widget={widget}
          colorMode={colorMode}
          colorPalette={colorPalette}
          seriesColors={seriesColors}
        />
      </div>
    </div>
  );
};
