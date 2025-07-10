import React, { useEffect, useRef } from "react";
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
  const {
    isEditing,
    dashboards,
    setCurrentDashboard,
    currentDashboard,
    discardChanges,
  } = useDashboardStore();
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

  // Crear una referencia para rastrear el dashboardId anterior
  const previousDashboardIdRef = useRef<string | null>(null);

  // Cambiar el dashboard actual según el parámetro de la URL y gestionar el modo edición
  useEffect(() => {
    if (dashboardId && dashboards.length > 0) {
      const dashIdStr = typeof dashboardId === "string" ? dashboardId : null;
      const found = dashboards.find((d) => d._id === dashIdStr);

      if (found) {
        // Verificar si realmente estamos cambiando de dashboard
        const isDashboardChanging =
          previousDashboardIdRef.current !== null &&
          previousDashboardIdRef.current !== dashIdStr;

        // Si estamos cambiando de dashboard y en modo edición, salir del modo edición
        if (isDashboardChanging && isEditing) {
          discardChanges();
        }

        // Establecer el dashboard actual
        setCurrentDashboard(found);

        // Actualizar la referencia al dashboardId actual
        previousDashboardIdRef.current = dashIdStr;

        // Cargar widgets solo si realmente cambiamos de dashboard
        if (
          (isDashboardChanging || !previousDashboardIdRef.current) &&
          found &&
          /^[0-9a-f]{24}$/.test(found._id)
        ) {
          fetchWidgetsByDashboardId(found._id);
        }
      } else {
        // Si el dashboardId no es válido, redirigir al primero
        router.push(`/dashboard/${dashboards[0]._id}`);
      }
    }
  }, [
    dashboardId,
    dashboards,
    setCurrentDashboard,
    router,
    isEditing,
    discardChanges,
    fetchWidgetsByDashboardId,
  ]);

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
