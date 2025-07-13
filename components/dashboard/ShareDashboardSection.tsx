import React from "react";
import { Icon } from "@/common/Icon";
import { CollaboratorSelector } from "./CollaboratorSelector";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface ShareDashboardSectionProps {
  isShared: boolean;
  onShareStatusChange: (isShared: boolean) => void;
  collaborators: User[];
  onCollaboratorsChange: (collaborators: User[]) => void;
  dashboardId?: string;
  disabled?: boolean;
}

export const ShareDashboardSection: React.FC<ShareDashboardSectionProps> = ({
  isShared,
  onShareStatusChange,
  collaborators,
  onCollaboratorsChange,
  disabled = false,
}) => {
  // Manejar el cambio en el estado de compartido
  const handleShareToggle = () => {
    onShareStatusChange(!isShared);
  };

  return (
    <div className="share-dashboard-section">
      {/* Toggle para compartir el dashboard */}
      <div className="share-dashboard-section__option">
        <div className="share-dashboard-section__option-content">
          <div className="share-dashboard-section__option-icon">
            <Icon name="link" size={18} />
          </div>
          <div className="share-dashboard-section__option-details">
            <span className="share-dashboard-section__option-title">
              Compartir con enlace
            </span>
            <span className="share-dashboard-section__option-description">
              Cualquier persona con el enlace podrá ver este dashboard
            </span>
          </div>
        </div>
        <button
          className={`share-dashboard-section__toggle ${
            isShared ? "share-dashboard-section__toggle--active" : ""
          }`}
          onClick={handleShareToggle}
          type="button"
          disabled={disabled}
        >
          <div
            className={`share-dashboard-section__toggle-slider ${
              isShared ? "share-dashboard-section__toggle-slider--active" : ""
            }`}
          ></div>
        </button>
      </div>

      {/* Sección para gestionar colaboradores */}
      {isShared && (
        <div className="share-dashboard-section__collaborators">
          <div className="share-dashboard-section__collaborators-description">
            Añade usuarios que pueden editar este dashboard
          </div>
          <CollaboratorSelector
            collaborators={collaborators}
            onCollaboratorsChange={onCollaboratorsChange}
            disabled={disabled}
          />
        </div>
      )}

      {/* Nota informativa */}
      {isShared && (
        <div className="share-dashboard-section__note">
          <Icon name="info" size={14} />
          <span>
            Los usuarios con permisos de edición podrán modificar este
            dashboard, pero no eliminarlo ni cambiar su configuración de
            compartir.
          </span>
        </div>
      )}
    </div>
  );
};
