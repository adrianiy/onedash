import { useEffect, useCallback, useRef } from "react";
import { useVariableStore } from "@/store/variableStore";
import { useDashboardStore } from "@/store/dashboardStore";
import { useVariableOperations } from "./useVariableOperations";

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
    [
      currentDashboard,
      getDefaultVariables,
      setDashboardVariables,
      setLoading,
      loadVariables,
    ]
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
  }, [
    dashboardId,
    setCurrentDashboard,
    clearDashboardVariables,
    loadDashboardVariables,
  ]);

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
  }, [
    currentDashboard?.defaultVariables,
    dashboardId,
    currentDashboard?._id,
    loadDashboardVariables,
  ]);

  return {
    isLoading,
    persistVariable: persistVar,
    persistMultiple: persistMulti,
    loadDashboardVariables: () =>
      dashboardId ? loadDashboardVariables(dashboardId) : Promise.resolve(),
  };
};
