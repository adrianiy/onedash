import React, { useState } from "react";
import { Icon } from "@/common/Icon";
import type { Dashboard } from "@/types/dashboard";

interface DashboardSharedIndicatorProps {
  dashboard: Dashboard;
}

export const DashboardSharedIndicator: React.FC<
  DashboardSharedIndicatorProps
> = ({ dashboard }) => {
  const [saved, setSaved] = useState(false);

  // Solo mostrar el indicador si el dashboard está compartido
  if (!dashboard.isShared) {
    return null;
  }

  const handleSaveToFavorites = () => {
    // Aquí iría la lógica para guardar en compartidos/favoritos
    setSaved(true);
    setTimeout(() => setSaved(false), 2000); // Resetear después de 2 segundos
  };

  return (
    <div className="dashboard-shared-indicator">
      <div className="dashboard-shared-indicator__content">
        <Icon name="globe" size={16} />
        <span>Dashboard compartido</span>

        <button
          className="dashboard-shared-indicator__action-btn"
          onClick={handleSaveToFavorites}
          title="Guardar en compartidos"
        >
          {saved ? (
            <>
              <Icon name="star" size={14} />
              <span>Guardado</span>
            </>
          ) : (
            <>
              <Icon name="star" size={14} />
              <span>Guardar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
