import React, { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useNewsStore } from "@/store/newsStore";
import { Icon } from "@/common/Icon";
import { GuidesModal } from "@/common/GuidesModal";
import { WhatsNewModal } from "@/common/WhatsNewModal";
import {
  useFloating,
  offset,
  flip,
  shift,
  arrow,
  autoUpdate,
  useClick,
  useDismiss,
  useInteractions,
  FloatingArrow,
} from "@floating-ui/react";

interface UserAvatarProps {
  name?: string;
  size?: number;
  className?: string;
  email?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name = "Usuario",
  size = 32,
  className = "",
  email,
}) => {
  const { logout, user } = useAuthStore();
  const { hasUnreadNews } = useNewsStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isGuidesModalOpen, setIsGuidesModalOpen] = useState(false);
  const [isWhatsNewModalOpen, setIsWhatsNewModalOpen] = useState(false);
  const arrowRef = useRef(null);

  // Verificar si hay novedades no leídas
  const hasUnread = hasUnreadNews();

  // Obtener iniciales del nombre
  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();
  };

  const initials = getInitials(name);
  const displayEmail = email || user?.email || "";

  // Configuración del menú flotante
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "bottom-end",
    middleware: [offset(8), flip(), shift(), arrow({ element: arrowRef })],
    whileElementsMounted: autoUpdate,
  });

  // Evento de click para abrir/cerrar
  const click = useClick(context);
  // Cerrar al hacer click fuera o presionar Escape
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
  ]);

  // Cerrar panel cuando cambie la ruta
  useEffect(() => {
    return () => {
      setIsOpen(false);
    };
  }, []);

  return (
    <div className="user-avatar__container">
      <div
        ref={refs.setReference}
        {...getReferenceProps()}
        className={`user-avatar ${className} ${
          isOpen ? "user-avatar--active" : ""
        }`}
        style={{
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
        }}
      >
        <span className="user-avatar-initials">{initials}</span>
      </div>

      {isOpen && (
        <div
          ref={refs.setFloating}
          {...getFloatingProps()}
          style={floatingStyles}
          className="user-avatar__panel"
        >
          <FloatingArrow
            ref={arrowRef}
            context={context}
            className="user-avatar__panel-arrow"
          />

          <div className="user-avatar__panel-header">
            <div className="user-avatar__panel-avatar">
              <span>{initials}</span>
            </div>
            <div className="user-avatar__panel-user-info">
              <h4 className="user-avatar__panel-name">{name}</h4>
              {displayEmail && (
                <p className="user-avatar__panel-email">{displayEmail}</p>
              )}
            </div>
          </div>

          <div className="user-avatar__panel-divider"></div>

          <div className="user-avatar__panel-menu">
            <button
              className="user-avatar__panel-item"
              onClick={() => {
                setIsWhatsNewModalOpen(true);
                setIsOpen(false);
              }}
            >
              <div className="user-avatar__panel-item-icon">
                <Icon name="bell" size={16} />
                {hasUnread && (
                  <div className="user-avatar__notification-badge"></div>
                )}
              </div>
              <span>Últimas novedades</span>
            </button>

            <button
              className="user-avatar__panel-item"
              onClick={() => {
                setIsGuidesModalOpen(true);
                setIsOpen(false);
              }}
            >
              <Icon name="list-todo" size={16} />
              <span>Ver guías</span>
            </button>

            <button
              className="user-avatar__panel-item user-avatar__panel-item--danger"
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
            >
              <Icon name="log-out" size={16} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal de guías */}
      <GuidesModal
        isOpen={isGuidesModalOpen}
        onClose={() => setIsGuidesModalOpen(false)}
      />

      {/* Modal de novedades */}
      <WhatsNewModal
        isOpen={isWhatsNewModalOpen}
        onClose={() => setIsWhatsNewModalOpen(false)}
      />
    </div>
  );
};
