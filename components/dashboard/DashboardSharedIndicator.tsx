import React, { useState, useEffect } from "react";
import { Icon } from "@/common/Icon";
import type { Dashboard } from "@/types/dashboard";
import {
  useSaveDashboardMutation,
  useUnsaveDashboardMutation,
  useSavedDashboardsQuery,
} from "@/hooks/queries/dashboards";
import { useAuthStore } from "@/store/authStore";

interface DashboardSharedIndicatorProps {
  dashboard: Dashboard;
}

export const DashboardSharedIndicator: React.FC<
  DashboardSharedIndicatorProps
> = ({ dashboard }) => {
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [visible, setVisible] = useState(true);
  const { user } = useAuthStore();

  // Obtener los dashboards guardados para verificar si este ya está guardado
  const { data: savedDashboards } = useSavedDashboardsQuery();

  // Mutations para guardar/eliminar de guardados
  const { mutate: saveDashboard, isPending: isSavePending } =
    useSaveDashboardMutation();
  const { mutate: unsaveDashboard, isPending: isUnsavePending } =
    useUnsaveDashboardMutation();

  // Verificar si este dashboard ya está en la lista de guardados
  useEffect(() => {
    if (savedDashboards) {
      console.log(savedDashboards, dashboard);
      const isAlreadySaved = savedDashboards.some(
        (d: Dashboard) => d._id === dashboard._id
      );
      setSaved(isAlreadySaved);
    } else {
      setSaved(false);
    }
  }, [savedDashboards, dashboard._id]);

  // Solo mostrar el indicador si el dashboard está compartido, el usuario no es el propietario,
  // no lo tiene guardado y es visible
  if (
    !dashboard.isShared ||
    !visible ||
    dashboard.userId === user?._id ||
    saved
  ) {
    return null;
  }

  const handleSaveToFavorites = () => {
    if (saved) {
      // Si ya está guardado, eliminarlo
      setIsSaving(true);
      unsaveDashboard(dashboard._id, {
        onSuccess: () => {
          setSaved(false);
          setShowFeedback(true);
          setTimeout(() => {
            setShowFeedback(false);
            setVisible(false); // Ocultar indicador después de mostrar feedback
          }, 2000); // Ocultar mensaje después de 2 segundos
          setIsSaving(false);
        },
        onError: (error: Error) => {
          console.error("Error al eliminar de guardados:", error);
          setIsSaving(false);
        },
      });
    } else {
      // Si no está guardado, agregarlo
      setIsSaving(true);
      saveDashboard(dashboard._id, {
        onSuccess: () => {
          setSaved(true);
          setShowFeedback(true);
          setTimeout(() => {
            setShowFeedback(false);
            setVisible(false); // Ocultar indicador después de mostrar feedback
          }, 2000); // Ocultar mensaje después de 2 segundos
          setIsSaving(false);
        },
        onError: (error: Error) => {
          console.error("Error al guardar dashboard:", error);
          setIsSaving(false);
        },
      });
    }
  };

  const handleClose = () => {
    setVisible(false);
  };

  return (
    <div className="dashboard-shared-indicator">
      <div className="dashboard-shared-indicator__content">
        <Icon name="link" size={16} />
        <span>Dashboard compartido</span>

        <button
          className="dashboard-shared-indicator__action-btn"
          onClick={handleSaveToFavorites}
          title={saved ? "Eliminar de guardados" : "Guardar en compartidos"}
          disabled={isSaving || isSavePending || isUnsavePending}
        >
          {isSaving || isSavePending || isUnsavePending ? (
            <>
              <Icon name="loader" size={14} className="animate-spin" />
              <span>Procesando...</span>
            </>
          ) : showFeedback ? (
            <>
              <Icon name={saved ? "check" : "x"} size={14} />
              <span>{saved ? "Guardado" : "Eliminado"}</span>
            </>
          ) : saved ? (
            <span>Guardado</span>
          ) : (
            <span>Guardar</span>
          )}
        </button>
        <button
          className="dashboard-shared-indicator__close-btn"
          onClick={handleClose}
          title="Cerrar"
          aria-label="Cerrar indicador"
        >
          <Icon name="x" size={14} />
        </button>
      </div>
    </div>
  );
};
