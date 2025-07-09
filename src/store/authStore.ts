import { create } from "zustand";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Acciones
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
  checkAuth: () => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  /**
   * Iniciar sesión con email y contraseña
   */
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        set({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        set({
          isLoading: false,
          error: data.error || "Error al iniciar sesión",
        });
        return false;
      }
    } catch {
      set({
        isLoading: false,
        error: "Error de conexión al servidor",
      });
      return false;
    }
  },

  /**
   * Registrar nuevo usuario
   */
  register: async (name: string, email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (data.success) {
        set({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        set({
          isLoading: false,
          error: data.error || "Error al registrar usuario",
        });
        return false;
      }
    } catch {
      set({
        isLoading: false,
        error: "Error de conexión al servidor",
      });
      return false;
    }
  },

  /**
   * Cerrar sesión
   */
  logout: async () => {
    set({ isLoading: true });

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        set({
          isLoading: false,
          error: data.error || "Error al cerrar sesión",
        });
        return false;
      }
    } catch {
      set({
        isLoading: false,
        error: "Error de conexión al servidor",
      });
      return false;
    }
  },

  /**
   * Verificar si el usuario está autenticado
   */
  checkAuth: async () => {
    set({ isLoading: true });

    try {
      const response = await fetch("/api/auth/me");
      const data = await response.json();

      if (data.success) {
        set({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null, // No consideramos error si no está autenticado
        });
        return false;
      }
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null, // No consideramos error si falla la verificación
      });
      return false;
    }
  },

  /**
   * Limpiar errores
   */
  clearError: () => set({ error: null }),
}));
