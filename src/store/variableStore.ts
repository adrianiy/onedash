import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type VariableValue = any;

interface VariableState {
  dashboardVariables: Record<string, Record<string, VariableValue>>; // dashboardId -> variables
  currentDashboardId: string | null;
  variables: Record<string, VariableValue>; // variables del dashboard actual

  // Actions
  setVariable: (key: string, value: VariableValue) => void;
  setMultiple: (updates: Record<string, VariableValue>) => void;
  getVariable: (key: string) => VariableValue;
  setCurrentDashboard: (dashboardId: string | null) => void;
  clearDashboardVariables: (dashboardId: string) => void;
  initializeDashboardVariables: (dashboardId: string) => void;
}

// Variables por defecto para nuevos dashboards
const getDefaultVariables = (): Record<string, VariableValue> => ({
  indicator: null,
  saleType: null,
  timeframe: null,
  comparison: null,
  scope: null,
});

// Función para cargar variables de localStorage por dashboard
const loadDashboardVariables = (
  dashboardId: string
): Record<string, VariableValue> => {
  try {
    const stored = localStorage.getItem(`dashboard-variables-${dashboardId}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn(
      `Error loading variables for dashboard ${dashboardId}:`,
      error
    );
  }
  return getDefaultVariables();
};

// Función para guardar variables en localStorage por dashboard
const saveDashboardVariables = (
  dashboardId: string,
  variables: Record<string, VariableValue>
) => {
  try {
    localStorage.setItem(
      `dashboard-variables-${dashboardId}`,
      JSON.stringify(variables)
    );
  } catch (error) {
    console.warn(`Error saving variables for dashboard ${dashboardId}:`, error);
  }
};

export const useVariableStore = create<VariableState>()(
  devtools(
    persist(
      (set, get) => ({
        dashboardVariables: {},
        currentDashboardId: null,
        variables: getDefaultVariables(),

        setVariable: (key, value) => {
          const { currentDashboardId } = get();
          console.log(
            `🔄 Variable Store - Setting ${key}:`,
            value,
            `for dashboard: ${currentDashboardId}`
          );

          if (!currentDashboardId) {
            console.warn("No current dashboard set, variable change ignored");
            return;
          }

          set(
            (state) => {
              const newVariables = { ...state.variables, [key]: value };
              const newDashboardVariables = {
                ...state.dashboardVariables,
                [currentDashboardId]: newVariables,
              };

              // Guardar en localStorage
              saveDashboardVariables(currentDashboardId, newVariables);

              return {
                variables: newVariables,
                dashboardVariables: newDashboardVariables,
              };
            },
            false,
            `setVariable(${key})`
          );
        },

        setMultiple: (updates) => {
          const { currentDashboardId } = get();
          console.log(
            "🔄 Variable Store - Setting multiple:",
            updates,
            `for dashboard: ${currentDashboardId}`
          );

          if (!currentDashboardId) {
            console.warn("No current dashboard set, variable changes ignored");
            return;
          }

          set(
            (state) => {
              const newVariables = { ...state.variables, ...updates };
              const newDashboardVariables = {
                ...state.dashboardVariables,
                [currentDashboardId]: newVariables,
              };

              // Guardar en localStorage
              saveDashboardVariables(currentDashboardId, newVariables);

              return {
                variables: newVariables,
                dashboardVariables: newDashboardVariables,
              };
            },
            false,
            "setMultiple"
          );
        },

        getVariable: (key) => {
          return get().variables[key];
        },

        setCurrentDashboard: (dashboardId) => {
          const { dashboardVariables } = get();
          console.log(
            `🔄 Variable Store - Switching to dashboard: ${dashboardId}`
          );

          if (dashboardId === null) {
            set({
              currentDashboardId: null,
              variables: getDefaultVariables(),
            });
            return;
          }

          // Cargar variables del dashboard desde memoria o localStorage
          let dashboardVars = dashboardVariables[dashboardId];
          if (!dashboardVars) {
            dashboardVars = loadDashboardVariables(dashboardId);
          }

          set(
            (state) => ({
              currentDashboardId: dashboardId,
              variables: dashboardVars,
              dashboardVariables: {
                ...state.dashboardVariables,
                [dashboardId]: dashboardVars,
              },
            }),
            false,
            `setCurrentDashboard(${dashboardId})`
          );
        },

        initializeDashboardVariables: (dashboardId) => {
          const { dashboardVariables } = get();
          console.log(
            `🔄 Variable Store - Initializing variables for dashboard: ${dashboardId}`
          );

          // Solo inicializar si no existen ya variables para este dashboard
          if (!dashboardVariables[dashboardId]) {
            const defaultVars = getDefaultVariables();

            set(
              (state) => ({
                dashboardVariables: {
                  ...state.dashboardVariables,
                  [dashboardId]: defaultVars,
                },
              }),
              false,
              `initializeDashboardVariables(${dashboardId})`
            );

            // Guardar variables por defecto en localStorage
            saveDashboardVariables(dashboardId, defaultVars);
          }
        },

        clearDashboardVariables: (dashboardId) => {
          console.log(
            `🔄 Variable Store - Clearing variables for dashboard: ${dashboardId}`
          );

          set(
            (state) => {
              const newDashboardVariables = { ...state.dashboardVariables };
              delete newDashboardVariables[dashboardId];

              return {
                dashboardVariables: newDashboardVariables,
                // Si estamos limpiando el dashboard actual, resetear variables
                variables:
                  state.currentDashboardId === dashboardId
                    ? getDefaultVariables()
                    : state.variables,
                currentDashboardId:
                  state.currentDashboardId === dashboardId
                    ? null
                    : state.currentDashboardId,
              };
            },
            false,
            `clearDashboardVariables(${dashboardId})`
          );

          // Eliminar de localStorage
          try {
            localStorage.removeItem(`dashboard-variables-${dashboardId}`);
          } catch (error) {
            console.warn(
              `Error removing variables for dashboard ${dashboardId}:`,
              error
            );
          }
        },
      }),
      {
        name: "variable-storage",
        partialize: (state) => ({
          // Solo persistir el mapeo de dashboards, no las variables individuales
          // (se guardan en localStorage por separado)
          dashboardVariables: {},
          currentDashboardId: state.currentDashboardId,
        }),
      }
    ),
    {
      name: "variables",
      enabled: true,
      trace: true,
    }
  )
);
