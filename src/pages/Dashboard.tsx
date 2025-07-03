import React, { useEffect } from "react";
import { useDashboardStore } from "../store/dashboardStore";
import { useWidgetStore } from "../store/widgetStore";
import { useThemeStore } from "../store/themeStore";
import { DashboardGrid } from "../components/dashboard/DashboardGrid";
import { Icon } from "../components/common/Icon";

export const Dashboard: React.FC = () => {
  const { currentDashboard, createDashboard, toggleEditing, isEditing } =
    useDashboardStore();
  const { addWidget } = useWidgetStore();
  const { theme, toggleTheme } = useThemeStore();

  // Create a demo dashboard if none exists
  useEffect(() => {
    if (!currentDashboard) {
      const newDashboard = createDashboard({
        name: "Mi Dashboard",
        description: "Dashboard de ejemplo",
        layout: [],
        widgets: [],
      });

      // Add some demo widgets
      const chartWidget = addWidget({
        type: "chart",
        title: "Ventas Mensuales",
        config: {
          chartType: "bar",
          data: [
            { name: "Ene", value: 120 },
            { name: "Feb", value: 190 },
            { name: "Mar", value: 300 },
            { name: "Abr", value: 500 },
            { name: "May", value: 200 },
            { name: "Jun", value: 300 },
          ],
          options: {},
        },
      });

      const metricWidget = addWidget({
        type: "metric",
        title: "Ingresos Totales",
        config: {
          value: "€52,430",
          unit: "",
          trend: "up",
          trendValue: 12.5,
        },
      });

      const textWidget = addWidget({
        type: "text",
        title: "Bienvenido",
        config: {
          content:
            "¡Bienvenido a OneDash! Este es tu dashboard personalizable donde puedes agregar widgets, gráficos y métricas.",
          fontSize: 16,
          textAlign: "center",
        },
      });

      // Update dashboard with widgets
      useDashboardStore.getState().updateDashboard(newDashboard.id, {
        widgets: [chartWidget.id, metricWidget.id, textWidget.id],
        layout: [
          { i: chartWidget.id, x: 0, y: 0, w: 8, h: 4, minW: 4, minH: 3 },
          { i: metricWidget.id, x: 8, y: 0, w: 4, h: 2, minW: 2, minH: 2 },
          { i: textWidget.id, x: 8, y: 2, w: 4, h: 2, minW: 2, minH: 2 },
        ],
      });
    }
  }, [currentDashboard, createDashboard, addWidget]);

  const handleAddWidget = () => {
    if (!currentDashboard) return;

    const newWidget = addWidget({
      type: "metric",
      title: "Nueva Métrica",
      config: {
        value: Math.floor(Math.random() * 1000),
        unit: "€",
        trend: Math.random() > 0.5 ? "up" : "down",
        trendValue: Math.floor(Math.random() * 20),
      },
    });

    // Add to dashboard
    const updatedWidgets = [...currentDashboard.widgets, newWidget.id];
    const newLayout = {
      i: newWidget.id,
      x: 0,
      y: 0,
      w: 3,
      h: 2,
      minW: 2,
      minH: 2,
    };

    useDashboardStore.getState().updateDashboard(currentDashboard.id, {
      widgets: updatedWidgets,
      layout: [...currentDashboard.layout, newLayout],
    });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            {currentDashboard?.name || "OneDash"}
          </h1>
          {currentDashboard?.description && (
            <p className="text-secondary">{currentDashboard.description}</p>
          )}
        </div>
        <div className="dashboard-actions">
          <button className="dashboard-btn" onClick={toggleTheme}>
            <Icon name={theme === "light" ? "moon" : "sun"} size={16} />
            {theme === "light" ? "Modo Oscuro" : "Modo Claro"}
          </button>
          <button className="dashboard-btn" onClick={handleAddWidget}>
            <Icon name="plus" size={16} />
            Agregar Widget
          </button>
          <button
            className={`dashboard-btn ${isEditing ? "primary" : ""}`}
            onClick={toggleEditing}
          >
            <Icon name="edit" size={16} />
            {isEditing ? "Terminar Edición" : "Editar"}
          </button>
        </div>
      </div>
      <DashboardGrid />
    </div>
  );
};
