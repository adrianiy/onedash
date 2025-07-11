import React from "react";

interface TableControlsContainerProps {
  topControls?: React.ReactNode;
  rightControls?: React.ReactNode;
  bottomControls?: React.ReactNode;
  children: React.ReactNode; // El preview de la tabla
}

export const TableControlsContainer: React.FC<TableControlsContainerProps> = ({
  topControls,
  rightControls,
  bottomControls,
  children,
}) => {
  return (
    <div className="viz-table-configurator">
      {/* Controles superiores */}
      {topControls && (
        <div className="viz-table-controls viz-table-controls--top">
          {topControls}
        </div>
      )}

      {/* Preview de la tabla */}
      {children}

      {/* Controles laterales */}
      {rightControls && (
        <div className="viz-table-controls viz-table-controls--right">
          {rightControls}
        </div>
      )}

      {/* Controles inferiores */}
      {bottomControls && (
        <div className="viz-table-controls viz-table-controls--bottom">
          {bottomControls}
        </div>
      )}
    </div>
  );
};
