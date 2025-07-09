import { create } from "zustand";
import { signIn as nextAuthSignIn, signOut, getSession } from "next-auth/react";

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
   * Iniciar sesión con email y contraseña usando NextAuth
   */
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const result = await nextAuthSignIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.ok && !result.error) {
        // Get session to update state
        const session = await getSession();
        if (session?.user) {
          set({
            user: {
              _id: session.user.id,
              name: session.user.name || "",
              email: session.user.email || "",
              role: session.user.role as "user" | "admin",
            },
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return true;
        }
      }

      set({
        isLoading: false,
        error: result?.error || "Error al iniciar sesión",
      });
      return false;
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
   * Cerrar sesión usando NextAuth
   */
  logout: async () => {
    set({ isLoading: true });

    try {
      await signOut({ redirect: false });
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      return true;
    } catch {
      set({
        isLoading: false,
        error: "Error al cerrar sesión",
      });
      return false;
    }
  },

  /**
   * Verificar si el usuario está autenticado usando NextAuth
   */
  checkAuth: async () => {
    set({ isLoading: true });

    try {
      const session = await getSession();

      if (session?.user) {
        set({
          user: {
            _id: session.user.id,
            name: session.user.name || "",
            email: session.user.email || "",
            role: session.user.role as "user" | "admin",
          },
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
          error: null,
        });
        return false;
      }
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      return false;
    }
  },

  /**
   * Limpiar errores
   */
  clearError: () => set({ error: null }),
}));
