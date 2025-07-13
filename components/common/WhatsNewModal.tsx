import React, { useState } from "react";
import { Icon, type IconName } from "./Icon";
import { useNewsStore } from "@/store/newsStore";

// Componente reutilizable para el acordeón
interface AccordionSectionProps {
  title: string;
  icon: IconName;
  count: number;
  defaultOpen?: boolean;
  className?: string;
  children: React.ReactNode;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({
  title,
  icon,
  count,
  defaultOpen = false,
  className = "",
  children,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`whats-new-modal__section ${className}`}>
      <button
        className={`whats-new-modal__accordion-header ${
          isOpen ? "whats-new-modal__accordion-header--open" : ""
        }`}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <div className="whats-new-modal__accordion-title">
          <Icon name={icon} size={18} />
          <span>{title}</span>
          <span className="whats-new-modal__badge">{count}</span>
        </div>
        <div className="whats-new-modal__accordion-icon">
          <Icon name={isOpen ? "chevron-up" : "chevron-down"} size={16} />
        </div>
      </button>

      {isOpen && (
        <div className="whats-new-modal__accordion-content">{children}</div>
      )}
    </div>
  );
};

interface WhatsNewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsNewModal: React.FC<WhatsNewModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { items, markAsRead, updateLastViewedDate } = useNewsStore();

  if (!isOpen) return null;

  // Dividir las novedades por categoría
  const functionalNews = items.filter((item) => item.category === "functional");
  const technicalNews = items.filter((item) => item.category === "technical");

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Marcar todas como leídas al cerrar
  const handleClose = () => {
    items.forEach((item) => markAsRead(item.id));
    updateLastViewedDate();
    onClose();
  };

  return (
    <div className="whats-new-modal__overlay" onClick={handleBackdropClick}>
      <div className="whats-new-modal">
        <div className="whats-new-modal__header">
          <h3 className="whats-new-modal__title">
            <Icon name="bell" size={20} />
            Novedades de OneDash
          </h3>
          <button
            className="whats-new-modal__close-btn"
            onClick={handleClose}
            aria-label="Cerrar modal"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        <div className="whats-new-modal__content">
          {/* Sección Funcional - Acordeón abierto por defecto */}
          <AccordionSection
            title="Mejoras Funcionales"
            icon="layout-dashboard"
            count={functionalNews.length}
            defaultOpen={true}
          >
            <div className="whats-new-modal__items-container">
              {functionalNews.map((item) => (
                <div key={item.id} className="whats-new-modal__item">
                  <div className="whats-new-modal__item-icon">
                    <Icon name={item.icon} size={24} />
                  </div>
                  <div className="whats-new-modal__item-content">
                    <h4 className="whats-new-modal__item-title">
                      {item.title}
                    </h4>
                    <p className="whats-new-modal__item-description">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </AccordionSection>

          {/* Sección Técnica - Acordeón cerrado por defecto */}
          <AccordionSection
            title="Mejoras Técnicas"
            icon="hash"
            count={technicalNews.length}
            defaultOpen={false}
            className="whats-new-modal__section--technical"
          >
            <div className="whats-new-modal__items-container">
              {technicalNews.map((item) => (
                <div key={item.id} className="whats-new-modal__item">
                  <div className="whats-new-modal__item-icon">
                    <Icon name={item.icon} size={24} />
                  </div>
                  <div className="whats-new-modal__item-content">
                    <h4 className="whats-new-modal__item-title">
                      {item.title}
                    </h4>
                    <p className="whats-new-modal__item-description">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </AccordionSection>
        </div>
      </div>
    </div>
  );
};
