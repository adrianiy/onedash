import React from "react";
import { useDashboardStore } from "../../store/dashboardStore";
import { useThemeStore } from "../../store/themeStore";
import { Icon } from "../common/Icon";
import { UserAvatar } from "./UserAvatar";
import { EditToolbar } from "./EditToolbar";

export const Header: React.FC = () => {
  const { currentDashboard } = useDashboardStore();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <>
      <header className="app-header">
        <div className="app-header-content">
          <div className="app-header-left">
            <h1 className="app-title">OneDash</h1>
            {currentDashboard && (
              <span className="app-subtitle">{currentDashboard.name}</span>
            )}
          </div>

          <div className="app-header-right">
            <div className="app-header-actions">
              <button
                className="header-action-btn"
                onClick={toggleTheme}
                title={theme === "light" ? "Modo Oscuro" : "Modo Claro"}
              >
                <Icon name={theme === "light" ? "moon" : "sun"} size={16} />
              </button>
            </div>

            <UserAvatar name="Usuario" size={36} />
          </div>
        </div>
      </header>
      <EditToolbar />
    </>
  );
};
