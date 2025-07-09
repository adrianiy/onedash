import { useEffect } from "react";
import { useRouter } from "next/router";
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
  const router = useRouter();

  // Verificar autenticación al montar el componente
  useEffect(() => {
    const verifyAuth = async () => {
      if (!isAuthenticated && !isLoading) {
        await checkAuth();
      }
    };

    verifyAuth();
  }, [isAuthenticated, isLoading, checkAuth]);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectPath);
    }
  }, [isAuthenticated, isLoading, router, redirectPath]);

  // Si está cargando, mostrar loading
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <p>Verificando autenticación...</p>
      </div>
    );
  }

  // Si no está autenticado, no mostrar nada (se redirigirá)
  if (!isAuthenticated) {
    return null;
  }

  // Si está autenticado, mostrar los hijos
  return <>{children}</>;
};
