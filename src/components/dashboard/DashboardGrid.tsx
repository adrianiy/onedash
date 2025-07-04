import React from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { useDashboardStore } from "../../store/dashboardStore";
import { useWidgetStore } from "../../store/widgetStore";
import { useGridLayout } from "../../hooks/useGridLayout";
import { WidgetContainer } from "./WidgetContainer";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardGridProps {
  className?: string;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  className = "",
}) => {
  const {
    currentDashboard,
    tempDashboard,
    isEditing,
    selectedWidgetId,
    clearSelection,
  } = useDashboardStore();
  const { getWidgetsByIds } = useWidgetStore();
  const { getGridProps } = useGridLayout();

  // En modo edición usar tempDashboard, si no usar currentDashboard
  const activeDashboard =
    isEditing && tempDashboard ? tempDashboard : currentDashboard;

  if (!activeDashboard) {
    return (
      <div className="flex items-center justify-center h-64 text-muted">
        <p>No dashboard selected</p>
      </div>
    );
  }

  const widgets = getWidgetsByIds(activeDashboard.widgets);
  const gridProps = getGridProps();

  const handleGridClick = (e: React.MouseEvent) => {
    // Si el click es en el contenedor del grid (no en un widget), limpiar selección
    if (e.target === e.currentTarget) {
      clearSelection();
    }
  };

  return (
    <div className={`dashboard-grid ${className}`} onClick={handleGridClick}>
      <ResponsiveGridLayout
        {...gridProps}
        layouts={{ lg: activeDashboard.layout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      >
        {widgets.map((widget) => (
          <div key={widget.id} className="react-grid-item">
            <WidgetContainer
              widget={widget}
              isSelected={selectedWidgetId === widget.id}
            />
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};
