import React from "react";
import { Icon } from "@/common/Icon";

interface DashboardEmptyPlaceholderProps {
  isEditing: boolean;
}

export const DashboardEmptyPlaceholder: React.FC<
  DashboardEmptyPlaceholderProps
> = ({ isEditing }) => {
  if (isEditing) {
    return (
      <div className="dashboard-empty-placeholder dashboard-empty-placeholder--editing">
        <Icon
          name="layout-grid"
          size={48}
          className="dashboard-empty-placeholder__icon dashboard-empty-placeholder__icon--editing"
        />
        <h3>¡Empieza a crear tu dashboard!</h3>
        <p>
          Arrastra widgets desde la barra de herramientas o haz clic en los
          botones para añadirlos
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-empty-placeholder">
      <Icon
        name="layout-dashboard"
        size={48}
        className="dashboard-empty-placeholder__icon dashboard-empty-placeholder__icon--viewing"
      />
      <h3>Dashboard vacío</h3>
      <p>Este dashboard no tiene widgets configurados</p>
    </div>
  );
};
