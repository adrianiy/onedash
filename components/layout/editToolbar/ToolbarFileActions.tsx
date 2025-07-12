import React from "react";
import { Icon } from "@/common/Icon";
import { ToolbarFileActionsProps } from "./types";
import { SaveButton } from "./SaveButton";
import { Tooltip } from "react-tooltip";
import { SaveState } from "./types";

/**
 * Componente para las acciones de archivo en la barra de herramientas
 */
export const ToolbarFileActions: React.FC<ToolbarFileActionsProps> = ({
  isDiscarding,
  hasUnsavedChanges,
  onSave,
  onCloseEditing,
}) => {
  const [saveState, setSaveState] = React.useState<SaveState>("idle");

  /**
   * Maneja el guardado de cambios
   */
  const handleSave = async () => {
    try {
      const result = await onSave();

      if (result?.needsConfirmation) {
        setSaveState("idle");
        return;
      }

      if (result?.error) {
        console.error("Error al guardar:", result.error);
        setSaveState("error");
        setTimeout(() => {
          setSaveState("idle");
        }, 3000);
        return;
      }

      // Mostrar estado de éxito
      setSaveState("success");
      setTimeout(() => {
        setSaveState("idle");
      }, 2000);
    } catch (error) {
      console.error("Error saving dashboard:", error);
      setSaveState("error");
      setTimeout(() => {
        setSaveState("idle");
      }, 3000);
    }
  };

  /**
   * Maneja el cierre del modo edición
   */
  const handleCloseEditing = async () => {
    if (hasUnsavedChanges) {
      // Mostrar confirmación antes de perder cambios
      const confirmDiscard = window.confirm(
        "Tienes cambios sin guardar. ¿Estás seguro de que quieres cerrar la edición?"
      );

      if (confirmDiscard) {
        await onCloseEditing();
      }
    } else {
      await onCloseEditing();
    }
  };

  return (
    <div className="edit-toolbar__section">
      <div className="edit-toolbar__section-buttons">
        <SaveButton
          onSave={handleSave}
          saveState={saveState}
          setSaveState={setSaveState}
        />

        <button
          className={`edit-toolbar__button edit-toolbar__button--danger ${
            isDiscarding ? "edit-toolbar__button--saving" : ""
          }`}
          onClick={handleCloseEditing}
          data-tooltip-id="close-tooltip"
          disabled={isDiscarding}
        >
          <Icon name={isDiscarding ? "loader" : "close"} size={20} />
          <span>{isDiscarding ? "Restaurando..." : "Cerrar"}</span>
        </button>
      </div>
      <span className="edit-toolbar__section-title">Archivo</span>

      {/* Tooltips */}
      <Tooltip
        id="close-tooltip"
        content={isDiscarding ? "Recargando datos..." : "Cerrar modo edición"}
        place="bottom"
      />
    </div>
  );
};
