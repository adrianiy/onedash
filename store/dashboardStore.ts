import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  Dashboard,
  DashboardLayout,
  DashboardSettings,
} from "../types/dashboard";
import { useVariableStore } from "./variableStore";
import { useWidgetStore } from "./widgetStore";
import { apiService } from "../services/apiService";
import type { Widget } from "../types/widget";
import { useAuthStore } from "./authStore";

interface DashboardState {
  dashboards: Dashboard[];
  currentDashboard: Dashboard | null;
  originalDashboard: Dashboard | null;
  tempDashboard: Dashboard | null;
  settings: DashboardSettings;
  isEditing: boolean;
  hasUnsavedChanges: boolean;
  selectedWidgetId: string | null;
  isConfigSidebarOpen: boolean;
  droppingItemSize: { w: number; h: number };
  isLoading: boolean;

  // Actions
  createDashboard: (
    dashboard: Omit<
      Dashboard & { visibility: "public" | "private" },
      "id" | "_id" | "createdAt" | "updatedAt"
    >
  ) => Promise<Dashboard | null>;
  updateDashboard: (
    id: string,
    updates: Partial<Dashboard>
  ) => Promise<boolean>;
  deleteDashboard: (id: string) => Promise<boolean>;
  fetchDashboards: () => Promise<void>;
  setCurrentDashboard: (dashboard: Dashboard | null) => void;
  updateLayout: (layout: DashboardLayout[]) => void;
  toggleEditing: () => void;
  startEditing: () => void;
  saveChanges: () => Promise<{
    needsConfirmation: boolean;
    dashboard?: Dashboard;
    error?: unknown;
  }>;
  discardChanges: () => void;
  updateTempDashboard: (updates: Partial<Dashboard>) => void;
  updateSettings: (settings: Partial<DashboardSettings>) => void;
  selectWidget: (widgetId: string) => void;
  clearSelection: () => void;
  openConfigSidebar: () => void;
  closeConfigSidebar: () => void;
  setDroppingItemSize: (size: { w: number; h: number }) => void;
  resetDroppingItemSize: () => void;
  initializeIfNeeded: () => void;
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
      originalDashboard: null,
      tempDashboard: null,
      settings: defaultSettings,
      isEditing: false,
      hasUnsavedChanges: false,
      selectedWidgetId: null,
      isConfigSidebarOpen: false,
      droppingItemSize: { w: 6, h: 6 },
      isLoading: false,

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
              originalDashboard: null,
              tempDashboard: null,
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
        set({ isLoading: true });

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
                isLoading: false,
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
              isLoading: false,
            }));
            return true;
          }
        } catch (error) {
          console.error("❌ Error al eliminar dashboard:", error);
          set({ isLoading: false });
          return false;
        }
      },

      setCurrentDashboard: (dashboard) => {
        set({ currentDashboard: dashboard });

        // Sincronizar variables del dashboard actual
        const { setCurrentDashboard: setVariableDashboard } =
          useVariableStore.getState();

        setVariableDashboard(dashboard?._id || null);
      },

      updateLayout: (layout) => {
        const { currentDashboard, isEditing, tempDashboard } = get();

        if (isEditing && tempDashboard) {
          // En modo edición, actualizar la copia temporal
          get().updateTempDashboard({ layout });
        } else if (currentDashboard) {
          // Fuera de modo edición, actualizar directamente
          get().updateDashboard(currentDashboard._id, { layout });
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
          // Crear copia profunda del dashboard actual
          const tempDashboard: Dashboard = JSON.parse(
            JSON.stringify(currentDashboard)
          );

          set({
            originalDashboard: currentDashboard,
            tempDashboard,
            isEditing: true,
            hasUnsavedChanges: false,
          });
        }
      },

      saveChanges: async () => {
        const { originalDashboard, tempDashboard } = get();

        // Si no hay dashboard original o temporal, no hacer nada
        if (!originalDashboard || !tempDashboard) {
          return { needsConfirmation: false };
        }

        // Comprobar si el usuario tiene permisos para editar este dashboard
        const currentUser = useAuthStore.getState().user;

        // El userId puede ser un string o un objeto con _id
        const dashboardOwnerId = originalDashboard.userId;

        const isOwner = currentUser && dashboardOwnerId === currentUser._id;
        console.log(dashboardOwnerId, currentUser?._id);

        const isCollaborator =
          currentUser &&
          originalDashboard.collaborators?.some(
            (id) => id.toString() === currentUser._id
          );

        if (!isOwner && !isCollaborator) {
          // El usuario no es ni propietario ni colaborador, mostrar confirmación para crear copia
          return {
            needsConfirmation: true,
            dashboard: tempDashboard,
          };
        }

        try {
          console.log("🚀 Iniciando guardado del dashboard...");

          // 1. Gestión de widgets borrados
          const deletedWidgetIds = originalDashboard.widgets.filter(
            (widgetId) => !tempDashboard.widgets.includes(widgetId)
          );

          console.log("🗑️ Widgets a eliminar:", deletedWidgetIds);

          // Eliminar widgets que ya no existen en el dashboard
          if (deletedWidgetIds.length > 0) {
            const { widgets } = useWidgetStore.getState();
            await Promise.all(
              deletedWidgetIds.map(async (widgetId) => {
                const widget = widgets.find((w) => w._id === widgetId);
                // Solo eliminar si el widget está persistido en la base de datos
                if (widget && widget.persisted) {
                  console.log(`🗑️ Eliminando widget: ${widgetId}`);
                  await apiService.delete(`/widgets/${widgetId}`);
                }
              })
            );
          }

          // 2. Guardar widgets existentes y crear nuevos
          const { widgets } = useWidgetStore.getState();
          const dashboardWidgets = widgets.filter((w) =>
            tempDashboard.widgets.includes(w._id)
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
                    dashboardId: originalDashboard._id,
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
                  dashboardId: originalDashboard._id,
                });

                // Marcar el widget como persistido en el store local
                const { updateWidget } = useWidgetStore.getState();
                updateWidget(widget._id, { persisted: true });

                return (response.data as Widget)?._id;
              }
            })
          );

          console.log("🔄 IDs de widgets actualizados:", updatedWidgetIds);

          // 3. Actualizar dashboard con los IDs de widgets actualizados
          const dashboardData = {
            name: tempDashboard.name,
            description: tempDashboard.description,
            layout: tempDashboard.layout.map((item) => {
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
            visibility: tempDashboard.visibility,
          };

          // 4. Actualizar o crear el dashboard
          let updatedDashboard;

          if (/^[0-9a-f]{24}$/.test(originalDashboard._id)) {
            // Actualizar dashboard existente
            console.log(`📝 Actualizando dashboard: ${originalDashboard._id}`);
            const response = await apiService.put(
              `/dashboards/${originalDashboard._id}`,
              dashboardData
            );
            updatedDashboard = response.data;
          } else {
            // Crear nuevo dashboard
            console.log("✨ Creando nuevo dashboard");
            const response = await apiService.post(
              `/dashboards`,
              dashboardData
            );
            updatedDashboard = response.data;
          }

          // 5. Actualizar estado local con los datos de la BD
          if (updatedDashboard) {
            const dashboardData = updatedDashboard as Dashboard;
            const newId = dashboardData._id;
            const dashboardWithCorrectId = {
              ...dashboardData,
              _id: newId,
              updatedAt: new Date(dashboardData.updatedAt),
              createdAt: new Date(dashboardData.createdAt),
            } as Dashboard;

            set((state) => ({
              dashboards: state.dashboards.map((d) =>
                d._id === originalDashboard._id ? dashboardWithCorrectId : d
              ),
              currentDashboard: dashboardWithCorrectId,
              originalDashboard: null,
              tempDashboard: null,
              isEditing: false,
              hasUnsavedChanges: false,
              selectedWidgetId: null,
            }));

            // 6. Recargar widgets desde la API para obtener los IDs actualizados
            const { fetchWidgetsByDashboardId } = useWidgetStore.getState();
            await fetchWidgetsByDashboardId(newId);

            console.log("✅ Dashboard guardado exitosamente");
          }

          return { needsConfirmation: false };
        } catch (error) {
          console.error("❌ Error guardando el dashboard:", error);
          // Mantener el estado de edición en caso de error
          return { needsConfirmation: false, error };
        }
      },

      discardChanges: () => {
        const { originalDashboard } = get();

        set({
          currentDashboard: originalDashboard,
          originalDashboard: null,
          tempDashboard: null,
          isEditing: false,
          hasUnsavedChanges: false,
          selectedWidgetId: null,
        });
      },

      updateTempDashboard: (updates) => {
        const { tempDashboard } = get();

        if (tempDashboard) {
          const updatedDashboard = {
            ...tempDashboard,
            ...updates,
            updatedAt: new Date(),
          };

          set({
            tempDashboard: updatedDashboard,
            hasUnsavedChanges: true,
          });
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

      // Inicialización - cargar dashboard demo por defecto
      initializeIfNeeded: () => {
        const state = get();

        // Si ya hay dashboards cargados, no hacer nada
        if (state.dashboards.length > 0 && !state.currentDashboard) {
          // Establecer el primer dashboard como actual
          get().setCurrentDashboard(state.dashboards[0]);
        }
      },
    }),
    {
      name: "dashboard-store",
    }
  )
);
