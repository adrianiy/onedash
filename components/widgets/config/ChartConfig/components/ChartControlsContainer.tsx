import React from "react";

interface ChartControlsContainerProps {
  topControls?: React.ReactNode;
  rightControls?: React.ReactNode;
  bottomControls?: React.ReactNode;
  children: React.ReactNode; // El preview del gráfico
}

export const ChartControlsContainer: React.FC<ChartControlsContainerProps> = ({
  topControls,
  rightControls,
  bottomControls,
  children,
}) => {
  return (
    <div className="viz-chart-configurator">
      {/* Controles superiores */}
      {topControls && (
        <div className="viz-chart-controls viz-chart-controls--top">
          {topControls}
        </div>
      )}

      {/* Preview del gráfico */}
      {children}

      {/* Controles laterales */}
      {rightControls && (
        <div className="viz-chart-controls viz-chart-controls--right">
          {rightControls}
        </div>
      )}

      {/* Controles inferiores */}
      {bottomControls && (
        <div className="viz-chart-controls viz-chart-controls--bottom">
          {bottomControls}
        </div>
      )}
    </div>
  );
};
