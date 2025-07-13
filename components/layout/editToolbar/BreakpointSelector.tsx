import React from "react";
import { useUIStore } from "@/store/uiStore";
import { Icon } from "@/components/common/Icon";
import { Breakpoint } from "@/types/dashboard";

export const BreakpointSelector: React.FC = () => {
  const { currentBreakpoint, setCurrentBreakpoint } = useUIStore();

  const handleBreakpointChange = (breakpoint: Breakpoint) => {
    setCurrentBreakpoint(breakpoint);
  };

  return (
    <div className="edit-toolbar__section breakpoint-selector">
      <div className="edit-toolbar__section-buttons">
        <button
          className={`edit-toolbar__button ${
            currentBreakpoint === "lg" ? "edit-toolbar__button--active" : ""
          }`}
          onClick={() => handleBreakpointChange("lg")}
          title="Vista escritorio"
        >
          <Icon name="monitor" size={20} />
          <span>Escritorio</span>
        </button>

        <button
          className={`edit-toolbar__button ${
            currentBreakpoint === "md" ? "edit-toolbar__button--active" : ""
          }`}
          onClick={() => handleBreakpointChange("md")}
          title="Vista tablet"
        >
          <Icon name="tablet" size={20} />
          <span>Tablet</span>
        </button>

        <button
          className={`edit-toolbar__button ${
            currentBreakpoint === "sm" ? "edit-toolbar__button--active" : ""
          }`}
          onClick={() => handleBreakpointChange("sm")}
          title="Vista móvil"
        >
          <Icon name="smartphone" size={20} />
          <span>Móvil</span>
        </button>
      </div>
      <span className="edit-toolbar__section-title">Vista</span>
    </div>
  );
};
