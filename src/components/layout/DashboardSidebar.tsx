import React, { useState } from "react";
import { useDashboardStore } from "../../store/dashboardStore";
import { Icon } from "../common/Icon";
import type { Dashboard } from "../../types/dashboard";

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    dashboards,
    currentDashboard,
    createDashboard,
    setCurrentDashboard,
    deleteDashboard,
  } = useDashboardStore();

  const [searchTerm, setSearchTerm] = useState("");

  const filteredDashboards = dashboards.filter((dashboard) =>
    dashboard.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateDashboard = () => {
    const newDashboard = createDashboard({
      name: `Dashboard ${dashboards.length + 1}`,
      description: "Nuevo dashboard",
      layout: [],
      widgets: [],
    });
    setCurrentDashboard(newDashboard);
  };

  const handleSelectDashboard = (dashboard: Dashboard) => {
    setCurrentDashboard(dashboard);
    onClose();
  };

  const handleDeleteDashboard = (e: React.MouseEvent, dashboardId: string) => {
    e.stopPropagation();
    if (
      window.confirm("¿Estás seguro de que quieres eliminar este dashboard?")
    ) {
      deleteDashboard(dashboardId);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <div className={`dashboard-sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Dashboards</h2>
          <button className="sidebar-close-btn" onClick={onClose}>
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="sidebar-search">
          <input
            type="text"
            placeholder="Buscar dashboards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="sidebar-content">
          <button
            className="create-dashboard-btn"
            onClick={handleCreateDashboard}
          >
            <Icon name="plus" size={16} />
            <span>Crear Nuevo Dashboard</span>
          </button>

          <div className="dashboard-list">
            {filteredDashboards.length === 0 ? (
              <div className="empty-state">
                <Icon name="grid" size={48} />
                <p>No se encontraron dashboards</p>
                {searchTerm && (
                  <button
                    className="clear-search-btn"
                    onClick={() => setSearchTerm("")}
                  >
                    Limpiar búsqueda
                  </button>
                )}
              </div>
            ) : (
              filteredDashboards.map((dashboard) => (
                <div
                  key={dashboard.id}
                  className={`dashboard-item ${
                    currentDashboard?.id === dashboard.id ? "active" : ""
                  }`}
                  onClick={() => handleSelectDashboard(dashboard)}
                >
                  <div className="dashboard-info">
                    <h3 className="dashboard-name">{dashboard.name}</h3>
                    <p className="dashboard-description">
                      {dashboard.description || "Sin descripción"}
                    </p>
                    <div className="dashboard-meta">
                      <span className="dashboard-widgets">
                        {dashboard.widgets.length} widgets
                      </span>
                      <span className="dashboard-date">
                        {formatDate(dashboard.updatedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="dashboard-actions">
                    <button
                      className="dashboard-action-btn delete"
                      onClick={(e) => handleDeleteDashboard(e, dashboard.id)}
                      title="Eliminar dashboard"
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};
