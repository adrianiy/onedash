import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useGridStore } from "@/store/gridStore";
import { ThemeSelector } from "./ThemeSelector";
import { useAuthStore } from "@/store/authStore";
import { useNewsStore } from "@/store/newsStore";
import { UserAvatar } from "./UserAvatar";
import { EditToolbar } from "./editToolbar";
import { NewsBanner } from "@/common/NewsBanner";
import { WhatsNewModal } from "@/common/WhatsNewModal";

export const Header: React.FC = () => {
  const { dashboard } = useGridStore();
  const { user, isAuthenticated } = useAuthStore();
  const { hasUnreadNews } = useNewsStore();
  const router = useRouter();
  const [isWhatsNewModalOpen, setIsWhatsNewModalOpen] = useState(false);

  // Verificar si estamos en una ruta de autenticación (login o registro)
  const isAuthPage =
    router.pathname === "/login" || router.pathname === "/register";

  // Verificar si hay novedades no leídas
  const hasUnread = isAuthenticated && hasUnreadNews();

  return (
    <>
      <header className="app-header">
        <div className="app-header-content">
          <div className="app-header-left">
            <h1 className="app-title">OneDash</h1>
            {dashboard && (
              <span className="app-subtitle">{dashboard.name}</span>
            )}
          </div>

          <div className="app-header-right">
            <div className="app-header-actions">
              <ThemeSelector />

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

      {/* Banner de novedades solo para usuarios autenticados y si hay novedades no leídas */}
      {isAuthenticated && !isAuthPage && hasUnread && (
        <NewsBanner onOpenNewsModal={() => setIsWhatsNewModalOpen(true)} />
      )}

      {isAuthenticated && !isAuthPage && <EditToolbar />}

      {/* Modal de novedades */}
      <WhatsNewModal
        isOpen={isWhatsNewModalOpen}
        onClose={() => setIsWhatsNewModalOpen(false)}
      />
    </>
  );
};
