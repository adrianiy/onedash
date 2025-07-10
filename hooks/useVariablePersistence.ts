import { useCallback } from "react";
import { useVariableStore } from "../store/variableStore";
import { apiService } from "../services/apiService";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type VariableValue = any;

/**
 * Hook para persistir variables en la base de datos
 * Separado del useVariableLoader para componentes que solo necesitan persistir
 */
export const useVariablePersistence = (dashboardId: string | null) => {
  const { setVariable, setMultiple } = useVariableStore();

  // Persistir una variable (local + base de datos)
  const persistVariable = useCallback(
    async (key: string, value: VariableValue) => {
      if (!dashboardId) return;

      // Actualizar estado local inmediatamente
      setVariable(key, value);

      // Persistir en background
      try {
        await apiService.post("/variables", {
          dashboardId,
          key,
          value,
        });
        console.log(`✅ Variable ${key} persisted successfully`);
      } catch (error) {
        console.error(`❌ Failed to persist variable ${key}:`, error);
      }
    },
    [dashboardId, setVariable]
  );

  // Persistir múltiples variables (local + base de datos)
  const persistMultiple = useCallback(
    async (updates: Record<string, VariableValue>) => {
      if (!dashboardId) return;

      // Actualizar estado local inmediatamente
      setMultiple(updates);

      // Persistir en background
      try {
        const promises = Object.entries(updates).map(([key, value]) =>
          apiService.post("/variables", {
            dashboardId,
            key,
            value,
          })
        );

        await Promise.all(promises);
        console.log("✅ Multiple variables persisted successfully");
      } catch (error) {
        console.error("❌ Failed to persist multiple variables:", error);
      }
    },
    [dashboardId, setMultiple]
  );

  return {
    persistVariable,
    persistMultiple,
  };
};
