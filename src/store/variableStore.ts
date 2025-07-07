import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { DashboardVariable } from "../types/variables";
import { generateId } from "../utils/helpers";

interface VariableState {
  variables: Record<string, unknown>;
  definitions: Record<string, DashboardVariable>;

  // Actions
  setVariable: (id: string, value: unknown) => void;
  setMultiple: (updates: Record<string, unknown>) => void;
  createVariable: (
    variable: Omit<DashboardVariable, "createdAt" | "updatedAt"> & {
      id?: string;
    }
  ) => DashboardVariable;
  updateVariable: (id: string, updates: Partial<DashboardVariable>) => void;
  deleteVariable: (id: string) => void;
  getVariable: (id: string) => unknown;
  getVariableDefinition: (id: string) => DashboardVariable | undefined;
  getVisibleVariables: () => DashboardVariable[];
  initializeIfNeeded: () => void;
}

export const useVariableStore = create<VariableState>()(
  devtools(
    persist(
      (set, get) => ({
        variables: {},
        definitions: {},

        setVariable: (id, value) => {
          set((state) => ({
            variables: { ...state.variables, [id]: value },
            definitions: {
              ...state.definitions,
              [id]: state.definitions[id]
                ? { ...state.definitions[id], updatedAt: new Date() }
                : state.definitions[id],
            },
          }));
        },

        setMultiple: (updates) => {
          set((state) => ({
            variables: { ...state.variables, ...updates },
            definitions: Object.keys(updates).reduce(
              (acc, id) => ({
                ...acc,
                [id]: state.definitions[id]
                  ? { ...state.definitions[id], updatedAt: new Date() }
                  : state.definitions[id],
              }),
              state.definitions
            ),
          }));
        },

        createVariable: (variableData) => {
          const newVariable: DashboardVariable = {
            ...variableData,
            id: variableData.id || generateId(),
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          set((state) => ({
            definitions: {
              ...state.definitions,
              [newVariable.id]: newVariable,
            },
            variables: {
              ...state.variables,
              [newVariable.id]: newVariable.value,
            },
          }));

          return newVariable;
        },

        updateVariable: (id, updates) => {
          set((state) => ({
            definitions: {
              ...state.definitions,
              [id]: state.definitions[id]
                ? {
                    ...state.definitions[id],
                    ...updates,
                    updatedAt: new Date(),
                  }
                : state.definitions[id],
            },
          }));
        },

        deleteVariable: (id) => {
          set((state) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [id]: _, ...restDefinitions } = state.definitions;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [id]: __, ...restVariables } = state.variables;
            return {
              definitions: restDefinitions,
              variables: restVariables,
            };
          });
        },

        getVariable: (id) => {
          return get().variables[id];
        },

        getVariableDefinition: (id) => {
          return get().definitions[id];
        },

        getVisibleVariables: () => {
          const { definitions } = get();
          return Object.values(definitions).filter(
            (def) => def && def.isVisible
          );
        },

        initializeIfNeeded: () => {
          const { definitions } = get();

          // Only initialize if no variables exist
          if (Object.keys(definitions).length === 0) {
            // Create some default variables
            get().createVariable({
              id: "currentIndicator", // ID fijo para referencia en métricas dinámicas
              name: "Indicador Seleccionado",
              value: "importe",
              type: "indicator",
              isVisible: true,
            });

            get().createVariable({
              name: "Período Actual",
              value: "mes",
              type: "timeframe",
              isVisible: true,
            });

            get().createVariable({
              name: "Tipo de Venta",
              value: "neto",
              type: "sale_type",
              isVisible: true,
            });
          }
        },
      }),
      {
        name: "variable-storage",
        partialize: (state) => ({
          variables: state.variables,
          definitions: state.definitions,
        }),
      }
    ),
    {
      name: "variable-store",
    }
  )
);
