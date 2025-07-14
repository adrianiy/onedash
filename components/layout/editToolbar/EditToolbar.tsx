import React, { useState } from "react";
import { useRouter } from "next/router";
import { useGridStore } from "@/store/gridStore";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { useGridChanges } from "@/hooks/useGridChanges";
import { useUpdateDashboardMutation } from "@/hooks/queries/dashboards";
import { useSyncWidgets } from "@/hooks/useSyncWidgets";
import { useDashboardCopy } from "./hooks/useDashboardCopy";
import { ToolbarFileActions } from "./ToolbarFileActions";
import { ToolbarWidgetActions } from "./ToolbarWidgetActions";
import { ToolbarUndoActions } from "./ToolbarUndoActions";
import { ConfigButton } from "./ConfigButton";
import { ReadonlyDashboardHandler } from "./ReadonlyDashboardHandler";
import { BreakpointSelector } from "./BreakpointSelector"; // Importamos el selector de breakpoints
import type { Dashboard } from "@/types/dashboard";
import { SaveResult } from "./types";

/**
 * Componente principal de la barra de herramientas de edición
 */
export const EditToolbar: React.FC = () => {
  // Router de Next.js para redirección
  const router = useRouter();

  // Hooks de stores
  const { isEditing, toggleEditing, openConfigSidebar } = useUIStore();

  // Hooks de cambios
  const { hasUnsavedChanges, discardChanges, clearHistory } = useGridChanges();

  // Mutaciones para dashboards
  const { mutate: updateDashboard } = useUpdateDashboardMutation();

  // Hooks para sincronizar y copiar widgets
  const { syncWidgets } = useSyncWidgets();
  const { copyDashboard } = useDashboardCopy();

  const [showReadonlyModal, setShowReadonlyModal] = useState(false);
  const [readonlyDashboard, setReadonlyDashboard] = useState<Dashboard | null>(
    null
  );

  // No renderizar si no estamos en modo edición
  if (!isEditing) return null;

  /**
   * Maneja el guardado de cambios
   */
  const handleSave = async (): Promise<SaveResult | void> => {
    try {
      const dashboard = useGridStore.getState().dashboard;

      if (!dashboard) {
        return { error: "No hay dashboard activo" };
      }

      // Comprobar si el usuario tiene permisos de edición
      const currentUser = useAuthStore.getState().user;
      const isOwner = currentUser && dashboard.userId === currentUser._id;
      const isCollaborator = dashboard.collaborators?.includes(
        currentUser?._id || ""
      );
      const canEdit = isOwner || isCollaborator;

      if (!canEdit) {
        // Mostrar modal de confirmación para dashboard readonly
        setReadonlyDashboard(dashboard);
        setShowReadonlyModal(true);
        return { needsConfirmation: true, dashboard };
      }

      try {
        // Promesa para guardar el dashboard
        const saveDashboardPromise = new Promise<void>((resolve, reject) => {
          updateDashboard(
            {
              id: dashboard._id,
              updates: {
                layouts: dashboard.layouts, // Actualizado: guardamos layouts en lugar de solo layout
                widgets: dashboard.widgets,
              },
            },
            {
              onSuccess: () => resolve(),
              onError: (error) => reject(error),
            }
          );
        });

        // Sincronizar widgets en paralelo
        const syncWidgetsPromise = syncWidgets();

        // Esperar a que se completen ambas operaciones
        await Promise.all([saveDashboardPromise, syncWidgetsPromise]);

        // Si llegamos aquí, todo se guardó correctamente
        clearHistory();

        toggleEditing();

        return { needsConfirmation: false };
      } catch (error) {
        console.error("Error al guardar dashboard o widgets:", error);
        return { error: String(error) || "Error al guardar" };
      }
    } catch (error) {
      console.error("Error saving dashboard:", error);
      return { error: String(error) || "Error al guardar el dashboard" };
    }
  };

  /**
   * Maneja el cierre del modo edición
   */
  const handleCloseEditing = async () => {
    if (hasUnsavedChanges) {
      discardChanges();
    }
    toggleEditing();
  };

  /**
   * Maneja la confirmación de copia del dashboard
   */
  const handleConfirmCopy = async (newName: string) => {
    if (readonlyDashboard) {
      try {
        // Usar el hook para copiar el dashboard y sus widgets
        const newDashboardId = await copyDashboard(readonlyDashboard, newName);

        // Cerrar modal y modo edición
        setShowReadonlyModal(false);
        setReadonlyDashboard(null);
        toggleEditing();

        // Redirigir al nuevo dashboard si tenemos un ID
        if (newDashboardId) {
          router.push(`/dashboard/${newDashboardId}`);
        }
      } catch (error) {
        console.error("Error al copiar el dashboard:", error);
      }
    }
  };

  /**
   * Maneja la cancelación de la copia
   */
  const handleCancelCopy = () => {
    setShowReadonlyModal(false);
    setReadonlyDashboard(null);
  };

  return (
    <>
      <div className="edit-toolbar">
        <div className="edit-toolbar__content">
          {/* Sección Undo/Redo */}
          <ToolbarUndoActions />

          <div className="edit-toolbar__separator" />

          {/* Sección Archivo */}
          <ToolbarFileActions
            isDiscarding={false}
            hasUnsavedChanges={hasUnsavedChanges}
            onSave={handleSave}
            onCloseEditing={handleCloseEditing}
          />

          <div className="edit-toolbar__separator" />

          {/* Sección Widgets */}
          <ToolbarWidgetActions />

          <div className="edit-toolbar__separator" />

          {/* Selector de breakpoints */}
          <BreakpointSelector />

          {/* Espacio flexible para empujar el botón de configuración a la derecha */}
          <div className="edit-toolbar__spacer"></div>

          {/* Botón de configuración */}
          <ConfigButton openConfigSidebar={openConfigSidebar} />
        </div>
      </div>

      {/* Modal de confirmación para dashboard de solo lectura */}
      <ReadonlyDashboardHandler
        isOpen={showReadonlyModal}
        dashboard={readonlyDashboard}
        onConfirm={handleConfirmCopy}
        onCancel={handleCancelCopy}
      />
    </>
  );
};
