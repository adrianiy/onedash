import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/authStore";
import { Icon } from "@/common/Icon";

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
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const isCheckingAuth = useRef(false);

  // Verificar autenticación al montar el componente (solo una vez)
  useEffect(() => {
    const verifyAuth = async () => {
      if (!hasCheckedAuth && !isCheckingAuth.current) {
        isCheckingAuth.current = true;
        try {
          await checkAuth();
        } finally {
          setHasCheckedAuth(true);
          isCheckingAuth.current = false;
        }
      }
    };

    verifyAuth();
  }, [hasCheckedAuth, checkAuth]);

  // Redirigir si no está autenticado (solo después de verificar)
  useEffect(() => {
    if (hasCheckedAuth && !isLoading && !isAuthenticated) {
      console.log(
        "🔄 ProtectedRoute: Redirigiendo usuario no autenticado a",
        redirectPath
      );
      router.replace(redirectPath);
    }
  }, [hasCheckedAuth, isAuthenticated, isLoading, router, redirectPath]);

  // Mostrar loading mientras verifica autenticación o está cargando
  if (!hasCheckedAuth || isLoading) {
    return (
      <div className="auth-page">
        <div className="auth-page__loader-container">
          <div className="auth-page__loader-content">
            <Icon name="loader" className="auth-page__loader-icon" size={48} />
            <p className="auth-page__loader-text">
              Verificando autenticación...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar loading mientras redirige
  if (!isAuthenticated) {
    return (
      <div className="auth-page">
        <div className="auth-page__loader-container">
          <div className="auth-page__loader-content">
            <Icon name="loader" className="auth-page__loader-icon" size={48} />
            <p className="auth-page__loader-text">Redirigiendo...</p>
          </div>
        </div>
      </div>
    );
  }

  // Si está autenticado, mostrar los hijos
  return <>{children}</>;
};
