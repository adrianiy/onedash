import { create } from "zustand";
import { devtools } from "zustand/middleware";

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
const getDefaultVariables = (): Record<string, VariableValue> => {
  const today = new Date().toISOString().split("T")[0];
  return {
    indicator: null,
    saleType: null,
    timeframe: null,
    comparison: null,
    scope: null,
    // Filter variables
    dateStart: today,
    dateEnd: today,
    selectedProducts: [],
    selectedSections: [],
  };
};

export const useVariableStore = create<VariableState>()(
  devtools((set, get) => ({
    dashboardVariables: {},
    currentDashboardId: null,
    variables: getDefaultVariables(),

    // Guardar variable (solo local)
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

      // Actualizar estado local
      set((state) => {
        const newVariables = { ...state.variables, [key]: value };
        const newDashboardVariables = {
          ...state.dashboardVariables,
          [currentDashboardId]: newVariables,
        };

        return {
          variables: newVariables,
          dashboardVariables: newDashboardVariables,
        };
      });
    },

    // Guardar múltiples variables (solo local)
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

      // Actualizar estado local
      set((state) => {
        const newVariables = { ...state.variables, ...updates };
        const newDashboardVariables = {
          ...state.dashboardVariables,
          [currentDashboardId]: newVariables,
        };

        return {
          variables: newVariables,
          dashboardVariables: newDashboardVariables,
        };
      });
    },

    getVariable: (key) => {
      return get().variables[key];
    },

    // Cambiar dashboard actual
    setCurrentDashboard: (dashboardId) => {
      console.log(`🔄 Variable Store - Switching to dashboard: ${dashboardId}`);

      if (dashboardId === null) {
        set({
          currentDashboardId: null,
          variables: getDefaultVariables(),
        });
        return;
      }

      // Establecer el ID del dashboard actual
      set({ currentDashboardId: dashboardId });

      // Cargar variables del dashboard desde memoria local
      const { dashboardVariables } = get();
      const dashboardVars = dashboardVariables[dashboardId];

      if (dashboardVars) {
        set({ variables: dashboardVars });
      } else {
        // Si no hay variables, inicializar con valores por defecto
        const defaultVars = getDefaultVariables();
        set((state) => ({
          variables: defaultVars,
          dashboardVariables: {
            ...state.dashboardVariables,
            [dashboardId]: defaultVars,
          },
        }));
      }
    },

    // Inicializar variables para un nuevo dashboard
    initializeDashboardVariables: (dashboardId) => {
      console.log(
        `🔄 Variable Store - Initializing variables for dashboard: ${dashboardId}`
      );

      // Verificar si ya tenemos variables para este dashboard en memoria
      const { dashboardVariables } = get();
      if (dashboardVariables[dashboardId]) {
        return; // Ya hay variables inicializadas en memoria
      }

      // Crear variables por defecto para el nuevo dashboard
      const defaultVars = getDefaultVariables();

      set((state) => ({
        variables:
          dashboardId === state.currentDashboardId
            ? defaultVars
            : state.variables,
        dashboardVariables: {
          ...state.dashboardVariables,
          [dashboardId]: defaultVars,
        },
      }));
    },

    // Eliminar variables de un dashboard
    clearDashboardVariables: (dashboardId) => {
      console.log(
        `🔄 Variable Store - Clearing variables for dashboard: ${dashboardId}`
      );

      // Actualizar estado local
      set((state) => {
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
      });
    },
  }))
);
