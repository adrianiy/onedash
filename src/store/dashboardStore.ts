import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {
  Dashboard,
  DashboardLayout,
  DashboardSettings,
} from "../types/dashboard";
import { generateId } from "../utils/helpers";
import { useWidgetStore } from "./widgetStore";
import { useVariableStore } from "./variableStore";

interface DashboardState {
  dashboards: Dashboard[];
  currentDashboard: Dashboard | null;
  originalDashboard: Dashboard | null;
  tempDashboard: Dashboard | null;
  settings: DashboardSettings;
  isEditing: boolean;
  hasUnsavedChanges: boolean;
  selectedWidgetId: string | null;
  isConfigSidebarOpen: boolean;
  droppingItemSize: { w: number; h: number };

  // Actions
  createDashboard: (
    dashboard: Omit<Dashboard, "id" | "createdAt" | "updatedAt">
  ) => Dashboard;
  updateDashboard: (id: string, updates: Partial<Dashboard>) => void;
  deleteDashboard: (id: string) => void;
  setCurrentDashboard: (dashboard: Dashboard | null) => void;
  updateLayout: (layout: DashboardLayout[]) => void;
  toggleEditing: () => void;
  startEditing: () => void;
  saveChanges: () => Promise<{
    needsConfirmation: boolean;
    dashboard?: Dashboard;
  }>;
  discardChanges: () => void;
  updateTempDashboard: (updates: Partial<Dashboard>) => void;
  updateSettings: (settings: Partial<DashboardSettings>) => void;
  selectWidget: (widgetId: string) => void;
  clearSelection: () => void;
  openConfigSidebar: () => void;
  closeConfigSidebar: () => void;
  setDroppingItemSize: (size: { w: number; h: number }) => void;
  resetDroppingItemSize: () => void;
  initializeIfNeeded: () => void;
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
        originalDashboard: null,
        tempDashboard: null,
        settings: defaultSettings,
        isEditing: false,
        hasUnsavedChanges: false,
        selectedWidgetId: null,
        isConfigSidebarOpen: false,
        droppingItemSize: { w: 6, h: 6 },

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
            // Limpiar estados de edición al crear nuevo dashboard
            originalDashboard: null,
            tempDashboard: null,
            isEditing: false,
            hasUnsavedChanges: false,
          }));

          // Inicializar variables para el nuevo dashboard
          const { initializeDashboardVariables, setCurrentDashboard } =
            useVariableStore.getState();
          initializeDashboardVariables(newDashboard.id);
          setCurrentDashboard(newDashboard.id);

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
          // Limpiar variables del dashboard eliminado
          const { clearDashboardVariables } = useVariableStore.getState();
          clearDashboardVariables(id);

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

          // Sincronizar variables del dashboard actual
          const { setCurrentDashboard: setVariableDashboard } =
            useVariableStore.getState();

          setVariableDashboard(dashboard?.id || null);
        },

        updateLayout: (layout) => {
          const { currentDashboard, isEditing, tempDashboard } = get();

          if (isEditing && tempDashboard) {
            // En modo edición, actualizar la copia temporal
            get().updateTempDashboard({ layout });
          } else if (currentDashboard) {
            // Fuera de modo edición, actualizar directamente
            get().updateDashboard(currentDashboard.id, { layout });
          }
        },

        toggleEditing: () => {
          const { isEditing } = get();

          if (isEditing) {
            // Si estamos en modo edición, descartar cambios
            get().discardChanges();
          } else {
            // Si no estamos en modo edición, iniciar edición
            get().startEditing();
          }
        },

        updateSettings: (newSettings) => {
          set((state) => ({
            settings: { ...state.settings, ...newSettings },
          }));
        },

        startEditing: () => {
          const { currentDashboard } = get();

          // Solo iniciar edición si hay un dashboard actual
          if (currentDashboard) {
            // Crear copia profunda del dashboard actual
            const tempDashboard: Dashboard = JSON.parse(
              JSON.stringify(currentDashboard)
            );

            set({
              originalDashboard: currentDashboard,
              tempDashboard,
              // NO establecer currentDashboard = tempDashboard para evitar mutación
              isEditing: true,
              hasUnsavedChanges: false,
            });
          }
        },

        saveChanges: async () => {
          const { originalDashboard, tempDashboard } = get();

          // Si no hay dashboard original o temporal, no hacer nada
          if (!originalDashboard || !tempDashboard) {
            return { needsConfirmation: false };
          }

          // Comprobar si el dashboard original es de solo lectura
          if (originalDashboard.isReadonly) {
            // Devolver que se necesita confirmación para crear copia
            return {
              needsConfirmation: true,
              dashboard: tempDashboard,
            };
          }

          // Dashboard no es readonly, sobreescribir el original
          const updatedDashboard = {
            ...originalDashboard,
            layout: tempDashboard.layout,
            widgets: tempDashboard.widgets,
            updatedAt: new Date(),
          };

          // Actualizar en la lista de dashboards
          set((state) => ({
            dashboards: state.dashboards.map((d) =>
              d.id === updatedDashboard.id ? updatedDashboard : d
            ),
            currentDashboard: updatedDashboard,
            originalDashboard: null,
            tempDashboard: null,
            isEditing: false,
            hasUnsavedChanges: false,
            selectedWidgetId: null,
          }));

          return { needsConfirmation: false, dashboard: updatedDashboard };
        },

        discardChanges: () => {
          const { originalDashboard } = get();

          set({
            currentDashboard: originalDashboard,
            originalDashboard: null,
            tempDashboard: null,
            isEditing: false,
            hasUnsavedChanges: false,
            selectedWidgetId: null,
          });
        },

        updateTempDashboard: (updates) => {
          const { tempDashboard } = get();

          if (tempDashboard) {
            const updatedDashboard = {
              ...tempDashboard,
              ...updates,
              updatedAt: new Date(),
            };

            set({
              tempDashboard: updatedDashboard,
              // NO actualizar currentDashboard aquí para mantener separación
              hasUnsavedChanges: true,
            });
          }
        },

        selectWidget: (widgetId) => {
          const { isEditing } = get();

          // Solo seleccionar widgets en modo edición
          if (isEditing) {
            set({ selectedWidgetId: widgetId });
          }
        },

        clearSelection: () => {
          set({ selectedWidgetId: null, isConfigSidebarOpen: false });
        },

        openConfigSidebar: () => {
          set({ isConfigSidebarOpen: true });
        },

        closeConfigSidebar: () => {
          set({ isConfigSidebarOpen: false });
        },

        setDroppingItemSize: (size) => {
          set({ droppingItemSize: size });
        },

        resetDroppingItemSize: () => {
          set({ droppingItemSize: { w: 6, h: 6 } });
        },

        initializeIfNeeded: () => {
          const state = get();

          // Only initialize if no dashboards exist and not already initialized
          if (state.dashboards.length === 0) {
            // Create demo dashboard
            const newDashboard = get().createDashboard({
              name: "ONE DEMO",
              description: "Dashboard de ejemplo",
              layout: [],
              widgets: [],
              isReadonly: true,
            });

            // Get widget store and add demo widgets
            const { addWidget } = useWidgetStore.getState();

            const chartWidget = addWidget({
              type: "chart",
              title: "Ventas Mensuales",
              config: {
                chartType: "bar",
                data: [
                  { name: "Ene", value: 120 },
                  { name: "Feb", value: 190 },
                  { name: "Mar", value: 300 },
                  { name: "Abr", value: 500 },
                  { name: "May", value: 200 },
                  { name: "Jun", value: 300 },
                ],
                options: {},
              },
            });

            const metricWidget = addWidget({
              type: "metric",
              title: "Ingresos Totales",
              config: {
                value: "€52,430",
                unit: "",
                trend: "up",
                trendValue: 12.5,
              },
            });

            const textWidget = addWidget({
              type: "text",
              title: "Bienvenido",
              config: {
                content:
                  "¡Bienvenido a OneDash! Este es tu dashboard personalizable donde puedes agregar widgets, gráficos y métricas.",
                fontSize: 16,
                textAlign: "center",
              },
            });

            // Update dashboard with widgets
            get().updateDashboard(newDashboard.id, {
              widgets: [chartWidget.id, metricWidget.id, textWidget.id],
              layout: [
                { i: chartWidget.id, x: 0, y: 0, w: 8, h: 5 },
                {
                  i: metricWidget.id,
                  x: 8,
                  y: 0,
                  w: 4,
                  h: 3,
                },
                { i: textWidget.id, x: 8, y: 3, w: 4, h: 3 },
              ],
              isReadonly: true, // Marcar dashboard demo como solo lectura
            });
          }

          // Ensure there's a current dashboard if dashboards exist
          const currentState = get();
          if (
            currentState.dashboards.length > 0 &&
            !currentState.currentDashboard
          ) {
            const firstDashboard = currentState.dashboards[0];
            set({ currentDashboard: firstDashboard });

            // Sincronizar variables para el dashboard inicial
            const { setCurrentDashboard: setVariableDashboard } =
              useVariableStore.getState();
            setVariableDashboard(firstDashboard.id);
          }
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
