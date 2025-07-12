import { Icon } from "@/common/Icon";
import { useWidgetStore } from "@/store/widgetStore";
import type { ChartWidget } from "@/types/widget";
import React from "react";
import { Tooltip } from "react-tooltip";
import { VisualizationToggleButton } from "../../common/controls/VisualizationToggleButton";
import { SeriesColorChip } from "./SeriesColorChip";

interface ColorModeSectionProps {
  widget: ChartWidget;
  colorMode: "default" | "palette" | "custom";
  colorPalette: "default" | "black" | "blue" | "violet" | "green";
  seriesColors: Record<string, string>;
}

export const ColorModeSection: React.FC<ColorModeSectionProps> = ({
  widget,
  colorMode,
  colorPalette,
  seriesColors,
}) => {
  const { updateWidget } = useWidgetStore();

  const visualization = widget.config.visualization || {};

  const handleChangeColorMode = (mode: "default" | "palette" | "custom") => {
    updateWidget(widget._id, {
      config: {
        ...widget.config,
        visualization: {
          ...visualization,
          colorMode: mode,
          // Limpiar configuraciones previas si cambia de modo
          ...(mode !== "palette" && { colorPalette: "default" }),
          ...(mode !== "custom" && { seriesColors: {} }),
        },
      },
    });
  };

  const handleChangeColorPalette = (
    palette: "default" | "black" | "blue" | "violet" | "green"
  ) => {
    updateWidget(widget._id, {
      config: {
        ...widget.config,
        visualization: {
          ...visualization,
          colorMode: "palette",
          colorPalette: palette,
        },
      },
    });
  };

  const handleSeriesColorChange = (seriesId: string, color: string) => {
    updateWidget(widget._id, {
      config: {
        ...widget.config,
        visualization: {
          ...visualization,
          colorMode: "custom",
          seriesColors: {
            ...seriesColors,
            [seriesId]: color,
          },
        },
      },
    });
  };

  // Obtener colores por defecto para las series
  const getDefaultSeriesColor = (index: number): string => {
    const defaultColors = [
      "#5470c6",
      "#91cc75",
      "#fac858",
      "#ee6666",
      "#73c0de",
    ];
    return defaultColors[index % defaultColors.length];
  };

  return (
    <div className="viz-config-section viz-colors">
      <div className="viz-section-header viz-colors-header">
        <h3 className="viz-section-title">Colores</h3>
        <div className="viz-colors-controls">
          <VisualizationToggleButton
            isActive={colorMode === "default"}
            onClick={() => handleChangeColorMode("default")}
            icon="palette"
            tooltipId="color-mode-default-tooltip"
            tooltipContent="Paleta por defecto"
          />

          <VisualizationToggleButton
            isActive={colorMode === "palette"}
            onClick={() => handleChangeColorMode("palette")}
            icon="layers"
            tooltipId="color-mode-palette-tooltip"
            tooltipContent="Seleccionar paleta"
          />

          <VisualizationToggleButton
            isActive={colorMode === "custom"}
            onClick={() => handleChangeColorMode("custom")}
            icon="paint-bucket"
            tooltipId="color-mode-custom-tooltip"
            tooltipContent="Colores personalizados"
          />
        </div>
      </div>

      {/* Selector de paletas - Solo visible cuando colorMode es "palette" */}
      {colorMode === "palette" && (
        <div className="viz-colors-palette-section">
          <div className="viz-colors-palette-grid">
            <button
              className={`viz-palette-btn ${
                colorPalette === "default" ? "viz-palette-btn--active" : ""
              }`}
              onClick={() => handleChangeColorPalette("default")}
              data-tooltip-id="palette-default-tooltip"
            >
              <Icon name="palette" size={16} />
              <span>Por defecto</span>
            </button>

            <button
              className={`viz-palette-btn ${
                colorPalette === "black" ? "viz-palette-btn--active" : ""
              }`}
              onClick={() => handleChangeColorPalette("black")}
              data-tooltip-id="palette-black-tooltip"
            >
              <Icon name="square" size={16} />
              <span>Negro</span>
            </button>

            <button
              className={`viz-palette-btn ${
                colorPalette === "blue" ? "viz-palette-btn--active" : ""
              }`}
              onClick={() => handleChangeColorPalette("blue")}
              data-tooltip-id="palette-blue-tooltip"
            >
              <Icon name="droplets" size={16} />
              <span>Azul</span>
            </button>

            <button
              className={`viz-palette-btn ${
                colorPalette === "violet" ? "viz-palette-btn--active" : ""
              }`}
              onClick={() => handleChangeColorPalette("violet")}
              data-tooltip-id="palette-violet-tooltip"
            >
              <Icon name="grape" size={16} />
              <span>Violeta</span>
            </button>

            <button
              className={`viz-palette-btn ${
                colorPalette === "green" ? "viz-palette-btn--active" : ""
              }`}
              onClick={() => handleChangeColorPalette("green")}
              data-tooltip-id="palette-green-tooltip"
            >
              <Icon name="leaf" size={16} />
              <span>Verde</span>
            </button>
          </div>
        </div>
      )}

      {/* Grid de series personalizadas - Solo visible cuando colorMode es "custom" */}
      {colorMode === "custom" && widget.config.series && (
        <div className="viz-colors-custom-section">
          <div className="viz-series-colors-grid">
            {widget.config.series.map((series, index) => (
              <SeriesColorChip
                key={series.id}
                series={series}
                color={seriesColors[series.id] || getDefaultSeriesColor(index)}
                onColorChange={handleSeriesColorChange}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tooltips para paletas */}
      <Tooltip id="palette-default-tooltip" content="Paleta por defecto" />
      <Tooltip id="palette-black-tooltip" content="Paleta negra" />
      <Tooltip id="palette-blue-tooltip" content="Paleta azul" />
      <Tooltip id="palette-violet-tooltip" content="Paleta violeta" />
      <Tooltip id="palette-green-tooltip" content="Paleta verde" />
    </div>
  );
};
