import { useCallback } from "react";
import { useVariableStore } from "@/store/variableStore";
import { apiService } from "@/services/apiService";
import type {
  VariableValue,
  VariableUpdates,
  DefaultVariables,
} from "@/types/variables";

interface UseVariableOperationsOptions {
  dashboardId: string | null;
  enablePersistence?: boolean;
}

/**
 * Hook base consolidado para todas las operaciones con variables
 * Unifica la lógica de persistencia que estaba duplicada entre hooks
 */
export const useVariableOperations = ({
  dashboardId,
  enablePersistence = true,
}: UseVariableOperationsOptions) => {
  const { setVariable, setMultiple } = useVariableStore();

  // Variables por defecto centralizadas
  const getDefaultVariables = useCallback((): DefaultVariables => {
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
  }, []);

  // Cargar variables desde la API
  const loadVariables = useCallback(async (): Promise<
    Record<string, VariableValue>
  > => {
    if (!dashboardId) return {};

    try {
      console.log(`🔄 Loading variables for dashboard: ${dashboardId}`);

      const response = await apiService.get(
        `/variables?dashboardId=${dashboardId}`
      );

      if (response.success && response.data && Array.isArray(response.data)) {
        // Convertir array de variables a objeto
        const variablesFromDB: Record<string, VariableValue> = {};
        response.data.forEach(
          (variable: { key: string; value: VariableValue }) => {
            variablesFromDB[variable.key] = variable.value;
          }
        );

        console.log(
          `✅ Variables loaded for dashboard ${dashboardId}:`,
          variablesFromDB
        );
        return variablesFromDB;
      }

      return {};
    } catch (error) {
      console.error("❌ Failed to load dashboard variables:", error);
      return {};
    }
  }, [dashboardId]);

  // Persistir una variable (local + base de datos)
  const persistVariable = useCallback(
    async (key: string, value: VariableValue) => {
      if (!dashboardId) return;

      // Actualizar estado local inmediatamente
      setVariable(key, value);

      // Persistir en background si está habilitado
      if (enablePersistence) {
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
      }
    },
    [dashboardId, setVariable, enablePersistence]
  );

  // Persistir múltiples variables (local + base de datos)
  const persistMultiple = useCallback(
    async (updates: VariableUpdates) => {
      if (!dashboardId) return;

      // Actualizar estado local inmediatamente
      setMultiple(updates);

      // Persistir en background si está habilitado
      if (enablePersistence) {
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
      }
    },
    [dashboardId, setMultiple, enablePersistence]
  );

  // Solo actualizar variables localmente (sin persistir)
  const updateVariable = useCallback(
    (key: string, value: VariableValue) => {
      setVariable(key, value);
    },
    [setVariable]
  );

  // Solo actualizar múltiples variables localmente (sin persistir)
  const updateMultiple = useCallback(
    (updates: VariableUpdates) => {
      setMultiple(updates);
    },
    [setMultiple]
  );

  return {
    // Operaciones de carga
    loadVariables,
    getDefaultVariables,

    // Operaciones con persistencia
    persistVariable,
    persistMultiple,

    // Operaciones solo locales
    updateVariable,
    updateMultiple,
  };
};
