import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {
  Dashboard,
  DashboardLayout,
  DashboardSettings,
} from "../types/dashboard";
import { generateId } from "../utils/helpers";

interface DashboardState {
  dashboards: Dashboard[];
  currentDashboard: Dashboard | null;
  settings: DashboardSettings;
  isEditing: boolean;

  // Actions
  createDashboard: (
    dashboard: Omit<Dashboard, "id" | "createdAt" | "updatedAt">
  ) => Dashboard;
  updateDashboard: (id: string, updates: Partial<Dashboard>) => void;
  deleteDashboard: (id: string) => void;
  setCurrentDashboard: (dashboard: Dashboard | null) => void;
  updateLayout: (layout: DashboardLayout[]) => void;
  toggleEditing: () => void;
  updateSettings: (settings: Partial<DashboardSettings>) => void;
}

const defaultSettings: DashboardSettings = {
  theme: "light",
  gridCols: 12,
  gridRowHeight: 60,
  gridMargin: [10, 10],
  isEditable: false,
};

export const useDashboardStore = create<DashboardState>()(
  devtools(
    persist(
      (set, get) => ({
        dashboards: [],
        currentDashboard: null,
        settings: defaultSettings,
        isEditing: false,

        createDashboard: (dashboardData) => {
          const newDashboard: Dashboard = {
            ...dashboardData,
            id: generateId(),
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          set((state) => ({
            dashboards: [...state.dashboards, newDashboard],
            currentDashboard: newDashboard,
          }));

          return newDashboard;
        },

        updateDashboard: (id, updates) => {
          set((state) => ({
            dashboards: state.dashboards.map((dashboard) =>
              dashboard.id === id
                ? { ...dashboard, ...updates, updatedAt: new Date() }
                : dashboard
            ),
            currentDashboard:
              state.currentDashboard && state.currentDashboard.id === id
                ? {
                    ...state.currentDashboard,
                    ...updates,
                    updatedAt: new Date(),
                  }
                : state.currentDashboard,
          }));
        },

        deleteDashboard: (id) => {
          set((state) => ({
            dashboards: state.dashboards.filter(
              (dashboard) => dashboard.id !== id
            ),
            currentDashboard:
              state.currentDashboard && state.currentDashboard.id === id
                ? null
                : state.currentDashboard,
          }));
        },

        setCurrentDashboard: (dashboard) => {
          set({ currentDashboard: dashboard });
        },

        updateLayout: (layout) => {
          const { currentDashboard } = get();
          if (currentDashboard) {
            get().updateDashboard(currentDashboard.id, { layout });
          }
        },

        toggleEditing: () => {
          set((state) => ({ isEditing: !state.isEditing }));
        },

        updateSettings: (newSettings) => {
          set((state) => ({
            settings: { ...state.settings, ...newSettings },
          }));
        },
      }),
      {
        name: "dashboard-storage",
        partialize: (state) => ({
          dashboards: state.dashboards,
          settings: state.settings,
        }),
      }
    ),
    {
      name: "dashboard-store",
    }
  )
);
