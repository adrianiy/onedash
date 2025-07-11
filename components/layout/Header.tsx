import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useDashboardStore } from "@/store/dashboardStore";
import { useThemeStore } from "@/store/themeStore";
import { useAuthStore } from "@/store/authStore";
import { Icon } from "@/common/Icon";
import { UserAvatar } from "./UserAvatar";
import { EditToolbar } from "./EditToolbar";

export const Header: React.FC = () => {
  const { currentDashboard } = useDashboardStore();
  const { theme, toggleTheme } = useThemeStore();
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Verificar si estamos en una ruta de autenticación (login o registro)
  const isAuthPage =
    router.pathname === "/login" || router.pathname === "/register";

  return (
    <>
      <header className="app-header">
        <div className="app-header-content">
          <div className="app-header-left">
            <h1 className="app-title">OneDash</h1>
            {currentDashboard && (
              <span className="app-subtitle">{currentDashboard.name}</span>
            )}
          </div>

          <div className="app-header-right">
            <div className="app-header-actions">
              <button
                className="header-action-btn"
                onClick={toggleTheme}
                title={theme === "light" ? "Modo Oscuro" : "Modo Claro"}
              >
                <Icon name={theme === "light" ? "moon" : "sun"} size={16} />
              </button>

              {isAuthenticated ? (
                <UserAvatar
                  name={user?.name || "Usuario"}
                  email={user?.email}
                  size={36}
                  className="header-user-avatar"
                />
              ) : !isAuthPage ? (
                <div className="auth-links">
                  <Link href="/login" className="auth-link">
                    Iniciar sesión
                  </Link>
                  <Link href="/register" className="auth-link">
                    Registrarse
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>
      {isAuthenticated && !isAuthPage && <EditToolbar />}
    </>
  );
};
