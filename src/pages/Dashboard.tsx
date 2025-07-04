import React, { useEffect } from "react";
import { useDashboardStore } from "../store/dashboardStore";
import { DashboardGrid } from "../components/dashboard/DashboardGrid";

export const Dashboard: React.FC = () => {
  const { isEditing } = useDashboardStore();

  useEffect(() => {
    if (isEditing) {
      document.body.classList.add("editing");
    } else {
      document.body.classList.remove("editing");
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove("editing");
    };
  }, [isEditing]);

  return (
    <div className={`dashboard-container ${isEditing ? "editing" : ""}`}>
      <DashboardGrid />
    </div>
  );
};
