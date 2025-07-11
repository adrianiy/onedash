import React from "react";
import { CustomColorPicker } from "@/common/CustomColorPicker";
import { ConfigDropdown } from "@/components/widgets/common/ConfigDropdown";
import type { MetricDefinition } from "@/types/metricConfig";

interface SeriesColorChipProps {
  series: MetricDefinition & { visible?: boolean };
  color: string;
  onColorChange: (seriesId: string, color: string) => void;
}

export const SeriesColorChip: React.FC<SeriesColorChipProps> = ({
  series,
  color,
  onColorChange,
}) => {
  const handleColorChange = (newColor: string) => {
    onColorChange(series.id, newColor);
  };

  // Generar nombre de la serie
  const getSeriesName = () => {
    // Usar displayName si está disponible
    if (series.displayName) return series.displayName;

    // Usar title como fallback
    if (series.title) return series.title;

    // Generar nombre basado en indicador
    if (typeof series.indicator === "string") {
      return series.indicator;
    } else if (
      series.indicator &&
      typeof series.indicator === "object" &&
      "key" in series.indicator
    ) {
      return `Variable: ${series.indicator.key}`;
    }

    return "Serie";
  };

  return (
    <div className="series-color-chip">
      <ConfigDropdown
        className="color-picker-dropdown"
        placement="top"
        usePortal={true}
        triggerElement={({ ref, onClick, referenceProps }) => (
          <button
            ref={ref}
            className="series-color-chip__button"
            onClick={onClick}
            type="button"
            {...referenceProps}
          >
            <div
              className="series-color-chip__color-swatch"
              style={{ backgroundColor: color }}
            />
            <span className="series-color-chip__name">{getSeriesName()}</span>
          </button>
        )}
      >
        <CustomColorPicker value={color} onChange={handleColorChange} />
      </ConfigDropdown>
    </div>
  );
};
