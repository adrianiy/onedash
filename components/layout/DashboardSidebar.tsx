import React, { useState } from "react";
import { useRouter } from "next/router";
import { useDashboardStore } from "@/store/dashboardStore";
import { useAuthStore } from "@/store/authStore";
import { Icon } from "@/common/Icon";
import { DashboardFormModal } from "@/components/dashboard/DashboardFormModal";
import { DeleteConfirmModal } from "@/common/DeleteConfirmModal";
import type { Dashboard } from "@/types/dashboard";

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
    updateDashboard,
    setCurrentDashboard,
    deleteDashboard,
    isLoading,
    deletingDashboardId,
  } = useDashboardStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [dashboardToEdit, setDashboardToEdit] = useState<Dashboard | undefined>(
    undefined
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [dashboardToDelete, setDashboardToDelete] = useState<Dashboard | null>(
    null
  );

  const filteredDashboards = dashboards.filter((dashboard) =>
    dashboard.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenCreateModal = () => {
    setDashboardToEdit(undefined);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (e: React.MouseEvent, dashboard: Dashboard) => {
    e.stopPropagation();
    setDashboardToEdit(dashboard);
    setIsFormModalOpen(true);
  };

  const router = useRouter();

  const handleSaveDashboard = async (dashboardData: Partial<Dashboard>) => {
    // Si estamos editando un dashboard existente
    if (dashboardToEdit) {
      const success = await updateDashboard(dashboardToEdit._id, dashboardData);
      if (success) {
        setIsFormModalOpen(false);
        // La store ya actualiza los dashboards, no necesitamos hacer nada más
      }
    }
    // Si estamos creando un nuevo dashboard
    else {
      // Obtener el ID del usuario actual
      const currentUser = useAuthStore.getState().user;
      console.log(currentUser);

      const newDashboard = await createDashboard({
        name: dashboardData.name || `Dashboard ${dashboards.length + 1}`,
        description: dashboardData.description || "",
        visibility: dashboardData.visibility || "private",
        layout: [],
        widgets: [],
        userId: currentUser?._id || "", // Usar el ID del usuario actual
      });

      if (newDashboard) {
        setIsFormModalOpen(false);
        setCurrentDashboard(newDashboard);
        router.push(`/dashboard/${newDashboard._id}`);
        onClose(); // Cerrar sidebar automáticamente
      }
    }
  };

  const handleSelectDashboard = (dashboard: Dashboard) => {
    router.push(`/dashboard/${dashboard._id}`);
    onClose();
  };

  const handleOpenDeleteModal = (e: React.MouseEvent, dashboard: Dashboard) => {
    e.stopPropagation();
    setDashboardToDelete(dashboard);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!dashboardToDelete) return;

    const success = await deleteDashboard(dashboardToDelete._id);
    if (success) {
      setIsDeleteModalOpen(false);
      setDashboardToDelete(null);
    }
    // Si falla, el modal se cerrará cuando termine el loading
    // pero se podría manejar el error aquí si es necesario
  };

  const handleCloseDeleteModal = () => {
    if (deletingDashboardId) return; // No cerrar si está eliminando
    setIsDeleteModalOpen(false);
    setDashboardToDelete(null);
  };

  // Verificar si el usuario actual es propietario del dashboard
  const isOwner = (dashboard: Dashboard) => {
    const currentUser = useAuthStore.getState().user;
    return currentUser && dashboard.userId === currentUser._id;
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
            onClick={handleOpenCreateModal}
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
                  key={dashboard._id}
                  className={`dashboard-item ${
                    currentDashboard?._id === dashboard._id ? "active" : ""
                  } ${deletingDashboardId === dashboard._id ? "deleting" : ""}`}
                  onClick={() => handleSelectDashboard(dashboard)}
                >
                  <div className="dashboard-info">
                    <h3 className="dashboard-name">{dashboard.name}</h3>
                    <p className="dashboard-description">
                      {dashboard.description || "Sin descripción"}
                    </p>
                    <div className="dashboard-item__visibility">
                      <Icon
                        name={
                          dashboard.visibility === "public" ? "globe" : "lock"
                        }
                        size={12}
                      />
                      <span>
                        {dashboard.visibility === "public"
                          ? "Público"
                          : "Privado"}
                      </span>
                    </div>
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
                    {isOwner(dashboard) && (
                      <button
                        className="dashboard-action-btn edit"
                        onClick={(e) => handleOpenEditModal(e, dashboard)}
                        title="Editar dashboard"
                      >
                        <Icon name="edit" size={14} />
                      </button>
                    )}
                    {isOwner(dashboard) && (
                      <button
                        className="dashboard-action-btn delete"
                        onClick={(e) => handleOpenDeleteModal(e, dashboard)}
                        title="Eliminar dashboard"
                        disabled={deletingDashboardId === dashboard._id}
                      >
                        {deletingDashboardId === dashboard._id ? (
                          <Icon
                            name="loader"
                            size={14}
                            className="animate-spin"
                          />
                        ) : (
                          <Icon name="trash" size={14} />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal de creación/edición de dashboard */}
      <DashboardFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveDashboard}
        dashboard={dashboardToEdit}
        isLoading={isLoading}
      />

      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Eliminar Dashboard"
        message={`¿Estás seguro de que quieres eliminar "${dashboardToDelete?.name}"? Se eliminarán todos los widgets y configuraciones asociados.`}
        isLoading={!!deletingDashboardId}
      />
    </>
  );
};
