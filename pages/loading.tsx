import { LoaderPage } from "@/components/common";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

export default function Loading() {
  const router = useRouter();
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [hasInitialized, setHasInitialized] = useState(false);
  const isProcessing = useRef(false);

  // Efecto para verificar autenticación (solo se ejecuta una vez)
  useEffect(() => {
    if (!hasInitialized && !isProcessing.current) {
      isProcessing.current = true;
      checkAuth().finally(() => {
        setHasInitialized(true);
        isProcessing.current = false;
      });
    }
  }, [hasInitialized, checkAuth]);

  // Efecto para manejar redirección después de verificar autenticación
  useEffect(() => {
    if (!hasInitialized || isProcessing.current) return;

    const handleRedirect = async () => {
      if (isLoading) return;

      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      router.push("/dashboard");
    };

    handleRedirect();
  }, [hasInitialized, isAuthenticated, isLoading, router]);

  return (
    <LoaderPage
      title="ONE - Cargando"
      message="Iniciando sesión..."
      requiresAuth={false}
    />
  );
}
