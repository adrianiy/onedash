import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

interface ProtectedRouteProps {
  redirectPath?: string;
  children?: React.ReactNode;
}

export const ProtectedRoute = ({
  redirectPath = "/login",
  children,
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const location = useLocation();

  // Verificar autenticación al montar el componente
  useEffect(() => {
    const verifyAuth = async () => {
      if (!isAuthenticated && !isLoading) {
        await checkAuth();
      }
    };

    verifyAuth();
  }, [isAuthenticated, isLoading, checkAuth]);

  // Si está cargando, mostramos nada por ahora
  // Podría añadirse un componente de carga aquí
  if (isLoading) {
    return null;
  }

  // Si no está autenticado, redirigir a la ruta especificada
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Si está autenticado, mostrar los hijos o el Outlet
  return children ? <>{children}</> : <Outlet />;
};
