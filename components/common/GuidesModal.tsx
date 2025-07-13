import React from "react";
import { Icon } from "./Icon";
import { useWizardStore } from "@/store/wizardStore";

interface GuidesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuidesModal: React.FC<GuidesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { setVisible, setShowToggleButton } = useWizardStore();

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleOpenGuide = () => {
    setVisible(true);
    setShowToggleButton(true); // Aseguramos que el botón toggle esté visible cuando se abre la guía
    onClose(); // Cerrar el modal
  };

  return (
    <div className="guides-modal__overlay" onClick={handleBackdropClick}>
      <div className="guides-modal">
        <div className="guides-modal__header">
          <h3 className="guides-modal__title">
            <Icon name="list-todo" size={20} />
            Guías disponibles
          </h3>
          <button
            className="guides-modal__close-btn"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        <div className="guides-modal__content">
          <div className="guides-modal__guide-item">
            <div className="guides-modal__guide-info" onClick={handleOpenGuide}>
              <h4 className="guides-modal__guide-title">Guía de bienvenida</h4>
              <p className="guides-modal__guide-description">
                Aprende las funcionalidades principales de OneDash con esta guía
                paso a paso.
              </p>
            </div>
            <button className="guides-modal__guide-btn">
              <Icon name="arrow-right" size={16} />
              Abrir guía
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
