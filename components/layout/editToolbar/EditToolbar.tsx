import React, { useState } from "react";
import { useDashboardStore } from "@/store/dashboardStore";
import { useWidgetStore } from "@/store/widgetStore";
import { useAuthStore } from "@/store/authStore";
import { ToolbarFileActions } from "./ToolbarFileActions";
import { ToolbarWidgetActions } from "./ToolbarWidgetActions";
import { ConfigButton } from "./ConfigButton";
import { ReadonlyDashboardHandler } from "./ReadonlyDashboardHandler";
import type { Dashboard } from "@/types/dashboard";
import type { Widget } from "@/types/widget";
import { SaveResult } from "./types";

/**
 * Componente principal de la barra de herramientas de edición
 */
export const EditToolbar: React.FC = () => {
  const {
    isEditing,
    toggleEditing,
    hasUnsavedChanges,
    saveChanges,
    discardChanges,
    createDashboard,
    isDiscarding,
    selectedWidgetId,
    openConfigSidebar,
  } = useDashboardStore();
  const { getWidget } = useWidgetStore();

  const [showReadonlyModal, setShowReadonlyModal] = useState(false);
  const [readonlyDashboard, setReadonlyDashboard] = useState<Dashboard | null>(
    null
  );

  // No renderizar si no estamos en modo edición
  if (!isEditing) return null;

  /**
   * Función auxiliar para añadir cualquier tipo de widget
   */
  const addWidgetToBoard = (
    widget: Widget,
    layout: { w: number; h: number }
  ) => {
    const {
      currentDashboard,
      isEditing,
      updateDashboard,
      updateCurrentDashboard,
      selectWidget,
      openConfigSidebar,
    } = useDashboardStore.getState();

    // Add widget to current dashboard
    if (currentDashboard) {
      const newLayout = {
        i: widget._id,
        x: 0,
        y: 0,
        w: layout.w,
        h: layout.h,
      };

      const updatedWidgets = [...currentDashboard.widgets, widget._id];
      const updatedLayout = [...currentDashboard.layout, newLayout];

      if (isEditing) {
        // En modo edición, actualizar dashboard directamente
        updateCurrentDashboard({
          widgets: updatedWidgets,
          layout: updatedLayout,
        });
      } else {
        // Fuera de modo edición, actualizar directamente
        updateDashboard(currentDashboard._id, {
          widgets: updatedWidgets,
          layout: updatedLayout,
        });
      }

      // Seleccionar el widget recién creado
      selectWidget(widget._id);

      if (widget.type === "text") return;

      // Abrir automáticamente el sidebar de configuración
      openConfigSidebar();
    }
  };

  /**
   * Maneja el guardado de cambios
   */
  const handleSave = async (): Promise<SaveResult | void> => {
    try {
      const result = await saveChanges();

      // Si el resultado tiene la estructura esperada
      if (result && typeof result === "object") {
        if (
          "needsConfirmation" in result &&
          result.needsConfirmation &&
          result.dashboard
        ) {
          // Mostrar modal de confirmación para dashboard readonly
          setReadonlyDashboard(result.dashboard);
          setShowReadonlyModal(true);
        }

        return result as SaveResult;
      }

      // Si no hay un resultado con estructura definida
      return;
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
      await discardChanges();
    } else {
      toggleEditing();
    }
  };

  /**
   * Maneja la confirmación de copia del dashboard
   */
  const handleConfirmCopy = (newName: string) => {
    if (readonlyDashboard) {
      // Crear nueva copia del dashboard con todas las propiedades necesarias
      createDashboard({
        name: newName,
        description: readonlyDashboard.description,
        layout: readonlyDashboard.layout,
        widgets: readonlyDashboard.widgets,
        variables: readonlyDashboard.variables,
        visibility: "private", // Por defecto privado
        collaborators: readonlyDashboard.collaborators,
        userId: useAuthStore.getState().user?._id || "", // Usuario actual como propietario
        originalId: readonlyDashboard._id, // Referencia al dashboard original
      });

      // Cerrar modal y modo edición
      setShowReadonlyModal(false);
      setReadonlyDashboard(null);
      toggleEditing();

      console.log(`Dashboard copiado como: ${newName}`);
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
          {/* Sección Archivo */}
          <ToolbarFileActions
            isDiscarding={isDiscarding}
            hasUnsavedChanges={hasUnsavedChanges}
            onSave={handleSave}
            onCloseEditing={handleCloseEditing}
          />

          <div className="edit-toolbar__separator" />

          {/* Sección Widgets */}
          <ToolbarWidgetActions addWidgetToBoard={addWidgetToBoard} />

          {/* Botón de configuración */}
          <ConfigButton
            selectedWidgetId={selectedWidgetId}
            getWidget={getWidget}
            openConfigSidebar={openConfigSidebar}
          />
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
