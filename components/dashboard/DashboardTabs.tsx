import React, { useState, useMemo } from "react";
import { Dashboard } from "@/types/dashboard";
import { useAuthStore } from "@/store/authStore";
import { Icon } from "@/common/Icon";

type TabType = "all" | "public" | "private" | "shared";

interface DashboardTabsProps {
  dashboards: Dashboard[];
  savedDashboards?: Dashboard[];
  isLoading?: boolean;
  onTabChange: (filteredDashboards: Dashboard[]) => void;
  className?: string;
}

export const DashboardTabs: React.FC<DashboardTabsProps> = ({
  dashboards,
  savedDashboards = [],
  isLoading = false,
  onTabChange,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const { user } = useAuthStore();

  // Calcular contadores para cada pestaña
  const counts = useMemo(() => {
    const publicDashboards = dashboards.filter(
      (dashboard) => dashboard.visibility === "public"
    );

    const privateDashboards = dashboards.filter(
      (dashboard) =>
        dashboard.visibility === "private" && dashboard.userId === user?._id
    );

    const sharedDashboards = savedDashboards.filter(
      (dashboard) => dashboard.userId !== user?._id
    );

    return {
      all: dashboards.length,
      public: publicDashboards.length,
      private: privateDashboards.length,
      shared: sharedDashboards.length,
    };
  }, [dashboards, savedDashboards, user?._id]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);

    // Filtrar los dashboards según la pestaña seleccionada
    let filteredDashboards: Dashboard[] = [];

    switch (tab) {
      case "all":
        filteredDashboards = dashboards;
        break;
      case "public":
        filteredDashboards = dashboards.filter(
          (dashboard) => dashboard.visibility === "public"
        );
        break;
      case "private":
        filteredDashboards = dashboards.filter(
          (dashboard) =>
            dashboard.visibility === "private" && dashboard.userId === user?._id
        );
        break;
      case "shared":
        // Mostrar dashboards guardados que no son propiedad del usuario actual
        // (esos son los que han sido compartidos con este usuario)
        filteredDashboards = savedDashboards.filter(
          (dashboard) => dashboard.userId !== user?._id
        );
        break;
    }

    onTabChange(filteredDashboards);
  };

  return (
    <div
      className={`dashboard-tabs ${className} ${isLoading ? "loading" : ""}`}
    >
      <button
        className={`dashboard-tab ${activeTab === "all" ? "active" : ""}`}
        onClick={() => !isLoading && handleTabChange("all")}
        disabled={isLoading}
      >
        <Icon name="layout-dashboard" size={16} />
        <span className="dashboard-tab__count">{counts.all}</span>
      </button>
      <button
        className={`dashboard-tab ${activeTab === "public" ? "active" : ""}`}
        onClick={() => !isLoading && handleTabChange("public")}
        disabled={isLoading}
      >
        Público
        <span className="dashboard-tab__count">{counts.public}</span>
      </button>
      <button
        className={`dashboard-tab ${activeTab === "private" ? "active" : ""}`}
        onClick={() => !isLoading && handleTabChange("private")}
        disabled={isLoading}
      >
        Privado
        <span className="dashboard-tab__count">{counts.private}</span>
      </button>
      <button
        className={`dashboard-tab ${activeTab === "shared" ? "active" : ""}`}
        onClick={() => !isLoading && handleTabChange("shared")}
        disabled={isLoading}
      >
        Compartido
        <span className="dashboard-tab__count">{counts.shared}</span>
      </button>
    </div>
  );
};
