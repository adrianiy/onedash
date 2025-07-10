import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useDashboardStore } from "../../store/dashboardStore";
import { useWidgetStore } from "../../store/widgetStore";
import { useVariableLoader } from "../../hooks/useVariableLoader";
import { DashboardGrid } from "../../components/dashboard/DashboardGrid";
import { WidgetConfigSidebar } from "../../components/layout/WidgetConfigSidebar";
import { Header } from "../../components/layout/Header";
import { FilterBar } from "../../components/layout/FilterBar";
import { FloatingActionBar } from "../../components/layout/FloatingActionBar";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";
import { useState } from "react";

export default function Dashboard() {
  const router = useRouter();
  const { dashboardId } = router.query;
  const { isEditing, dashboards, setCurrentDashboard, currentDashboard } =
    useDashboardStore();
  const { fetchWidgetsByDashboardId } = useWidgetStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Usar el hook para cargar variables automáticamente
  useVariableLoader(typeof dashboardId === "string" ? dashboardId : null);

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
      } else {
        // Si el dashboardId no es válido, redirigir al primero
        router.push(`/dashboard/${dashboards[0]._id}`);
      }
    }
  }, [dashboardId, dashboards, setCurrentDashboard, router]);

  // Cargar widgets cuando cambia el dashboard actual (solo ID específico)
  useEffect(() => {
    if (currentDashboard && /^[0-9a-f]{24}$/.test(currentDashboard._id)) {
      // Solo cargar widgets si es un dashboard de MongoDB
      fetchWidgetsByDashboardId(currentDashboard._id);
    }
  }, [currentDashboard?._id, fetchWidgetsByDashboardId]);

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
