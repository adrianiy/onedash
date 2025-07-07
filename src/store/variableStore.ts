import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type VariableValue = any;

interface VariableState {
  variables: Record<string, VariableValue>;
  setVariable: (key: string, value: VariableValue) => void;
  setMultiple: (updates: Record<string, VariableValue>) => void;
  getVariable: (key: string) => VariableValue;
}

export const useVariableStore = create<VariableState>()(
  devtools(
    persist(
      (set, get) => ({
        variables: {
          indicator: null,
          saleType: null,
          timeframe: null,
          comparison: null,
          scope: null,
        },

        setVariable: (key, value) => {
          console.log(`🔄 Variable Store - Setting ${key}:`, value);
          set(
            (state) => ({
              variables: { ...state.variables, [key]: value },
            }),
            false,
            `setVariable(${key})`
          );
        },

        setMultiple: (updates) => {
          console.log("🔄 Variable Store - Setting multiple:", updates);
          set(
            (state) => ({
              variables: { ...state.variables, ...updates },
            }),
            false,
            "setMultiple"
          );
        },

        getVariable: (key) => {
          return get().variables[key];
        },
      }),
      {
        name: "variable-storage",
      }
    ),
    {
      name: "variables",
      enabled: true,
      trace: true,
    }
  )
);
