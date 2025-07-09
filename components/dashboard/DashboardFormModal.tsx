import React, { useState, useEffect } from "react";
import { Icon } from "../common/Icon";
import type { Dashboard } from "../../types/dashboard";

interface DashboardFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dashboardData: Partial<Dashboard>) => void;
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
  // Estado para los campos del formulario
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("private");

  // Estado para validación
  const [nameError, setNameError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");

  // Inicializar el formulario con datos si estamos editando
  useEffect(() => {
    if (dashboard) {
      setName(dashboard.name || "");
      setDescription(dashboard.description || "");
      setVisibility(dashboard.visibility || "private");
    } else {
      // Valores por defecto para un nuevo dashboard
      setName("");
      setDescription("");
      setVisibility("private");
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
      });
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
                  <button
                    type="button"
                    className={`dashboard-form__visibility-btn ${
                      visibility === "public"
                        ? "dashboard-form__visibility-btn--active"
                        : ""
                    }`}
                    onClick={() => setVisibility("public")}
                  >
                    <Icon name="globe" size={16} />
                    <span>Público</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Pie del modal */}
          <div className="modal-footer">
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
