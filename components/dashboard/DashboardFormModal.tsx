import React, { useState, useEffect } from "react";
import { Tooltip } from "react-tooltip";
import { Icon } from "@/common/Icon";
import { CollaboratorSelector } from "./CollaboratorSelector";
import { ShareDashboardSection } from "./ShareDashboardSection";
import { useAuthStore } from "@/store/authStore";
import type { Dashboard } from "@/types/dashboard";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface DashboardFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    dashboardData: Partial<Dashboard> & { collaborators?: string[] }
  ) => void;
  dashboard?: Dashboard; // Si se proporciona, estamos editando un dashboard existente
  isLoading?: boolean;
}

export const DashboardFormModal: React.FC<DashboardFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  dashboard,
  isLoading = false,
}) => {
  const { user } = useAuthStore();

  // Estado para los campos del formulario
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("private");
  const [isShared, setIsShared] = useState(false);
  const [collaborators, setCollaborators] = useState<User[]>([]);
  const [copied, setCopied] = useState(false);

  // Estado para validación
  const [nameError, setNameError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");

  // Verificar si el usuario tiene permisos para crear dashboards públicos
  const canCreatePublic = user?.permissions?.includes("publisher") || false;

  // Inicializar el formulario con datos si estamos editando
  useEffect(() => {
    if (dashboard) {
      setName(dashboard.name || "");
      setDescription(dashboard.description || "");
      setVisibility(dashboard.visibility || "private");
      setIsShared(dashboard.isShared || false);

      // Cargar colaboradores existentes si están disponibles
      if (dashboard.collaborators && dashboard.collaborators.length > 0) {
        fetchCollaboratorsData(dashboard.collaborators);
      } else {
        setCollaborators([]);
      }
    } else {
      // Valores por defecto para un nuevo dashboard
      setName("");
      setDescription("");
      setVisibility("private");
      setIsShared(false);
      setCollaborators([]);
    }
    // Limpiar errores
    setNameError("");
    setDescriptionError("");
  }, [dashboard, isOpen]);

  // Validar el nombre
  const validateName = (value: string): boolean => {
    if (!value.trim()) {
      setNameError("El nombre es obligatorio");
      return false;
    } else if (value.length > 100) {
      setNameError("El nombre no puede tener más de 100 caracteres");
      return false;
    } else {
      setNameError("");
      return true;
    }
  };

  // Validar la descripción
  const validateDescription = (value: string): boolean => {
    if (value.length > 500) {
      setDescriptionError(
        "La descripción no puede tener más de 500 caracteres"
      );
      return false;
    } else {
      setDescriptionError("");
      return true;
    }
  };

  // Función para obtener datos de colaboradores
  const fetchCollaboratorsData = async (collaboratorIds: string[]) => {
    try {
      // Esta es una implementación ejemplo, debería adaptarse a tu API
      const response = await fetch(
        "/api/users/search?ids=" + collaboratorIds.join(",")
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCollaborators(data.data);
        }
      }
    } catch (error) {
      console.error("Error fetching collaborators data:", error);
    }
  };

  // Manejar el envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar todos los campos
    const isNameValid = validateName(name);
    const isDescriptionValid = validateDescription(description);

    if (isNameValid && isDescriptionValid) {
      // Enviar datos al componente padre
      onSave({
        name,
        description,
        visibility,
        collaborators:
          visibility === "public" || isShared
            ? collaborators.map((c) => c._id)
            : [],
        isShared: visibility === "private" ? isShared : false, // Solo aplica a dashboards privados
      });

      // Disparar evento para la guía si estamos creando un dashboard privado
      if (!dashboard && visibility === "private") {
        // Crear y disparar un evento personalizado
        const event = new CustomEvent("dashboard-private-created");
        document.dispatchEvent(event);
      }

      // Disparar evento para la guía si estamos editando un dashboard
      if (dashboard) {
        // Evento de edición de dashboard
        const event = new CustomEvent("dashboard-edit-opened");
        document.dispatchEvent(event);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content dashboard-form__modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado del modal */}
        <div className="modal-header">
          <h2 className="modal-header__title">
            {dashboard ? "Editar Dashboard" : "Crear Nuevo Dashboard"}
          </h2>
          <button className="modal-header__close" onClick={onClose}>
            <Icon name="x" size={20} />
          </button>
        </div>

        {/* Cuerpo del modal */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="dashboard-form__field">
              <input
                id="dashboard-name"
                type="text"
                className={`modal-body__input dashboard-form__input ${
                  nameError ? "dashboard-form__input--error" : ""
                }`}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  validateName(e.target.value);
                }}
                placeholder="Nombre del dashboard *"
              />
              {nameError && (
                <p className="dashboard-form__error">{nameError}</p>
              )}
            </div>

            <div className="dashboard-form__field">
              <textarea
                id="dashboard-description"
                className={`modal-body__input dashboard-form__textarea ${
                  descriptionError ? "dashboard-form__input--error" : ""
                }`}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  validateDescription(e.target.value);
                }}
                placeholder="Descripción del dashboard (opcional)"
                rows={4}
              ></textarea>
              {descriptionError && (
                <p className="dashboard-form__error">{descriptionError}</p>
              )}
            </div>

            <div className="dashboard-form__field">
              <div className="dashboard-form__visibility-section">
                <h4 className="dashboard-form__section-title">Visibilidad</h4>
                <div className="dashboard-form__visibility-controls">
                  <button
                    type="button"
                    className={`dashboard-form__visibility-btn ${
                      visibility === "private"
                        ? "dashboard-form__visibility-btn--active"
                        : ""
                    }`}
                    onClick={() => setVisibility("private")}
                  >
                    <Icon name="lock" size={16} />
                    <span>Privado</span>
                  </button>
                  <div className="dashboard-form__public-btn-wrapper">
                    <button
                      type="button"
                      className={`dashboard-form__visibility-btn ${
                        visibility === "public"
                          ? "dashboard-form__visibility-btn--active"
                          : ""
                      } ${
                        !canCreatePublic
                          ? "dashboard-form__visibility-btn--disabled"
                          : ""
                      }`}
                      onClick={() => canCreatePublic && setVisibility("public")}
                      disabled={!canCreatePublic}
                      data-tooltip-id="public-btn-tooltip"
                      data-tooltip-content={
                        !canCreatePublic
                          ? "Necesitas el permiso 'publisher' para crear dashboards públicos"
                          : ""
                      }
                    >
                      <Icon name="globe" size={16} />
                      <span>Público</span>
                    </button>
                    {!canCreatePublic && (
                      <Tooltip
                        id="public-btn-tooltip"
                        place="top"
                        style={{
                          backgroundColor: "var(--color-text-primary)",
                          color: "var(--color-surface)",
                          fontSize: "0.75rem",
                          borderRadius: "var(--radius-sm)",
                          padding: "var(--spacing-sm) var(--spacing-md)",
                          boxShadow: "var(--shadow-md)",
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {visibility === "public" && canCreatePublic && (
              <div className="dashboard-form__field">
                <div className="dashboard-form__collaborators-section">
                  <h4 className="dashboard-form__section-title">
                    Colaboradores (opcional)
                  </h4>
                  <p className="dashboard-form__section-description">
                    Los colaboradores podrán editar este dashboard público.
                  </p>
                  <CollaboratorSelector
                    collaborators={collaborators}
                    onCollaboratorsChange={setCollaborators}
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            {visibility === "private" && (
              <div className="dashboard-form__field">
                <ShareDashboardSection
                  isShared={isShared}
                  onShareStatusChange={setIsShared}
                  collaborators={collaborators}
                  onCollaboratorsChange={setCollaborators}
                  dashboardId={dashboard?._id || ""}
                  disabled={isLoading}
                />
              </div>
            )}
          </div>

          {/* Pie del modal */}
          <div className="modal-footer">
            {visibility === "private" && isShared && dashboard?._id && (
              <button
                type="button"
                className="modal-footer__button modal-footer__button--link"
                onClick={() => {
                  const shareUrl =
                    typeof window !== "undefined"
                      ? `${window.location.origin}/dashboard/${dashboard._id}`
                      : "";

                  if (navigator.clipboard && shareUrl) {
                    navigator.clipboard.writeText(shareUrl).then(() => {
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000); // Resetear después de 2 segundos

                      // Disparar evento para la guía cuando se copia el enlace
                      const event = new CustomEvent("dashboard-link-copied");
                      document.dispatchEvent(event);
                    });
                  }
                }}
                disabled={isLoading}
              >
                {copied ? (
                  <>
                    <Icon name="check" size={16} />
                    <span>Enlace copiado</span>
                  </>
                ) : (
                  <>
                    <Icon name="copy" size={16} />
                    <span>Copiar enlace</span>
                  </>
                )}
              </button>
            )}
            <button
              type="button"
              className="modal-footer__button modal-footer__button--secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="modal-footer__button modal-footer__button--primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Icon name="loader" size={16} className="animate-spin" />
                  <span>{dashboard ? "Guardando..." : "Creando..."}</span>
                </>
              ) : (
                <span>{dashboard ? "Guardar" : "Crear"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
