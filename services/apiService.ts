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
 * Maneja los errores de las respuestas de la API
 * Si el error es 401 (Unauthorized), redirige automáticamente a la página de login
 */
const handleApiError = (response: Response) => {
  if (response.status === 401) {
    // Usuario no autorizado, limpiar estado de autenticación
    const { user } = useAuthStore.getState();

    // Solo realizar estas acciones si hay un usuario autenticado
    if (user) {
      // Limpiar el estado de autenticación
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        error: "Sesión expirada o no válida",
      });
    }

    // Redirigir a la página de login
    window.location.href = "/login";
    throw new Error("Sesión expirada o no válida");
  }

  throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
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
      handleApiError(response);
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
      handleApiError(response);
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
      handleApiError(response);
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
      handleApiError(response);
    }

    return response.json();
  },
};
