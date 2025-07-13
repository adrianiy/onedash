import { ErrorPage, LoaderPage } from "@/components/common";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { DashboardSharedIndicator } from "@/components/dashboard/DashboardSharedIndicator";
import { AppWizard } from "@/components/wizard/AppWizard";
import {
  useDashboardByIdQuery,
  useWidgetsByDashboardIdQuery,
} from "@/hooks/queries";
import { useVariableLoader } from "@/hooks/useVariableLoader";
import { DashboardSidebar } from "@/layout/DashboardSidebar";
import { FilterBar } from "@/layout/FilterBar";
import { FloatingActionBar } from "@/layout/FloatingActionBar";
import { Header } from "@/layout/Header";
import { WidgetConfigSidebar } from "@/layout/WidgetConfigSidebar";
import { useGridStore } from "@/store/gridStore";
import { useUIStore } from "@/store/uiStore";
import type { Dashboard } from "@/types/dashboard";
import type { Widget } from "@/types/widget";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

export default function Dashboard() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { dashboardId } = router.query;
  const dashboardIdString =
    typeof dashboardId === "string" ? dashboardId : null;

  // Crear una referencia para rastrear el dashboardId anterior
  const previousDashboardIdRef = useRef<string | null>(null);

  // Usar los nuevos stores
  const { isEditing } = useUIStore();
  const { setDashboard, setWidgets } = useGridStore();

  // Usar React Query para obtener el dashboard por ID sin callback onSuccess
  const {
    data: dashboard,
    isLoading: isLoadingDashboard,
    error: dashboardError,
  } = useDashboardByIdQuery(dashboardIdString);

  // Usar useEffect para actualizar el gridStore cuando cambian los datos del dashboard
  useEffect(() => {
    if (dashboard) {
      // Actualizar el dashboard en el gridStore
      setDashboard(dashboard);

      // Actualizar la referencia al dashboardId actual
      previousDashboardIdRef.current = dashboardIdString;
    }
  }, [dashboard, dashboardIdString, setDashboard]);

  // Usar React Query para obtener widgets por dashboard ID sin callback onSuccess
  const {
    data: widgetsData,
    isLoading: isLoadingWidgets,
    error: widgetsError,
  } = useWidgetsByDashboardIdQuery(dashboardIdString);

  // Usar useEffect para actualizar el gridStore cuando cambian los datos de widgets
  useEffect(() => {
    if (widgetsData && widgetsData.length > 0) {
      // Convertir array de widgets a un objeto indexado por ID
      const widgetsById = widgetsData.reduce((acc, widget) => {
        acc[widget._id] = widget;
        return acc;
      }, {} as Record<string, Widget>);

      // Actualizar el gridStore con los widgets
      setWidgets(widgetsById);
    }
  }, [widgetsData, setWidgets]);

  // Usar el hook para cargar variables automáticamente
  useVariableLoader(dashboardIdString);

  // Reemplazar las funciones de manejo del sidebar con los métodos de uiStore
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    // Emitir evento para el wizard
    document.dispatchEvent(new CustomEvent("sidebar-toggle"));
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // UseEffect para gestionar la clase CSS 'editing' del body
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

  // Combinar errores de dashboard y widgets
  const error = dashboardError || widgetsError;

  // Mostrar mensaje de error si ocurre algún problema
  if (error) {
    return (
      <ErrorPage message={`Error al cargar el dashboard: ${error.message}`} />
    );
  }

  // Mostrar estado de carga para dashboard y widgets
  const isLoading = isLoadingDashboard || isLoadingWidgets;
  if (isLoading || !dashboard) {
    return <LoaderPage />;
  }

  return (
    <>
      <Head>
        <title>ONE - {(dashboard as Dashboard)?.name || "Dashboard"}</title>
      </Head>
      <ProtectedRoute>
        <Header />
        <FilterBar />
        <DashboardSharedIndicator dashboard={dashboard} />
        <div className={`dashboard-container ${isEditing ? "editing" : ""}`}>
          <DashboardGrid />
          <WidgetConfigSidebar />
        </div>
        <FloatingActionBar
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />
        <DashboardSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        <AppWizard />
      </ProtectedRoute>
    </>
  );
}
