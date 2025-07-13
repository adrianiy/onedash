import React, { useState } from "react";
import { Tooltip } from "react-tooltip";
import { useUIStore } from "@/store/uiStore";
import { Icon } from "@/common/Icon";
import { useGridStore } from "@/store/gridStore";

interface FloatingActionBarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const FloatingActionBar: React.FC<FloatingActionBarProps> = ({
  onToggleSidebar,
  isSidebarOpen,
}) => {
  const { isEditing, toggleEditing } = useUIStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleEdit = () => {
    if (!isEditing) {
      useGridStore.temporal.getState().clear();
    }
    toggleEditing();
  };

  return (
    <>
      <div
        className={`floating-action-bar ${
          isSidebarOpen ? "floating-action-bar--sidebar-open" : ""
        } ${isCollapsed ? "floating-action-bar--collapsed" : ""}`}
      >
        <button
          className={`floating-action-bar__button ${
            isEditing ? "floating-action-bar__button--active" : ""
          }`}
          onClick={handleEdit}
          data-tooltip-id="edit-tooltip"
        >
          <Icon name="edit" size={20} />
        </button>

        <div className="floating-action-bar__separator" />

        <button
          className={`floating-action-bar__button ${
            isSidebarOpen ? "floating-action-bar__button--active" : ""
          }`}
          onClick={onToggleSidebar}
          data-tooltip-id="dashboard-tooltip"
        >
          <Icon name="layout-dashboard" size={20} />
        </button>

        <div className="floating-action-bar__separator" />

        <button
          className="floating-action-bar__toggle-btn"
          onClick={toggleCollapsed}
          data-tooltip-id="toggle-tooltip"
        >
          <Icon name={isCollapsed ? "menu" : "chevron-down"} size={16} />
        </button>
      </div>

      <Tooltip
        id="edit-tooltip"
        content={isEditing ? "Terminar Edición" : "Modo Edición"}
        place="right"
      />
      <Tooltip id="dashboard-tooltip" content="Dashboards" place="right" />
      <Tooltip
        id="toggle-tooltip"
        content={isCollapsed ? "Expandir menú" : "Contraer menú"}
        place="right"
      />
    </>
  );
};
