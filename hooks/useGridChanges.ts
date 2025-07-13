import { useUndoRedo } from "@/store/gridStore";

/**
 * Hook para detectar cambios en el grid utilizando el middleware zundo
 * Permite saber si hay cambios sin guardar y descartar cambios
 */
export const useGridChanges = () => {
  const { historyLength, canUndo, undo, clear } = useUndoRedo();

  // Para descartar cambios, simplemente aplicamos undo hasta el estado inicial
  const discardChanges = () => {
    if (!canUndo) return;
    // Aplicar undo para todas las acciones en el historial
    for (let i = 0; i < historyLength; i++) {
      undo();
    }
  };

  // Limpiar historial (después de guardar)
  const clearHistory = () => {
    clear();
  };

  return {
    hasUnsavedChanges: canUndo,
    discardChanges,
    clearHistory,
  };
};
