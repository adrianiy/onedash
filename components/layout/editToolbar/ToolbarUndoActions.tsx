import React from "react";
import { Icon } from "@/common/Icon";
import { Tooltip } from "react-tooltip";
import { useUndoRedo } from "@/store/gridStore";
import { useUIStore } from "@/store/uiStore";

/**
 * Componente para las acciones de undo/redo en la barra de herramientas
 */
export const ToolbarUndoActions: React.FC = () => {
  const { undo, redo, canUndo, canRedo } = useUndoRedo();
  const { setLockChanges } = useUIStore();

  // Funciones intermedias para manejar eventos de clic
  const handleUndo = (e: React.MouseEvent) => {
    e.preventDefault();
    setLockChanges(true);
    undo();
  };

  const handleRedo = (e: React.MouseEvent) => {
    e.preventDefault();
    setLockChanges(true);
    redo();
  };

  return (
    <div className="edit-toolbar__section">
      <div className="edit-toolbar__section-buttons edit-toolbar__section-buttons--column">
        <button
          className="edit-toolbar__button edit-toolbar__button--small"
          onClick={handleUndo}
          disabled={!canUndo}
          data-tooltip-id="undo-tooltip"
        >
          <Icon name="undo" size={16} />
        </button>

        <button
          className="edit-toolbar__button edit-toolbar__button--small"
          onClick={handleRedo}
          disabled={!canRedo}
          data-tooltip-id="redo-tooltip"
        >
          <Icon name="redo" size={16} />
        </button>
      </div>

      {/* Tooltips */}
      <Tooltip
        id="undo-tooltip"
        content="Deshacer último cambio"
        place="bottom"
      />
      <Tooltip
        id="redo-tooltip"
        content="Rehacer último cambio"
        place="bottom"
      />
    </div>
  );
};
