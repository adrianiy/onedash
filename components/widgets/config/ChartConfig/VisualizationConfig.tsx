import React, { useState } from "react";
import { Icon } from "../../../common/Icon";
import type { ChartWidget } from "../../../../types/widget";
import { useWidgetStore } from "../../../../store/widgetStore";
import { Tooltip } from "react-tooltip";
import { SeriesColorChip } from "./components/SeriesColorChip";

interface VisualizationConfigProps {
  widget: ChartWidget;
}

export const VisualizationConfig: React.FC<VisualizationConfigProps> = ({
  widget,
}) => {
  const { updateWidget } = useWidgetStore();
  const [isLegendAccordionExpanded, setIsLegendAccordionExpanded] =
    useState(false);

  // Asegurar que el widget es de tipo chart
  if (widget.type !== "chart") {
    return (
      <div className="chart-config__placeholder">
        <Icon name="warning" size={32} />
        <span>Tipo de widget no compatible</span>
        <p>
          Esta configuraciรณn solo estรก disponible para widgets de grรกfico
        </p>
      </div>
    );
  }

  // Obtener valores actuales o valores predeterminados
  const visualization = widget.config.visualization || {};
  const showTitle = visualization.showTitle !== false;
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

  // Verificar si hay filtros de widget configurados
  const widgetFilters = widget.config.widgetFilters;
  const hasWidgetFilters =
    widgetFilters &&
    ((widgetFilters.products && widgetFilters.products.length > 0) ||
      (widgetFilters.sections && widgetFilters.sections.length > 0) ||
      (widgetFilters.dateRange &&
        (widgetFilters.dateRange.start || widgetFilters.dateRange.end)));

  // Verificar si hay tรญtulo para habilitar/deshabilitar la opciรณn
  const hasTitleDisabled = !widget.title || widget.title.trim() === "";

  // Manejadores de eventos para actualizar configuraciรณn
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

  const handleChangeOrientation = (orientation: "horizontal" | "vertical") => {
    updateWidget(widget._id, {
      config: {
        ...widget.config,
        visualization: {
          ...visualization,
          chartOrientation: orientation,
        },
      },
    });
  };

  const handleChangeLegendPosition = (
    vertical: "top" | "center" | "bottom",
    horizontal: "left" | "center" | "right"
  ) => {
    updateWidget(widget._id, {
      config: {
        ...widget.config,
        visualization: {
          ...visualization,
          legendPosition: { vertical, horizontal },
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

  // Funciones auxiliares para el acordeรณn de leyenda
  const generateLegendSummary = () => {
    const vertical =
      typeof legendPosition === "object"
        ? legendPosition.vertical === "top"
          ? "Arriba"
          : legendPosition.vertical === "bottom"
          ? "Abajo"
          : "Centro"
        : legendPosition === "top"
        ? "Arriba"
        : "Abajo";

    const horizontal =
      typeof legendPosition === "object"
        ? legendPosition.horizontal === "left"
          ? "Izquierda"
          : legendPosition.horizontal === "right"
          ? "Derecha"
          : "Centro"
        : legendPosition === "left"
        ? "Izquierda"
        : legendPosition === "right"
        ? "Derecha"
        : "Centro";

    const orientation =
      typeof legendPosition === "object" &&
      (legendPosition.horizontal === "left" ||
        legendPosition.horizontal === "right")
        ? "Vertical"
        : "Horizontal";

    return `${vertical}, ${horizontal}, ${orientation}`;
  };

  const handleLegendVerticalChange = (
    vertical: "top" | "center" | "bottom"
  ) => {
    const currentHorizontal =
      typeof legendPosition === "object" ? legendPosition.horizontal : "center";
    handleChangeLegendPosition(vertical, currentHorizontal);
  };

  const handleLegendHorizontalChange = (
    horizontal: "left" | "center" | "right"
  ) => {
    const currentVertical =
      typeof legendPosition === "object" ? legendPosition.vertical : "bottom";
    handleChangeLegendPosition(currentVertical, horizontal);
  };

  const handleLegendOrientationHorizontal = () => {
    updateWidget(widget._id, {
      config: {
        ...widget.config,
        visualization: {
          ...visualization,
          legendOrientation: "horizontal",
        },
      },
    });
  };

  const handleLegendOrientationVertical = () => {
    updateWidget(widget._id, {
      config: {
        ...widget.config,
        visualization: {
          ...visualization,
          legendOrientation: "vertical",
        },
      },
    });
  };

  const getCurrentLegendOrientation = () => {
    // Leer la orientación real del campo independiente
    return visualization.legendOrientation || "horizontal";
  };

  return (
    <div className="viz-config">
      {/* Contenedor del visualizador de grรกfico */}
      <div className="viz-chart-configurator">
        {/* Controles superiores */}
        <div className="viz-chart-controls viz-chart-controls--top">
          <div className="viz-control-with-label">
            <button
              className={`viz-control-btn ${
                showTitle ? "viz-control-btn--active" : ""
              } ${hasTitleDisabled ? "viz-control-btn--disabled" : ""}`}
              onClick={() =>
                !hasTitleDisabled && handleToggleOption("showTitle", !showTitle)
              }
              data-tooltip-id="viz-title-tooltip"
              disabled={hasTitleDisabled}
            >
              <Icon name="type" size={16} />
            </button>
            <span className="viz-control-label">Título</span>
          </div>

          <div className="viz-control-with-label">
            <button
              className={`viz-control-btn ${
                showLegend ? "viz-control-btn--active" : ""
              }`}
              onClick={() => handleToggleOption("showLegend", !showLegend)}
              data-tooltip-id="viz-legend-tooltip"
            >
              <Icon name="list" size={16} />
            </button>
          </div>
        </div>

        {/* Visualizador de grรกfico */}
        <div className="viz-chart-preview">
          <div
            className={`viz-chart-sample ${
              chartOrientation === "horizontal"
                ? "viz-chart-sample--horizontal"
                : "viz-chart-sample--vertical"
            } ${showGrid ? "viz-chart-sample--grid" : ""}`}
          >
            {chartOrientation === "vertical" ? (
              // Grรกfico de columnas
              <div className="viz-chart-bars viz-chart-bars--vertical">
                <div className="viz-chart-placeholder viz-chart-placeholder--short"></div>
                <div className="viz-chart-placeholder viz-chart-placeholder--tall"></div>
                <div className="viz-chart-placeholder viz-chart-placeholder--medium"></div>
                <div className="viz-chart-placeholder viz-chart-placeholder--tall"></div>
                <div className="viz-chart-placeholder viz-chart-placeholder--short"></div>
              </div>
            ) : (
              // Grรกfico de barras
              <div className="viz-chart-bars viz-chart-bars--horizontal">
                <div className="viz-chart-placeholder viz-chart-placeholder--short"></div>
                <div className="viz-chart-placeholder viz-chart-placeholder--medium"></div>
                <div className="viz-chart-placeholder viz-chart-placeholder--tall"></div>
                <div className="viz-chart-placeholder viz-chart-placeholder--medium"></div>
                <div className="viz-chart-placeholder viz-chart-placeholder--short"></div>
              </div>
            )}

            {/* Ejes */}
            {showXAxis && (
              <div
                className={`viz-chart-axis viz-chart-axis--x ${
                  rotateXLabels ? "viz-chart-axis--rotated" : ""
                }`}
              >
                <div className="viz-chart-axis-line"></div>
              </div>
            )}
            {showYAxis && (
              <div className="viz-chart-axis viz-chart-axis--y">
                <div className="viz-chart-axis-line"></div>
              </div>
            )}
          </div>
        </div>

        {/* Controles laterales */}
        <div className="viz-chart-controls viz-chart-controls--right">
          <button
            className={`viz-control-btn ${
              showGrid ? "viz-control-btn--active" : ""
            }`}
            onClick={() => handleToggleOption("showGrid", !showGrid)}
            data-tooltip-id="grid-tooltip"
          >
            <Icon name="grid-3x3" size={16} />
          </button>

          <button
            className={`viz-control-btn ${
              showValues ? "viz-control-btn--active" : ""
            }`}
            onClick={() => handleToggleOption("showValues", !showValues)}
            data-tooltip-id="values-tooltip"
          >
            <Icon name="hash" size={16} />
          </button>

          <button
            className={`viz-control-btn ${
              showYAxis ? "viz-control-btn--active" : ""
            }`}
            onClick={() => handleToggleOption("showYAxis", !showYAxis)}
            data-tooltip-id="y-axis-tooltip"
          >
            <Icon name="move-vertical" size={16} />
          </button>
        </div>

        {/* Controles inferiores */}
        <div className="viz-chart-controls viz-chart-controls--bottom">
          <button
            className={`viz-control-btn ${
              showXAxis ? "viz-control-btn--active" : ""
            }`}
            onClick={() => handleToggleOption("showXAxis", !showXAxis)}
            data-tooltip-id="x-axis-tooltip"
          >
            <Icon name="move-horizontal" size={16} />
          </button>

          <button
            className={`viz-control-btn ${
              rotateXLabels ? "viz-control-btn--active" : ""
            }`}
            onClick={() => handleToggleOption("rotateXLabels", !rotateXLabels)}
            data-tooltip-id="rotate-labels-tooltip"
          >
            <Icon name="rotate-cw" size={16} />
          </button>
        </div>
      </div>

      {/* Contenedor de secciones de configuraciรณn */}
      <div className="viz-config-sections-container">
        {/* Secciรณn de tipo de grรกfico */}
        <div className="viz-config-section viz-chart-type">
          <div className="viz-section-header viz-chart-type-header">
            <h3 className="viz-section-title">Tipo de Gráfico</h3>
            <div className="viz-chart-type-controls">
              <button
                className={`viz-control-btn ${
                  chartOrientation === "vertical"
                    ? "viz-control-btn--active"
                    : ""
                }`}
                onClick={() => handleChangeOrientation("vertical")}
                data-tooltip-id="columns-tooltip"
              >
                <Icon name="bar-chart-3" size={16} />
              </button>
              <button
                className={`viz-control-btn ${
                  chartOrientation === "horizontal"
                    ? "viz-control-btn--active"
                    : ""
                }`}
                onClick={() => handleChangeOrientation("horizontal")}
                data-tooltip-id="bars-tooltip"
              >
                <Icon name="chart-bar-decreasing" size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Secciรณn de posiciรณn de la leyenda - Acordeรณn */}
        <div className="viz-config-section viz-legend-position">
          <div
            className="viz-legend-accordion"
            onClick={() =>
              setIsLegendAccordionExpanded(!isLegendAccordionExpanded)
            }
          >
            <div className="viz-section-header viz-legend-position-header">
              <h3 className="viz-section-title">
                <Icon
                  name={
                    isLegendAccordionExpanded ? "chevron-down" : "chevron-right"
                  }
                  size={16}
                />
                Posición de Leyenda
              </h3>
              <div className="viz-legend-accordion-summary">
                <span className="viz-legend-summary-text">
                  {generateLegendSummary()}
                </span>
              </div>
            </div>
          </div>

          {isLegendAccordionExpanded && (
            <div className="viz-legend-accordion-content">
              {/* Secciรณn: Posiciรณn Vertical */}
              <div className="viz-legend-section">
                <h4 className="viz-legend-section-title">
                  <Icon name="move-vertical" size={14} />
                  Posición Vertical
                </h4>
                <div className="viz-legend-section-controls">
                  <button
                    className={`viz-legend-control-btn ${
                      (typeof legendPosition === "object" &&
                        legendPosition.vertical === "top") ||
                      legendPosition === "top"
                        ? "viz-legend-control-btn--active"
                        : ""
                    }`}
                    onClick={() => handleLegendVerticalChange("top")}
                    data-tooltip-id="legend-vertical-top-tooltip"
                  >
                    <Icon name="arrow-up" size={16} />
                    <span>Arriba</span>
                  </button>
                  <button
                    className={`viz-legend-control-btn ${
                      typeof legendPosition === "object" &&
                      legendPosition.vertical === "center"
                        ? "viz-legend-control-btn--active"
                        : ""
                    }`}
                    onClick={() => handleLegendVerticalChange("center")}
                    data-tooltip-id="legend-vertical-center-tooltip"
                  >
                    <Icon name="circle" size={16} />
                    <span>Centro</span>
                  </button>
                  <button
                    className={`viz-legend-control-btn ${
                      (typeof legendPosition === "object" &&
                        legendPosition.vertical === "bottom") ||
                      legendPosition === "bottom"
                        ? "viz-legend-control-btn--active"
                        : ""
                    }`}
                    onClick={() => handleLegendVerticalChange("bottom")}
                    data-tooltip-id="legend-vertical-bottom-tooltip"
                  >
                    <Icon name="arrow-down" size={16} />
                    <span>Abajo</span>
                  </button>
                </div>
              </div>

              {/* Secciรณn: Posiciรณn Horizontal */}
              <div className="viz-legend-section">
                <h4 className="viz-legend-section-title">
                  <Icon name="move-horizontal" size={14} />
                  Posición Horizontal
                </h4>
                <div className="viz-legend-section-controls">
                  <button
                    className={`viz-legend-control-btn ${
                      (typeof legendPosition === "object" &&
                        legendPosition.horizontal === "left") ||
                      legendPosition === "left"
                        ? "viz-legend-control-btn--active"
                        : ""
                    }`}
                    onClick={() => handleLegendHorizontalChange("left")}
                    data-tooltip-id="legend-horizontal-left-tooltip"
                  >
                    <Icon name="arrow-left" size={16} />
                    <span>Izquierda</span>
                  </button>
                  <button
                    className={`viz-legend-control-btn ${
                      (typeof legendPosition === "object" &&
                        legendPosition.horizontal === "center") ||
                      !legendPosition ||
                      (typeof legendPosition === "string" &&
                        legendPosition !== "left" &&
                        legendPosition !== "right")
                        ? "viz-legend-control-btn--active"
                        : ""
                    }`}
                    onClick={() => handleLegendHorizontalChange("center")}
                    data-tooltip-id="legend-horizontal-center-tooltip"
                  >
                    <Icon name="circle" size={16} />
                    <span>Centro</span>
                  </button>
                  <button
                    className={`viz-legend-control-btn ${
                      (typeof legendPosition === "object" &&
                        legendPosition.horizontal === "right") ||
                      legendPosition === "right"
                        ? "viz-legend-control-btn--active"
                        : ""
                    }`}
                    onClick={() => handleLegendHorizontalChange("right")}
                    data-tooltip-id="legend-horizontal-right-tooltip"
                  >
                    <Icon name="arrow-right" size={16} />
                    <span>Derecha</span>
                  </button>
                </div>
              </div>

              {/* Secciรณn: Alineaciรณn */}
              <div className="viz-legend-section">
                <h4 className="viz-legend-section-title">
                  <Icon name="layout-grid" size={14} />
                  Alineación
                </h4>
                <div className="viz-legend-section-controls">
                  <button
                    className={`viz-legend-control-btn ${
                      getCurrentLegendOrientation() === "horizontal"
                        ? "viz-legend-control-btn--active"
                        : ""
                    }`}
                    onClick={() => handleLegendOrientationHorizontal()}
                    data-tooltip-id="legend-orientation-horizontal-tooltip"
                  >
                    <Icon name="more-horizontal" size={16} />
                    <span>Horizontal</span>
                  </button>
                  <button
                    className={`viz-legend-control-btn ${
                      getCurrentLegendOrientation() === "vertical"
                        ? "viz-legend-control-btn--active"
                        : ""
                    }`}
                    onClick={() => handleLegendOrientationVertical()}
                    data-tooltip-id="legend-orientation-vertical-tooltip"
                  >
                    <Icon
                      name="more-horizontal"
                      size={16}
                      style={{ transform: "rotate(90deg)" }}
                    />
                    <span>Vertical</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Secciรณn de visibilidad de filtros - Solo visible si hay filtros de widget */}
        {hasWidgetFilters && (
          <div className="viz-config-section viz-filters-display">
            <div className="viz-section-header viz-filters-display-header">
              <h3 className="viz-section-title">Visibilidad de Filtros</h3>
              <div className="viz-filters-display-controls">
                <button
                  className={`viz-control-btn ${
                    filterDisplayMode === "badges"
                      ? "viz-control-btn--active"
                      : ""
                  }`}
                  onClick={() => handleFilterDisplayMode("badges")}
                  data-tooltip-id="badges-mode-tooltip"
                >
                  <Icon name="label" size={16} />
                </button>
                <button
                  className={`viz-control-btn ${
                    filterDisplayMode === "info"
                      ? "viz-control-btn--active"
                      : ""
                  }`}
                  onClick={() => handleFilterDisplayMode("info")}
                  data-tooltip-id="info-mode-tooltip"
                >
                  <Icon name="filter" size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Secciรณn de colores */}
        <div className="viz-config-section viz-colors">
          <div className="viz-section-header viz-colors-header">
            <h3 className="viz-section-title">Colores</h3>
            <div className="viz-colors-controls">
              {/* Botรณn paleta por defecto */}
              <button
                className={`viz-control-btn ${
                  colorMode === "default" ? "viz-control-btn--active" : ""
                }`}
                onClick={() => handleChangeColorMode("default")}
                data-tooltip-id="color-mode-default-tooltip"
              >
                <Icon name="palette" size={16} />
              </button>

              {/* Botรณn selector de paletas */}
              <button
                className={`viz-control-btn ${
                  colorMode === "palette" ? "viz-control-btn--active" : ""
                }`}
                onClick={() => handleChangeColorMode("palette")}
                data-tooltip-id="color-mode-palette-tooltip"
              >
                <Icon name="layers" size={16} />
              </button>

              {/* Botรณn personalizada */}
              <button
                className={`viz-control-btn ${
                  colorMode === "custom" ? "viz-control-btn--active" : ""
                }`}
                onClick={() => handleChangeColorMode("custom")}
                data-tooltip-id="color-mode-custom-tooltip"
              >
                <Icon name="paint-bucket" size={16} />
              </button>
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
                    color={
                      seriesColors[series.id] || getDefaultSeriesColor(index)
                    }
                    onColorChange={handleSeriesColorChange}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tooltips */}
      <Tooltip
        id="viz-title-tooltip"
        content="Mostrar tรญtulo en el grรกfico"
      />
      <Tooltip id="viz-legend-tooltip" content="Mostrar leyenda" />
      <Tooltip id="grid-tooltip" content="Mostrar grilla" />
      <Tooltip id="values-tooltip" content="Mostrar valores en barras" />
      <Tooltip id="x-axis-tooltip" content="Mostrar eje X" />
      <Tooltip id="y-axis-tooltip" content="Mostrar eje Y" />
      <Tooltip id="rotate-labels-tooltip" content="Rotar etiquetas del eje X" />
      <Tooltip id="columns-tooltip" content="Grรกfico de columnas" />
      <Tooltip id="bars-tooltip" content="Grรกfico de barras" />
      <Tooltip id="legend-vertical-top-tooltip" content="Leyenda arriba" />
      <Tooltip
        id="legend-vertical-center-tooltip"
        content="Leyenda centro vertical"
      />
      <Tooltip id="legend-vertical-bottom-tooltip" content="Leyenda abajo" />
      <Tooltip id="legend-left-tooltip" content="Leyenda izquierda" />
      <Tooltip id="legend-center-tooltip" content="Leyenda centro" />
      <Tooltip id="legend-right-tooltip" content="Leyenda derecha" />
      <Tooltip id="badges-mode-tooltip" content="Mostrar filtros como badges" />
      <Tooltip id="info-mode-tooltip" content="Mostrar filtros como icono" />
      <Tooltip id="color-mode-default-tooltip" content="Paleta por defecto" />
      <Tooltip id="color-mode-palette-tooltip" content="Seleccionar paleta" />
      <Tooltip
        id="color-mode-custom-tooltip"
        content="Colores personalizados"
      />
      <Tooltip id="palette-default-tooltip" content="Paleta por defecto" />
      <Tooltip id="palette-black-tooltip" content="Paleta negra" />
      <Tooltip id="palette-blue-tooltip" content="Paleta azul" />
      <Tooltip id="palette-violet-tooltip" content="Paleta violeta" />
      <Tooltip id="palette-green-tooltip" content="Paleta verde" />
    </div>
  );
};
