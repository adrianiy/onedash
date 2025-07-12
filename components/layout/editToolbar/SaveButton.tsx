import React from "react";
import { Icon } from "@/common/Icon";
import { SaveButtonProps } from "./types";
import { Tooltip } from "react-tooltip";

/**
 * Componente botón de guardado con diferentes estados
 */
export const SaveButton: React.FC<SaveButtonProps> = ({
  onSave,
  saveState,
  setSaveState,
}) => {
  /**
   * Maneja el clic en el botón de guardar
   */
  const handleSave = async () => {
    if (saveState === "saving") return;

    setSaveState("saving");

    try {
      await onSave();
      // Si llegamos aquí sin errores, significa que la operación se completó con éxito
      setSaveState("success");
      setTimeout(() => {
        setSaveState("idle");
      }, 2000);
    } catch (error) {
      console.error("Error saving dashboard:", error);
      setSaveState("error");
      // Volver al estado idle después de 3 segundos
      setTimeout(() => {
        setSaveState("idle");
      }, 3000);
    }
  };

  /**
   * Obtiene el contenido del botón según el estado
   */
  const getSaveButtonContent = () => {
    switch (saveState) {
      case "saving":
        return {
          icon: "loader" as const,
          text: "Guardando...",
          className: "edit-toolbar__button--saving",
        };
      case "success":
        return {
          icon: "check" as const,
          text: "Guardado",
          className: "edit-toolbar__button--success",
        };
      case "error":
        return {
          icon: "alert-circle" as const,
          text: "Error",
          className: "edit-toolbar__button--error",
        };
      default:
        return {
          icon: "save" as const,
          text: "Guardar",
          className: "",
        };
    }
  };

  const saveButtonContent = getSaveButtonContent();

  return (
    <>
      <button
        className={`edit-toolbar__button save-button ${saveButtonContent.className}`}
        onClick={handleSave}
        data-tooltip-id="save-tooltip"
        disabled={saveState === "saving"}
      >
        <Icon name={saveButtonContent.icon} size={20} />
        <span>{saveButtonContent.text}</span>
      </button>

      <Tooltip
        id="save-tooltip"
        content={
          saveState === "saving"
            ? "Guardando..."
            : saveState === "success"
            ? "Dashboard guardado"
            : saveState === "error"
            ? "Error al guardar - Click para reintentar"
            : "Guardar cambios"
        }
        place="bottom"
      />
    </>
  );
};
