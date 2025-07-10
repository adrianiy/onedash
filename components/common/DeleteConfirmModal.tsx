import React from "react";
import { Icon } from "./Icon";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  return (
    <div
      className="delete-confirm-modal__overlay"
      onClick={handleBackdropClick}
    >
      <div className="delete-confirm-modal">
        <div className="delete-confirm-modal__header">
          <div className="delete-confirm-modal__icon">
            <Icon name="warning" size={24} />
          </div>
          <h3 className="delete-confirm-modal__title">{title}</h3>
        </div>

        <div className="delete-confirm-modal__content">
          <p className="delete-confirm-modal__message">{message}</p>
          <div className="delete-confirm-modal__warning">
            <Icon name="info" size={16} />
            <span>Esta acción no se puede deshacer</span>
          </div>
        </div>

        <div className="delete-confirm-modal__actions">
          <button
            className="delete-confirm-modal__cancel-btn"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            className="delete-confirm-modal__confirm-btn"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Icon name="loader" size={16} className="animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Icon name="trash" size={16} />
                Eliminar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
