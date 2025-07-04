import React, { useState } from "react";
import { useDashboardStore } from "../../store/dashboardStore";
import { Icon } from "../common/Icon";
import { ReadonlyConfirmModal } from "../common/ReadonlyConfirmModal";
import type { Dashboard } from "../../types/dashboard";

export const EditToolbar: React.FC = () => {
  const {
    isEditing,
    toggleEditing,
    hasUnsavedChanges,
    saveChanges,
    discardChanges,
    createDashboard,
  } = useDashboardStore();
  const [isSaving, setIsSaving] = useState(false);
  const [showReadonlyModal, setShowReadonlyModal] = useState(false);
  const [readonlyDashboard, setReadonlyDashboard] = useState<Dashboard | null>(
    null
  );

  if (!isEditing) return null;

  const handleSave = async () => {
    if (!isSaving) {
      setIsSaving(true);

      try {
        const result = await saveChanges();

        if (result.needsConfirmation && result.dashboard) {
          // Mostrar modal de confirmación para dashboard readonly
          setReadonlyDashboard(result.dashboard);
          setShowReadonlyModal(true);
          setIsSaving(false);
          return;
        }

        // Mostrar estado de guardado brevemente
        setTimeout(() => {
          setIsSaving(false);
        }, 800);
      } catch (error) {
        console.error("Error saving dashboard:", error);
        setIsSaving(false);
      }
    }
  };

  const handleCloseEditing = () => {
    if (hasUnsavedChanges) {
      // TODO: Mostrar confirmación antes de perder cambios
      const confirmDiscard = window.confirm(
        "Tienes cambios sin guardar. ¿Estás seguro de que quieres cerrar la edición?"
      );

      if (confirmDiscard) {
        discardChanges();
      }
    } else {
      toggleEditing();
    }
  };

  const handleAddWidget = () => {
    // TODO: Implement widget selection modal/dropdown
    console.log("Add widget functionality - to be implemented");
  };

  const handleConfirmCopy = (newName: string) => {
    if (readonlyDashboard) {
      // Crear nueva copia del dashboard
      createDashboard({
        name: newName,
        description: readonlyDashboard.description,
        layout: readonlyDashboard.layout,
        widgets: readonlyDashboard.widgets,
        isReadonly: false, // La copia siempre es editable
      });

      // Cerrar modal y modo edición
      setShowReadonlyModal(false);
      setReadonlyDashboard(null);
      toggleEditing();

      console.log(`Dashboard copiado como: ${newName}`);
    }
  };

  const handleCancelCopy = () => {
    setShowReadonlyModal(false);
    setReadonlyDashboard(null);
  };

  return (
    <>
      <div className="edit-toolbar">
        <div className="edit-toolbar__content">
          <button
            className="edit-toolbar__button"
            onClick={handleSave}
            title="Guardar cambios"
            disabled={isSaving}
          >
            <Icon name={isSaving ? "check" : "save"} size={20} />
            <span>{isSaving ? "Guardado" : "Guardar"}</span>
          </button>

          <button
            className="edit-toolbar__button edit-toolbar__button--danger"
            onClick={handleCloseEditing}
            title="Cerrar modo edición"
          >
            <Icon name="close" size={20} />
            <span>Cerrar</span>
          </button>

          <div className="edit-toolbar__separator" />

          <button
            className="edit-toolbar__button"
            onClick={handleAddWidget}
            title="Añadir nuevo widget"
          >
            <Icon name="plus" size={20} />
            <span>Añadir Widget</span>
          </button>
        </div>
      </div>

      {readonlyDashboard && (
        <ReadonlyConfirmModal
          isOpen={showReadonlyModal}
          dashboard={readonlyDashboard}
          onConfirm={handleConfirmCopy}
          onCancel={handleCancelCopy}
        />
      )}
    </>
  );
};
