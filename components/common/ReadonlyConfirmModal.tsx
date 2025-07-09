import React, { useState } from "react";
import { Icon } from "./Icon";
import type { Dashboard } from "../../types/dashboard";

interface ReadonlyConfirmModalProps {
  isOpen: boolean;
  dashboard: Dashboard;
  onConfirm: (newName: string) => void;
  onCancel: () => void;
}

export const ReadonlyConfirmModal: React.FC<ReadonlyConfirmModalProps> = ({
  isOpen,
  dashboard,
  onConfirm,
  onCancel,
}) => {
  const [newName, setNewName] = useState(`${dashboard.name} - Copia`);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(newName.trim() || `${dashboard.name} - Copia`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleConfirm();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header__icon">
            <Icon name="alert-circle" size={24} />
          </div>
          <h2 className="modal-header__title">Sin permisos de edición</h2>
          <button
            className="modal-header__close"
            onClick={onCancel}
            title="Cerrar"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-body__message">
            No tienes permisos para editar este dashboard, ya que no eres el
            propietario ni colaborador del mismo. Para guardar tus cambios, se
            creará una nueva copia que podrás editar libremente.
          </p>

          <div className="modal-body__input-group">
            <label htmlFor="dashboard-name" className="modal-body__label">
              Nombre de la nueva copia:
            </label>
            <input
              id="dashboard-name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="modal-body__input"
              placeholder="Nombre del dashboard..."
              autoFocus
            />
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="modal-footer__button modal-footer__button--secondary"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            className="modal-footer__button modal-footer__button--primary"
            onClick={handleConfirm}
            disabled={!newName.trim()}
          >
            <Icon name="copy" size={16} />
            Crear copia
          </button>
        </div>
      </div>
    </div>
  );
};
