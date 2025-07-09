import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Header } from "./components/layout/Header";
import { FilterBar } from "./components/layout/FilterBar";
import { FloatingActionBar } from "./components/layout/FloatingActionBar";
import { DashboardSidebar } from "./components/layout/DashboardSidebar";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { useThemeStore } from "./store/themeStore";
import { useDashboardStore } from "./store/dashboardStore";
import { useAuthStore } from "./store/authStore";
import "react-tooltip/dist/react-tooltip.css";

// Este componente se encarga de renderizar las rutas y manejar el estado global
function App() {
  const { theme } = useThemeStore();
  const { fetchDashboards } = useDashboardStore();
  const { checkAuth, isAuthenticated } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Establecer el tema
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Cargar dashboards al cargar la aplicación (solo si está autenticado)
  useEffect(() => {
    const init = async () => {
      if (isAuthenticated) {
        // Cargar dashboards desde MongoDB
        await fetchDashboards();
      }
    };

    init();
  }, [fetchDashboards, isAuthenticated]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <BrowserRouter>
      {/* AppRoutes contiene todas las rutas y componentes que necesitan acceso al router */}
      <AppRoutes
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        closeSidebar={closeSidebar}
      />
    </BrowserRouter>
  );
}

// Interfaces para los props
interface AppRoutesProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

// Este componente usa hooks que necesitan estar dentro de Router
const AppRoutes = ({
  isSidebarOpen,
  toggleSidebar,
  closeSidebar,
}: AppRoutesProps) => {
  const { isAuthenticated } = useAuthStore();
  const location = window.location;

  // Helper para verificar si estamos en una página de autenticación
  const isAuthPage = () => {
    return location.pathname === "/login" || location.pathname === "/register";
  };

  return (
    <>
      <Header />
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={
              <>
                <FilterBar />
                <Navigate to="/dashboard/default" replace />
              </>
            }
          />
          <Route
            path="/dashboard/:dashboardId"
            element={
              <>
                <FilterBar />
                <Dashboard />
              </>
            }
          />
        </Route>

        {/* Redireccionamiento por defecto */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      {/* Mostrar estos componentes solo cuando el usuario está autenticado y no en páginas de auth */}
      {isAuthenticated && !isAuthPage() && (
        <>
          <FloatingActionBar
            onToggleSidebar={toggleSidebar}
            isSidebarOpen={isSidebarOpen}
          />
          <DashboardSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        </>
      )}
    </>
  );
};

export default App;
