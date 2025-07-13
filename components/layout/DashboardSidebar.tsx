import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useGridStore } from "@/store/gridStore";
import { useAuthStore } from "@/store/authStore";
import { Icon } from "@/common/Icon";
import { DashboardFormModal } from "@/components/dashboard/DashboardFormModal";
import { DeleteConfirmModal } from "@/common/DeleteConfirmModal";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import type { Dashboard } from "@/types/dashboard";
import {
  useDashboardsQuery,
  useSavedDashboardsQuery,
  useCreateDashboardMutation,
  useUpdateDashboardMutation,
  useDeleteDashboardMutation,
} from "@/hooks/queries";

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();

  // Hooks de React Query para datos y mutaciones
  const { data: allDashboards = [], isLoading: isLoadingDashboards } =
    useDashboardsQuery();

  const { data: savedDashboards = [], isLoading: isLoadingSavedDashboards } =
    useSavedDashboardsQuery();

  // Estado para almacenar dashboards filtrados
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);

  // Al cargar los dashboards, inicializar con todos
  useEffect(() => {
    if (allDashboards) {
      setDashboards(allDashboards);
    }
  }, [allDashboards]);
  const {
    mutate: createDashboard,
    isPending: isCreating,
    isSuccess: isCreateSuccess,
    data: newCreatedDashboard,
  } = useCreateDashboardMutation();
  const {
    mutate: updateDashboard,
    isPending: isUpdating,
    isSuccess: isUpdateSuccess,
  } = useUpdateDashboardMutation();
  const {
    mutate: deleteDashboard,
    isPending: isDeleting,
    isSuccess: isDeleteSuccess,
    variables: deletingDashboardId,
  } = useDeleteDashboardMutation();

  // Estado del dashboard actual desde gridStore
  const { dashboard: currentDashboard, setDashboard } = useGridStore();

  // Estados locales
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [dashboardToEdit, setDashboardToEdit] = useState<Dashboard | undefined>(
    undefined
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [dashboardToDelete, setDashboardToDelete] = useState<Dashboard | null>(
    null
  );

  const processedCreation = useRef(false);
  const processedUpdate = useRef(false);

  // Filtrar dashboards según la búsqueda
  const filteredDashboards = dashboards.filter((dashboard) =>
    dashboard.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Efectos para manejar resultados de mutaciones

  // Efecto para manejar la creación exitosa de dashboard
  useEffect(() => {
    if (isCreateSuccess && newCreatedDashboard && !processedCreation.current) {
      processedCreation.current = true;
      setIsFormModalOpen(false);
      // setDashboard(newCreatedDashboard);
      router.push(`/dashboard/${newCreatedDashboard._id}`);
      onClose();
    }
  }, [isCreateSuccess, newCreatedDashboard, setDashboard, router, onClose]);

  // Efecto para manejar la actualización exitosa de dashboard
  useEffect(() => {
    if (isUpdateSuccess && !processedUpdate.current) {
      processedUpdate.current = true;
      setIsFormModalOpen(false);
    }
  }, [isUpdateSuccess]);

  // Efecto para manejar la eliminación exitosa de dashboard
  useEffect(() => {
    if (!isDeleting && isDeleteSuccess && dashboardToDelete) {
      setIsDeleteModalOpen(false);
      setDashboardToDelete(null);

      // Si el dashboard eliminado era el actual, limpiar el estado
      if (currentDashboard && currentDashboard._id === dashboardToDelete._id) {
        setDashboard(dashboards[0]);
        router.push(`/dashboard/${dashboards[0]._id}`);
      }
    }
  }, [
    isDeleting,
    isDeleteSuccess,
    dashboardToDelete,
    currentDashboard,
    setDashboard,
    router,
    dashboards,
  ]);

  // Handlers

  const handleOpenCreateModal = () => {
    setDashboardToEdit(undefined);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (e: React.MouseEvent, dashboard: Dashboard) => {
    e.stopPropagation();
    setDashboardToEdit(dashboard);
    setIsFormModalOpen(true);
  };

  const handleSaveDashboard = (dashboardData: Partial<Dashboard>) => {
    // Si estamos editando un dashboard existente
    if (dashboardToEdit) {
      processedUpdate.current = false;
      updateDashboard({
        id: dashboardToEdit._id,
        updates: dashboardData,
      });
    }
    // Si estamos creando un nuevo dashboard
    else {
      processedCreation.current = false;

      // Obtener el ID del usuario actual
      const currentUser = useAuthStore.getState().user;

      createDashboard({
        name: dashboardData.name || `Dashboard ${dashboards.length + 1}`,
        description: dashboardData.description || "",
        visibility: dashboardData.visibility || "private",
        userId: currentUser?._id || "",
        // Inicializar con arrays vacíos
        layouts: { lg: [], md: [], sm: [], xs: [], xxs: [] },
        widgets: [],
        collaborators: [],
      });
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

  const handleConfirmDelete = () => {
    if (!dashboardToDelete) return;

    deleteDashboard(dashboardToDelete._id);
  };

  const handleCloseDeleteModal = () => {
    if (isDeleting) return; // No cerrar si está eliminando
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

          {/* Pestañas para filtrar dashboards */}
          <DashboardTabs
            dashboards={allDashboards}
            savedDashboards={savedDashboards}
            isLoading={isLoadingDashboards || isLoadingSavedDashboards}
            onTabChange={setDashboards}
            className="dashboard-sidebar-tabs"
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
            {isLoadingDashboards || isLoadingSavedDashboards ? (
              <div className="loading-state">
                <Icon name="loader" size={24} className="animate-spin" />
                <p>Cargando dashboards...</p>
              </div>
            ) : filteredDashboards.length === 0 ? (
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
                  <div className="dashboard-item__header">
                    <h3 className="dashboard-name">{dashboard.name}</h3>
                    {isOwner(dashboard) && (
                      <div className="dashboard-actions">
                        <button
                          className="dashboard-action-btn edit"
                          onClick={(e) => handleOpenEditModal(e, dashboard)}
                          title="Editar dashboard"
                        >
                          <Icon name="edit" size={14} />
                        </button>
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
                      </div>
                    )}
                  </div>
                  <div className="dashboard-info">
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
        isLoading={isCreating || isUpdating}
      />

      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Eliminar Dashboard"
        message={`¿Estás seguro de que quieres eliminar "${dashboardToDelete?.name}"? Se eliminarán todos los widgets y configuraciones asociados.`}
        isLoading={isDeleting}
      />
    </>
  );
};
