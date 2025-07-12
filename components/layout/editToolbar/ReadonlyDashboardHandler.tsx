import React from "react";
import { ReadonlyConfirmModal } from "@/common/ReadonlyConfirmModal";
import { ReadonlyDashboardHandlerProps } from "./types";

/**
 * Componente que maneja los dashboards de solo lectura
 * Muestra un modal de confirmación cuando se intenta guardar un dashboard de solo lectura
 */
export const ReadonlyDashboardHandler: React.FC<
  ReadonlyDashboardHandlerProps
> = ({ isOpen, dashboard, onConfirm, onCancel }) => {
  // No necesitamos manejar el estado del nombre aquí,
  // ya que el componente ReadonlyConfirmModal lo maneja internamente

  // Si no hay dashboard o no está abierto, no renderizar nada
  if (!dashboard || !isOpen) return null;

  return (
    <ReadonlyConfirmModal
      isOpen={isOpen}
      dashboard={dashboard}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
};
