import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  Dashboard,
  DashboardLayout,
  DashboardSettings,
} from "@/types/dashboard";
import { useVariableStore } from "./variableStore";
import { useWidgetStore } from "./widgetStore";
import { apiService } from "@/services/apiService";
import type { Widget } from "@/types/widget";
import { useAuthStore } from "./authStore";

interface DashboardState {
  dashboards: Dashboard[];
  currentDashboard: Dashboard | null;
  settings: DashboardSettings;
  isEditing: boolean;
  hasUnsavedChanges: boolean;
  selectedWidgetId: string | null;
  isConfigSidebarOpen: boolean;
  droppingItemSize: { w: number; h: number };
  isLoading: boolean;
  isDiscarding: boolean;
  deletingDashboardId: string | null;
  originalSnapshot: {
    dashboard: Dashboard | null;
    widgets: Widget[];
  } | null;

  // Actions
  createDashboard: (
    dashboard: Omit<
      Dashboard & {
        visibility: "public" | "private";
        collaborators?: string[];
      },
      "id" | "_id" | "createdAt" | "updatedAt"
    >
  ) => Promise<Dashboard | null>;
  updateDashboard: (
    id: string,
    updates: Partial<Dashboard>
  ) => Promise<boolean>;
  deleteDashboard: (id: string) => Promise<boolean>;
  fetchDashboards: () => Promise<void>;
  fetchDashboardById: (id: string) => Promise<void>;
  setCurrentDashboard: (dashboard: Dashboard | null) => void;
  updateLayout: (layout: DashboardLayout[]) => void;
  toggleEditing: () => void;
  startEditing: () => void;
  saveChanges: () => Promise<{
    needsConfirmation: boolean;
    dashboard?: Dashboard;
    error?: unknown;
  }>;
  discardChanges: () => Promise<void>;
  updateCurrentDashboard: (updates: Partial<Dashboard>) => void;
  updateSettings: (settings: Partial<DashboardSettings>) => void;
  selectWidget: (widgetId: string) => void;
  clearSelection: () => void;
  openConfigSidebar: () => void;
  closeConfigSidebar: () => void;
  setDroppingItemSize: (size: { w: number; h: number }) => void;
  resetDroppingItemSize: () => void;
  initializeIfNeeded: () => void;
  setDefaultVariable: (key: string, value: unknown) => void;
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
    (set, get) => ({
      dashboards: [],
      currentDashboard: null,
      settings: defaultSettings,
      isEditing: false,
      hasUnsavedChanges: false,
      selectedWidgetId: null,
      isConfigSidebarOpen: false,
      droppingItemSize: { w: 6, h: 6 },
      isLoading: false,
      isDiscarding: false,
      deletingDashboardId: null,
      originalSnapshot: null,

      // Crear un nuevo dashboard con persistencia en MongoDB
      createDashboard: async (dashboardData) => {
        set({ isLoading: true });

        try {
          // Obtener el ID del usuario actual
          const currentUser = useAuthStore.getState().user;
          console.log(currentUser, dashboardData);

          // Crear dashboard en MongoDB
          const response = await apiService.post("/dashboards", {
            name: dashboardData.name,
            description: dashboardData.description || "",
            visibility: dashboardData.visibility || "private",
            userId: dashboardData?.userId || currentUser?._id,
            layout: dashboardData.layout || [],
            widgets: dashboardData.widgets || [],
            collaborators: dashboardData.collaborators || [],
          });

          if (response.success && response.data) {
            const dashboardFromAPI = response.data as Dashboard;
            const newDashboard: Dashboard = {
              ...dashboardFromAPI,
              createdAt: new Date(dashboardFromAPI.createdAt),
              updatedAt: new Date(dashboardFromAPI.updatedAt),
            };

            set((state) => ({
              dashboards: [...state.dashboards, newDashboard],
              currentDashboard: newDashboard,
              isEditing: false,
              hasUnsavedChanges: false,
              isLoading: false,
            }));

            // Inicializar variables para el nuevo dashboard
            const { initializeDashboardVariables, setCurrentDashboard } =
              useVariableStore.getState();
            initializeDashboardVariables(newDashboard._id);
            setCurrentDashboard(newDashboard._id);

            // Activar automáticamente el modo edición para el nuevo dashboard
            get().startEditing();

            console.log("✅ Dashboard creado exitosamente:", newDashboard.name);
            return newDashboard;
          }

          throw new Error("Error al crear el dashboard");
        } catch (error) {
          console.error("❌ Error al crear dashboard:", error);
          set({ isLoading: false });
          return null;
        }
      },

      updateDashboard: async (id, updates) => {
        set({ isLoading: true });

        try {
          // Si el ID es un ID de MongoDB, actualizar en la API
          if (/^[0-9a-f]{24}$/.test(id)) {
            const response = await apiService.put(`/dashboards/${id}`, updates);

            if (response.success && response.data) {
              const updatedDashboardFromAPI = response.data as Dashboard;
              const updatedDashboard = {
                ...updatedDashboardFromAPI,
                updatedAt: new Date(updatedDashboardFromAPI.updatedAt),
                createdAt: new Date(updatedDashboardFromAPI.createdAt),
              };

              set((state) => ({
                dashboards: state.dashboards.map((dashboard) =>
                  dashboard._id === id ? updatedDashboard : dashboard
                ),
                currentDashboard:
                  state.currentDashboard && state.currentDashboard._id === id
                    ? updatedDashboard
                    : state.currentDashboard,
                isLoading: false,
              }));

              console.log("✅ Dashboard actualizado exitosamente");
              return true;
            }
            throw new Error("Error al actualizar el dashboard");
          } else {
            // ID local, solo actualizar localmente
            set((state) => ({
              dashboards: state.dashboards.map((dashboard) =>
                dashboard._id === id
                  ? { ...dashboard, ...updates, updatedAt: new Date() }
                  : dashboard
              ),
              currentDashboard:
                state.currentDashboard && state.currentDashboard._id === id
                  ? {
                      ...state.currentDashboard,
                      ...updates,
                      updatedAt: new Date(),
                    }
                  : state.currentDashboard,
              isLoading: false,
            }));
            return true;
          }
        } catch (error) {
          console.error("❌ Error al actualizar dashboard:", error);
          set({ isLoading: false });
          return false;
        }
      },

      deleteDashboard: async (id) => {
        set({ deletingDashboardId: id });

        try {
          // Si el ID es un ID de MongoDB, eliminarlo en la API
          if (/^[0-9a-f]{24}$/.test(id)) {
            const response = await apiService.delete(`/dashboards/${id}`);

            if (response.success) {
              // Limpiar variables del dashboard eliminado
              const { clearDashboardVariables } = useVariableStore.getState();
              clearDashboardVariables(id);

              set((state) => ({
                dashboards: state.dashboards.filter(
                  (dashboard) => dashboard._id !== id
                ),
                currentDashboard:
                  state.currentDashboard && state.currentDashboard._id === id
                    ? null
                    : state.currentDashboard,
                deletingDashboardId: null,
              }));

              console.log("✅ Dashboard eliminado exitosamente");
              return true;
            }
            throw new Error("Error al eliminar el dashboard");
          } else {
            // ID local, solo eliminarlo localmente
            const { clearDashboardVariables } = useVariableStore.getState();
            clearDashboardVariables(id);

            set((state) => ({
              dashboards: state.dashboards.filter(
                (dashboard) => dashboard._id !== id
              ),
              currentDashboard:
                state.currentDashboard && state.currentDashboard._id === id
                  ? null
                  : state.currentDashboard,
              deletingDashboardId: null,
            }));
            return true;
          }
        } catch (error) {
          console.error("❌ Error al eliminar dashboard:", error);
          set({ deletingDashboardId: null });
          return false;
        }
      },

      setCurrentDashboard: (dashboard) => {
        set({ currentDashboard: dashboard });

        // Sincronizar variables del dashboard actual
        const { setCurrentDashboard: setVariableDashboard, setMultiple } =
          useVariableStore.getState();

        setVariableDashboard(dashboard?._id || null);

        // Aplicar variables default inmediatamente si están disponibles
        if (
          dashboard?.defaultVariables &&
          Object.keys(dashboard.defaultVariables).length > 0
        ) {
          console.log(
            `🔄 Dashboard Store - Applying default variables immediately for ${dashboard._id}:`,
            dashboard.defaultVariables
          );

          // Solo aplicar defaults que no tengan valor actual en el variableStore
          const { getVariable } = useVariableStore.getState();
          const defaultsToApply: Record<string, unknown> = {};

          Object.entries(dashboard.defaultVariables).forEach(([key, value]) => {
            const currentValue = getVariable(key);
            if (currentValue === null || currentValue === undefined) {
              defaultsToApply[key] = value;
            }
          });

          if (Object.keys(defaultsToApply).length > 0) {
            console.log(
              `🔄 Applying missing default variables:`,
              defaultsToApply
            );
            setMultiple(defaultsToApply);
          }
        }
      },

      updateLayout: (layout) => {
        const { currentDashboard, isEditing } = get();

        // Debug logging
        if (process.env.NODE_ENV === "development") {
          console.log("📋 Store updateLayout called:", {
            isEditing,
            hasCurrentDashboard: !!currentDashboard,
            layoutCount: layout.length,
          });
        }

        if (currentDashboard) {
          if (isEditing) {
            // En modo edición, actualizar directamente y marcar cambios
            get().updateCurrentDashboard({ layout });
          } else {
            // Fuera de modo edición, persistir directamente
            get().updateDashboard(currentDashboard._id, { layout });
          }
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
          // Emitir evento para el wizard
          document.dispatchEvent(new CustomEvent("edit-mode"));
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
          const { widgets } = useWidgetStore.getState();

          // Crear snapshot del estado actual ANTES de empezar edición
          const dashboardWidgets = widgets.filter((w) =>
            currentDashboard.widgets.includes(w._id)
          );

          console.log("📸 Creando snapshot para edición:", {
            dashboardId: currentDashboard._id,
            widgetsCount: dashboardWidgets.length,
          });

          set({
            isEditing: true,
            hasUnsavedChanges: false,
            originalSnapshot: {
              dashboard: JSON.parse(JSON.stringify(currentDashboard)), // Deep copy
              widgets: dashboardWidgets.map((w) =>
                JSON.parse(JSON.stringify(w))
              ), // Deep copy widgets
            },
          });
        }
      },

      saveChanges: async () => {
        const { currentDashboard } = get();

        // Si no hay dashboard actual, no hacer nada
        if (!currentDashboard) {
          return { needsConfirmation: false };
        }

        // Comprobar si el usuario tiene permisos para editar este dashboard
        const currentUser = useAuthStore.getState().user;
        const dashboardOwnerId = currentDashboard.userId;
        const isOwner = currentUser && dashboardOwnerId === currentUser._id;
        const isCollaborator =
          currentUser &&
          currentDashboard.collaborators?.some(
            (id: string) => id.toString() === currentUser._id
          );

        if (!isOwner && !isCollaborator) {
          // El usuario no es ni propietario ni colaborador, mostrar confirmación para crear copia
          return {
            needsConfirmation: true,
            dashboard: currentDashboard,
          };
        }

        try {
          console.log("🚀 Iniciando guardado del dashboard...");

          // 1. Guardar widgets existentes y crear nuevos
          const { widgets } = useWidgetStore.getState();
          const dashboardWidgets = widgets.filter((w) =>
            currentDashboard.widgets.includes(w._id)
          );

          console.log("💾 Widgets a guardar:", dashboardWidgets.length);

          // Para cada widget, guardarlo o crearlo
          const updatedWidgetIds = await Promise.all(
            dashboardWidgets.map(async (widget) => {
              if (widget.persisted) {
                // Actualizar widget existente
                console.log(`📝 Actualizando widget: ${widget._id}`);
                const response = await apiService.put(
                  `/widgets/${widget._id}`,
                  {
                    title: widget.title,
                    config: widget.config,
                    events: widget.events,
                    isConfigured: widget.isConfigured,
                    dashboardId: currentDashboard._id,
                  }
                );
                return (response.data as Widget)?._id || widget._id;
              } else {
                // Crear nuevo widget
                console.log(`✨ Creando nuevo widget: ${widget.title}`);
                const response = await apiService.post(`/widgets`, {
                  _id: widget._id,
                  type: widget.type,
                  title: widget.title,
                  config: widget.config,
                  events: widget.events || [],
                  isConfigured: widget.isConfigured || false,
                  dashboardId: currentDashboard._id,
                });

                // Marcar el widget como persistido en el store local
                const { updateWidget } = useWidgetStore.getState();
                updateWidget(widget._id, { persisted: true });

                return (response.data as Widget)?._id;
              }
            })
          );

          console.log("🔄 IDs de widgets actualizados:", updatedWidgetIds);

          // 2. Actualizar dashboard con los IDs de widgets actualizados
          const dashboardData = {
            name: currentDashboard.name,
            description: currentDashboard.description,
            layout: currentDashboard.layout.map((item: DashboardLayout) => {
              // Actualizar los IDs de layout si han cambiado
              const widgetIndex = dashboardWidgets.findIndex(
                (w) => w._id === item.i
              );
              if (widgetIndex >= 0) {
                return { ...item, i: updatedWidgetIds[widgetIndex] };
              }
              return item;
            }),
            widgets: updatedWidgetIds,
            visibility: currentDashboard.visibility,
            defaultVariables: currentDashboard.defaultVariables,
          };

          // 3. Actualizar o crear el dashboard
          const success = await get().updateDashboard(
            currentDashboard._id,
            dashboardData
          );

          if (success) {
            set({
              isEditing: false,
              hasUnsavedChanges: false,
              selectedWidgetId: null,
              originalSnapshot: null, // Limpiar snapshot después de guardar
            });

            // Emitir evento para el wizard
            document.dispatchEvent(new CustomEvent("dashboard-save"));

            console.log("✅ Dashboard guardado exitosamente");
          }

          return { needsConfirmation: false };
        } catch (error) {
          console.error("❌ Error guardando el dashboard:", error);
          return { needsConfirmation: false, error };
        }
      },

      discardChanges: async () => {
        const { currentDashboard } = get();

        set({ isDiscarding: true });

        try {
          // Siempre cargar la última versión desde MongoDB
          if (currentDashboard && /^[0-9a-f]{24}$/.test(currentDashboard._id)) {
            console.log(
              `🔄 Cargando la última versión del dashboard desde MongoDB: ${currentDashboard._id}`
            );

            // Recargar dashboard desde MongoDB
            await get().fetchDashboardById(currentDashboard._id);
          }

          // Restablecer estados de edición
          set({
            isEditing: false,
            hasUnsavedChanges: false,
            selectedWidgetId: null,
            originalSnapshot: null, // Limpiar snapshot si existe
            isDiscarding: false,
          });

          console.log(
            "✅ Cambios descartados, dashboard cargado desde MongoDB"
          );
        } catch (error) {
          console.error("❌ Error al descartar cambios:", error);
          set({ isDiscarding: false });
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

      // Cargar dashboards desde MongoDB
      fetchDashboards: async () => {
        set({ isLoading: true });

        try {
          const response = await apiService.get("/dashboards");

          if (response.success && response.data) {
            // Convertir la respuesta de la API al formato local
            const dashboards = (response.data as Dashboard[]).map((dash) => ({
              ...dash,
              createdAt: new Date(dash.createdAt),
              updatedAt: new Date(dash.updatedAt),
            }));

            set({
              dashboards,
              isLoading: false,
            });

            console.log(
              "✅ Dashboards cargados exitosamente:",
              dashboards.length
            );
          }
        } catch (error) {
          console.error("❌ Error al obtener dashboards:", error);
          set({ isLoading: false });
        }
      },

      // Cargar un dashboard específico desde MongoDB
      fetchDashboardById: async (id: string) => {
        // Validar que sea un ID de MongoDB
        if (!/^[0-9a-f]{24}$/.test(id)) {
          console.log(
            "⚠️ ID de dashboard no válido para MongoDB, omitiendo recarga"
          );
          return;
        }

        set({ isLoading: true });

        try {
          const response = await apiService.get(`/dashboards/${id}`);

          if (response.success && response.data) {
            const dashboardFromAPI = response.data as Dashboard;
            const reloadedDashboard = {
              ...dashboardFromAPI,
              createdAt: new Date(dashboardFromAPI.createdAt),
              updatedAt: new Date(dashboardFromAPI.updatedAt),
            };

            set((state) => ({
              dashboards: state.dashboards.map((dashboard) =>
                dashboard._id === id ? reloadedDashboard : dashboard
              ),
              currentDashboard:
                state.currentDashboard && state.currentDashboard._id === id
                  ? reloadedDashboard
                  : state.currentDashboard,
              isLoading: false,
            }));

            console.log(`✅ Dashboard ${id} recargado desde MongoDB`);
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error(`❌ Error al recargar dashboard ${id}:`, error);
          set({ isLoading: false });
        }
      },

      // Actualizar currentDashboard directamente (para modo edición)
      updateCurrentDashboard: (updates: Partial<Dashboard>) => {
        const { currentDashboard } = get();

        if (currentDashboard) {
          const updatedDashboard = {
            ...currentDashboard,
            ...updates,
            updatedAt: new Date(),
          };

          set((state) => ({
            dashboards: state.dashboards.map((dashboard) =>
              dashboard._id === currentDashboard._id
                ? updatedDashboard
                : dashboard
            ),
            currentDashboard: updatedDashboard,
            hasUnsavedChanges: true,
          }));
        }
      },

      // Inicialización - cargar dashboard demo por defecto
      initializeIfNeeded: () => {
        const state = get();

        // Si ya hay dashboards cargados, no hacer nada
        if (state.dashboards.length > 0 && !state.currentDashboard) {
          // Establecer el primer dashboard como actual
          get().setCurrentDashboard(state.dashboards[0]);
        }
      },

      // Establecer valor por defecto de variable (solo en estado local)
      setDefaultVariable: (key: string, value: unknown) => {
        const { currentDashboard } = get();

        if (!currentDashboard) {
          console.warn("No current dashboard set, default variable ignored");
          return;
        }

        console.log(
          `🔄 Dashboard Store - Setting default variable ${key}:`,
          value,
          `for dashboard: ${currentDashboard._id}`
        );

        // Actualizar defaultVariables en el estado local
        const currentDefaults = currentDashboard.defaultVariables || {};
        const updatedDefaults = {
          ...currentDefaults,
          [key]: value,
        };

        // Actualizar dashboard con las nuevas defaultVariables
        get().updateCurrentDashboard({
          defaultVariables: updatedDefaults,
        });

        // NUEVA LÓGICA: Sincronizar con variable store si no hay valor actual
        const { setVariable, getVariable } = useVariableStore.getState();
        const currentValue = getVariable(key);

        if (currentValue === null || currentValue === undefined) {
          console.log(
            `🔄 Sincronizando variable ${key} con variable store:`,
            value
          );
          setVariable(key, value);
        }

        console.log(`✅ Default variable ${key} set in dashboard state`);
      },
    }),
    {
      name: "dashboard-store",
    }
  )
);
