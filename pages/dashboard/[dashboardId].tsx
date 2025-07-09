import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useDashboardStore } from "../../store/dashboardStore";
import { useVariableStore } from "../../store/variableStore";
import { useWidgetStore } from "../../store/widgetStore";
import { DashboardGrid } from "../../components/dashboard/DashboardGrid";
import { WidgetConfigSidebar } from "../../components/layout/WidgetConfigSidebar";
import { Header } from "../../components/layout/Header";
import { FilterBar } from "../../components/layout/FilterBar";
import { FloatingActionBar } from "../../components/layout/FloatingActionBar";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";
import { useAuthStore } from "../../store/authStore";
import { useState } from "react";

export default function Dashboard() {
  const router = useRouter();
  const { dashboardId } = router.query;
  const { isEditing, dashboards, setCurrentDashboard, currentDashboard } =
    useDashboardStore();
  const {
    setCurrentDashboard: setVariableDashboard,
    initializeDashboardVariables,
  } = useVariableStore();
  const { fetchWidgetsByDashboardId } = useWidgetStore();
  const { isAuthenticated } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Cambiar el dashboard actual según el parámetro de la URL
  useEffect(() => {
    if (dashboardId && dashboards.length > 0) {
      const found = dashboards.find((d) => d._id === dashboardId);
      if (found) {
        setCurrentDashboard(found);
        setVariableDashboard(found._id);
      } else {
        // Si el dashboardId no es válido, redirigir al primero
        router.push(`/dashboard/${dashboards[0]._id}`);
      }
    }
  }, [
    dashboardId,
    dashboards,
    setCurrentDashboard,
    setVariableDashboard,
    router,
  ]);

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

  if (!isAuthenticated) {
    return null; // El ProtectedRoute manejará la redirección
  }

  return (
    <ProtectedRoute>
      <Header />
      <FilterBar />
      <div className={`dashboard-container ${isEditing ? "editing" : ""}`}>
        <DashboardGrid />
        <WidgetConfigSidebar />
      </div>
      <FloatingActionBar
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />
      <DashboardSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
    </ProtectedRoute>
  );
}
