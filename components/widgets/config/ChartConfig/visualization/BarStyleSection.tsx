import React, { useMemo } from "react";
import { useGridStore } from "@/store/gridStore";
import type { ChartWidget } from "@/types/widget";
import { Icon } from "@/common/Icon";

interface BarStyleSectionProps {
  widget: ChartWidget;
}

export const BarStyleSection: React.FC<BarStyleSectionProps> = ({ widget }) => {
  const { updateWidget } = useGridStore();
  const visualization = widget.config.visualization || {};

  // Valores por defecto
  const barWidth = visualization.barWidth ?? 0.06;
  const barGap = visualization.barGap ?? 0.2;

  const handleBarWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = parseFloat(e.target.value);
    updateWidget(widget._id, {
      config: {
        ...widget.config,
        visualization: {
          ...visualization,
          barWidth: newWidth,
        },
      },
    });
  };

  const handleBarGapChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGap = parseFloat(e.target.value);
    updateWidget(widget._id, {
      config: {
        ...widget.config,
        visualization: {
          ...visualization,
          barGap: newGap,
        },
      },
    });
  };

  const columnsCount = useMemo(() => {
    return widget.config?.series?.length ?? 0;
  }, [widget.config?.series]);

  return (
    <div className="viz-config-section viz-bar-style">
      <div className="viz-section-header">
        <h3 className="viz-section-title">Estilo de Columnas</h3>
      </div>

      {/* Control de ancho */}
      <div className="viz-bar-style-control">
        <label className="viz-style-label">Ancho</label>
        <div className="viz-control-with-icons">
          <Icon name="bar-chart-horizontal" size={16} />
          <input
            type="range"
            min="0.01"
            max={1 / columnsCount}
            step="0.02"
            value={barWidth}
            onChange={handleBarWidthChange}
            className="viz-bar-style-slider"
          />
          <Icon name="bar-chart-3" size={16} />
        </div>
        <div className="viz-bar-style-value">{Math.round(barWidth * 100)}%</div>
      </div>

      {/* Control de gap */}
      <div className="viz-bar-style-control">
        <label className="viz-style-label">Espacio entre columnas</label>
        <div className="viz-control-with-icons">
          <Icon name="align-justify" size={16} />
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={barGap}
            onChange={handleBarGapChange}
            className="viz-bar-style-slider"
          />
          <Icon name="align-center" size={16} />
        </div>
        <div className="viz-bar-style-value">{barGap}</div>
      </div>
    </div>
  );
};
