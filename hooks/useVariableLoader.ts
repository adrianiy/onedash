import { useEffect, useCallback, useRef } from "react";
import { useVariableStore } from "@/store/variableStore";
import { useGridStore } from "@/store/gridStore";
import { useVariableOperations } from "./useVariableOperations";

/**
 * Hook para cargar automáticamente las variables de un dashboard
 * Incluye persistencia y aplicación de defaults
 */
export const useVariableLoader = (dashboardId: string | null) => {
  const {
    currentDashboardId,
    setDashboardVariables,
    setCurrentDashboard,
    clearDashboardVariables,
    isLoading,
    setLoading,
  } = useVariableStore();

  const { dashboard } = useGridStore();
  const loadingRef = useRef<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Usar hook base consolidado para operaciones con variables
  const {
    loadVariables,
    getDefaultVariables,
    persistVariable: persistVar,
    persistMultiple: persistMulti,
  } = useVariableOperations({
    dashboardId,
    enablePersistence: true,
  });

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

        // Usar el método consolidado del hook base
        const variablesFromDB = await loadVariables();

        // Obtener defaults del dashboard - asegurar que esté disponible
        let dashboardDefaults = {};
        if (dashboard && dashboard._id === id && dashboard.defaultVariables) {
          dashboardDefaults = dashboard.defaultVariables;
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
      } catch (error) {
        console.error("❌ Failed to load dashboard variables:", error);

        // En caso de error, usar defaults (base + dashboard si está disponible)
        let dashboardDefaults = {};
        if (dashboard && dashboard._id === id && dashboard.defaultVariables) {
          dashboardDefaults = dashboard.defaultVariables;
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
    [
      dashboard,
      getDefaultVariables,
      setDashboardVariables,
      setLoading,
      loadVariables,
    ]
  );

  // Cargar variables con debouncing cuando cambia el dashboardId
  useEffect(() => {
    if (dashboardId === currentDashboardId) {
      return;
    }
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
  }, [
    dashboardId,
    setCurrentDashboard,
    clearDashboardVariables,
    loadDashboardVariables,
    currentDashboardId,
  ]);

  // Recargar variables cuando el dashboard cambia (para aplicar defaultVariables)
  useEffect(() => {
    if (dashboardId && dashboard && dashboard._id === dashboardId) {
      // Si el dashboard ya está cargado y tiene defaultVariables, recargar variables
      if (
        dashboard.defaultVariables &&
        Object.keys(dashboard.defaultVariables).length > 0
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
  }, [
    dashboard?.defaultVariables,
    dashboardId,
    dashboard?._id,
    loadDashboardVariables,
    dashboard,
  ]);

  return {
    isLoading,
    persistVariable: persistVar,
    persistMultiple: persistMulti,
    loadDashboardVariables: () =>
      dashboardId ? loadDashboardVariables(dashboardId) : Promise.resolve(),
  };
};
