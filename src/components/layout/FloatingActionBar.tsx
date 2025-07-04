import React, { useState } from "react";
import { Tooltip } from "react-tooltip";
import { useDashboardStore } from "../../store/dashboardStore";
import { Icon } from "../common/Icon";

interface FloatingActionBarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const FloatingActionBar: React.FC<FloatingActionBarProps> = ({
  onToggleSidebar,
  isSidebarOpen,
}) => {
  const { isEditing, toggleEditing } = useDashboardStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
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
          onClick={toggleEditing}
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
          <Icon name="menu" size={20} />
        </button>

        <div className="floating-action-bar__separator" />

        <button
          className="floating-action-bar__toggle-btn"
          onClick={toggleCollapsed}
          data-tooltip-id="toggle-tooltip"
        >
          <Icon name={isCollapsed ? "chevron-up" : "chevron-down"} size={16} />
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
        content={isCollapsed ? "Expandir" : "Contraer"}
        place="right"
      />
    </>
  );
};
