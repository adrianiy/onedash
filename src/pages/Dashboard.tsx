import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDashboardStore } from "../store/dashboardStore";
import { useVariableStore } from "../store/variableStore";
import { useWidgetStore } from "../store/widgetStore";
import { DashboardGrid } from "../components/dashboard/DashboardGrid";
import { WidgetConfigSidebar } from "../components/layout/WidgetConfigSidebar";

export const Dashboard: React.FC = () => {
  const { dashboardId } = useParams<{ dashboardId: string }>();
  const navigate = useNavigate();
  const { isEditing, dashboards, setCurrentDashboard, currentDashboard } =
    useDashboardStore();
  const {
    setCurrentDashboard: setVariableDashboard,
    initializeDashboardVariables,
  } = useVariableStore();
  const { fetchWidgetsByDashboardId } = useWidgetStore();

  // Cambiar el dashboard actual según el parámetro de la URL
  useEffect(() => {
    if (dashboardId && dashboards.length > 0) {
      const found = dashboards.find((d) => d._id === dashboardId);
      if (found) {
        setCurrentDashboard(found);
        setVariableDashboard(found._id);
      } else {
        // Si el dashboardId no es válido, redirigir al primero
        navigate(`/dashboard/${dashboards[0]._id}`, { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardId, dashboards, setCurrentDashboard, setVariableDashboard]);

  // Sincronizar variables con el dashboard actual
  useEffect(() => {
    if (currentDashboard) {
      // Inicializar variables para este dashboard
      initializeDashboardVariables(currentDashboard._id);
    }
  }, [currentDashboard, initializeDashboardVariables]);

  // Cargar widgets cuando cambia el dashboard actual
  useEffect(() => {
    if (currentDashboard && /^[0-9a-f]{24}$/.test(currentDashboard._id)) {
      // Solo cargar widgets si es un dashboard de MongoDB
      fetchWidgetsByDashboardId(currentDashboard._id);
    }
  }, [currentDashboard, fetchWidgetsByDashboardId]);

  useEffect(() => {
    if (isEditing) {
      document.body.classList.add("editing");
    } else {
      document.body.classList.remove("editing");
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove("editing");
    };
  }, [isEditing]);

  return (
    <div className={`dashboard-container ${isEditing ? "editing" : ""}`}>
      <DashboardGrid />
      <WidgetConfigSidebar />
    </div>
  );
};
