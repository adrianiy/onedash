import { useAuthStore } from "../store/authStore";

const BASE_URL = "/api";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
  message?: string;
}

/**
 * Define si un error HTTP es recuperable (puede ser reintentado)
 */
const isRetryableError = (status: number): boolean => {
  // Errores del servidor (500, 502, 503, 504) son generalmente recuperables
  return status >= 500 && status < 600;
};

/**
 * Maneja los errores de las respuestas de la API
 * Si el error es 401 (Unauthorized), redirige automáticamente a la página de login
 * Si el error es 5xx, lo marca como reintentable
 */
const handleApiError = (response: Response, endpoint?: string) => {
  if (response.status === 401) {
    // Usuario no autorizado, limpiar estado de autenticación
    const { user, isAuthenticated } = useAuthStore.getState();

    console.warn(`❌ Error 401 en ${endpoint || "API"}: Usuario no autorizado`);

    // Solo realizar estas acciones si hay un usuario autenticado
    if (user || isAuthenticated) {
      // Limpiar el estado de autenticación
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: "Sesión expirada o no válida",
      });

      console.info("🔄 Estado de autenticación limpiado");
    }

    // Evitar redirección múltiple
    if (
      !window.location.pathname.includes("/login") &&
      !window.location.pathname.includes("/register")
    ) {
      console.info("🔄 Redirigiendo a login...");
      window.location.href = "/login";
    }

    throw new Error("Sesión expirada o no válida");
  }

  // Verificar si es un error recuperable (5xx)
  const isRetryable = isRetryableError(response.status);

  // Crear un error personalizado con información adicional
  const error = new Error(
    isRetryable
      ? "Ha ocurrido un error temporal. Puedes reintentar la operación."
      : `HTTP Error: ${response.status} - ${response.statusText}`
  );

  // Añadir propiedades adicionales al error
  (error as any).status = response.status;
  (error as any).isRetryable = isRetryable;
  (error as any).originalResponse = response;

  throw error;
};

export const apiService = {
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      handleApiError(response, endpoint);
    }

    return response.json();
  },

  async post<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      handleApiError(response, endpoint);
    }

    return response.json();
  },

  async put<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      handleApiError(response, endpoint);
    }

    return response.json();
  },

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      handleApiError(response, endpoint);
    }

    return response.json();
  },
};
