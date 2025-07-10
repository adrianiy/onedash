import { useEffect, useCallback, useRef } from "react";
import { useVariableStore } from "../store/variableStore";
import { useDashboardStore } from "../store/dashboardStore";
import { apiService } from "../services/apiService";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type VariableValue = any;

/**
 * Hook para cargar automáticamente las variables de un dashboard
 * Incluye persistencia y aplicación de defaults
 */
export const useVariableLoader = (dashboardId: string | null) => {
  const {
    setDashboardVariables,
    setCurrentDashboard,
    clearDashboardVariables,
    isLoading,
    setLoading,
  } = useVariableStore();

  const { currentDashboard } = useDashboardStore();
  const loadingRef = useRef<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Variables por defecto
  const getDefaultVariables = useCallback((): Record<string, VariableValue> => {
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

  // Cargar variables del dashboard desde la DB
  const loadDashboardVariables = useCallback(
    async (id: string) => {
      // Evitar cargas duplicadas
      if (loadingRef.current === id) {
        return;
      }

      loadingRef.current = id;
      setLoading(true);

      try {
        console.log(`🔄 Loading variables for dashboard: ${id}`);

        // Cargar variables de la base de datos
        const response = await apiService.get(`/variables?dashboardId=${id}`);

        if (response.success && response.data && Array.isArray(response.data)) {
          // Convertir array de variables a objeto
          const variablesFromDB: Record<string, VariableValue> = {};
          response.data.forEach(
            (variable: { key: string; value: VariableValue }) => {
              variablesFromDB[variable.key] = variable.value;
            }
          );

          // Obtener defaults del dashboard - asegurar que esté disponible
          let dashboardDefaults = {};
          if (
            currentDashboard &&
            currentDashboard._id === id &&
            currentDashboard.defaultVariables
          ) {
            dashboardDefaults = currentDashboard.defaultVariables;
            console.log(
              `🔄 Applying dashboard defaults for ${id}:`,
              dashboardDefaults
            );
          }

          // Combinar defaults con variables de DB
          // Prioridad: Base defaults < Dashboard defaults < Persisted variables
          const combinedVariables = {
            ...getDefaultVariables(), // Base defaults
            ...dashboardDefaults, // Dashboard defaults
            ...variablesFromDB, // Persisted variables (highest priority)
          };

          // Actualizar estado a través del store
          setDashboardVariables(id, combinedVariables);

          console.log(
            `✅ Variables loaded for dashboard ${id}:`,
            combinedVariables
          );
        } else {
          // Si no hay variables de DB, usar defaults (base + dashboard)
          let dashboardDefaults = {};
          if (
            currentDashboard &&
            currentDashboard._id === id &&
            currentDashboard.defaultVariables
          ) {
            dashboardDefaults = currentDashboard.defaultVariables;
          }

          const defaultVars = {
            ...getDefaultVariables(),
            ...dashboardDefaults,
          };
          setDashboardVariables(id, defaultVars);

          console.log(
            `✅ No DB variables found, using defaults for ${id}:`,
            defaultVars
          );
        }
      } catch (error) {
        console.error("❌ Failed to load dashboard variables:", error);

        // En caso de error, usar defaults (base + dashboard si está disponible)
        let dashboardDefaults = {};
        if (
          currentDashboard &&
          currentDashboard._id === id &&
          currentDashboard.defaultVariables
        ) {
          dashboardDefaults = currentDashboard.defaultVariables;
        }

        const defaultVars = {
          ...getDefaultVariables(),
          ...dashboardDefaults,
        };
        setDashboardVariables(id, defaultVars);
      } finally {
        setLoading(false);
        loadingRef.current = null;
      }
    },
    [currentDashboard, getDefaultVariables, setDashboardVariables, setLoading]
  );

  // Persistir una variable en la base de datos
  const persistVariable = useCallback(
    async (key: string, value: VariableValue) => {
      if (!dashboardId) return;

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
    [dashboardId]
  );

  // Persistir múltiples variables
  const persistMultiple = useCallback(
    async (updates: Record<string, VariableValue>) => {
      if (!dashboardId) return;

      try {
        // Enviar cada variable individualmente (el API actual maneja upsert)
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
    [dashboardId]
  );

  // Cargar variables con debouncing cuando cambia el dashboardId
  useEffect(() => {
    // Limpiar timeout anterior
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (dashboardId) {
      // Establecer el dashboard actual inmediatamente
      setCurrentDashboard(dashboardId);

      // Debouncer para la carga de variables
      debounceRef.current = setTimeout(() => {
        loadDashboardVariables(dashboardId);
      }, 100); // 100ms de debounce
    } else {
      // Si no hay dashboardId, limpiar
      setCurrentDashboard(null);
      if (loadingRef.current) {
        clearDashboardVariables(loadingRef.current);
        loadingRef.current = null;
      }
    }

    // Cleanup
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [dashboardId]); // Solo dashboardId como dependencia crítica

  // Recargar variables cuando el dashboard cambia (para aplicar defaultVariables)
  useEffect(() => {
    if (
      dashboardId &&
      currentDashboard &&
      currentDashboard._id === dashboardId
    ) {
      // Si el dashboard ya está cargado y tiene defaultVariables, recargar variables
      if (
        currentDashboard.defaultVariables &&
        Object.keys(currentDashboard.defaultVariables).length > 0
      ) {
        console.log(
          `🔄 Dashboard loaded with defaults, reloading variables for ${dashboardId}`
        );

        // Usar un pequeño delay para asegurar que el dashboard esté completamente establecido
        setTimeout(() => {
          loadDashboardVariables(dashboardId);
        }, 50);
      }
    }
  }, [currentDashboard?.defaultVariables, dashboardId, currentDashboard?._id]);

  return {
    isLoading,
    persistVariable,
    persistMultiple,
    loadDashboardVariables: () =>
      dashboardId ? loadDashboardVariables(dashboardId) : Promise.resolve(),
  };
};
