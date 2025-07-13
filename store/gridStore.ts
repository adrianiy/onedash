import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { temporal } from "zundo";
import type { Breakpoint, Dashboard, DashboardLayout } from "@/types/dashboard";
import type { Widget } from "@/types/widget";
import { useUIStore } from "./uiStore";
import { Layout } from "react-grid-layout";

type Widgets = Record<Widget["_id"], Widget>;

interface GridState {
  // Estado del grid
  dashboard: Dashboard | null;
  widgets: Widgets | null;

  // Tracking de cambios en widgets
  addedWidgets: Set<string>; // IDs de widgets añadidos (no existían en el backend)
  deletedWidgets: Set<string>; // IDs de widgets eliminados (existían en el backend)
  modifiedWidgets: Set<string>; // IDs de widgets modificados (existían pero cambiaron)

  // Acciones con historial
  setDashboard: (dashboard: Dashboard | null) => void;
  updateDashboard: (updates: Partial<Dashboard>) => void;
  setWidgets: (widgets: Widgets) => void;
  updateWidget: (widgetId: string, updates: Partial<Widget>) => void;
  updateDashboardLayout: (
    layout: DashboardLayout[],
    breakpoint: Breakpoint
  ) => void;
  updateDashboardLayouts: (layouts: Record<string, Layout[]>) => void;
  addWidget: (widget: Widget, layout: Layout) => void;
  removeWidget: (widgetId: string) => void;

  // Métodos para tracking de cambios en widgets
  markWidgetAsAdded: (widgetId: Widget["_id"]) => void;
  markWidgetAsDeleted: (widgetId: Widget["_id"]) => void;
  markWidgetAsModified: (widgetId: Widget["_id"]) => void;
  clearWidgetTracking: () => void;
}

export const useGridStore = create<GridState>()(
  devtools(
    temporal(
      (set) => ({
        // Estado inicial
        dashboard: null,
        widgets: null,

        // Inicializar sets vacíos para tracking
        addedWidgets: new Set<string>(),
        deletedWidgets: new Set<string>(),
        modifiedWidgets: new Set<string>(),

        // Acciones que modifican el estado (con historial)
        setDashboard: (dashboard) => set({ dashboard }, false, "setDashboard"),

        updateDashboard: (updates) =>
          set(
            (state) => ({
              dashboard: state.dashboard
                ? { ...state.dashboard, ...updates }
                : null,
            }),
            false,
            "updateDashboard"
          ),

        setWidgets: (widgets) => set({ widgets }, false, "setWidgets"),

        updateWidget: (widgetId, updates) =>
          set(
            (state) => {
              // Añadir a widgets modificados si no es un widget nuevo
              if (!state.addedWidgets?.has(widgetId)) {
                state.modifiedWidgets.add(widgetId);
              }

              return {
                widgets: {
                  ...state.widgets,
                  [widgetId]: {
                    ...state.widgets?.[widgetId],
                    ...updates,
                  } as Widget,
                },
                modifiedWidgets: new Set(state.modifiedWidgets), // Para asegurar inmutabilidad
              };
            },
            false,
            "updateWidget"
          ),

        updateDashboardLayout: (layout, breakpoint) =>
          set(
            (state) => ({
              dashboard: state.dashboard
                ? {
                    ...state.dashboard,
                    layouts: {
                      ...state.dashboard.layouts,
                      [breakpoint]: layout,
                    },
                  }
                : null,
            }),
            false,
            "updateDashboardLayout"
          ),

        updateDashboardLayouts: (layouts) =>
          set(
            (state) => ({
              dashboard: state.dashboard
                ? {
                    ...state.dashboard,
                    layouts: {
                      ...state.dashboard.layouts,
                      ...layouts,
                    },
                  }
                : null,
            }),
            false,
            "updateDashboardLayouts"
          ),

        addWidget: (widget, layout) =>
          set(
            (state) => {
              // Asegurarse de que el widget tenga un ID
              const widgetWithId = widget;
              const currentBreakpoint = useUIStore.getState().currentBreakpoint;

              // Marcar como añadido y eliminar de eliminados (por si acaso)
              const newAddedWidgets = new Set(state.addedWidgets);
              newAddedWidgets.add(widgetWithId._id);

              const newDeletedWidgets = new Set(state.deletedWidgets);
              newDeletedWidgets.delete(widgetWithId._id);

              // Crear un nuevo layout para cada breakpoint
              const updatedLayouts: Record<Breakpoint, Layout[]> = {
                lg: [...(state.dashboard?.layouts?.lg || [])],
                md: [...(state.dashboard?.layouts?.md || [])],
                sm: [...(state.dashboard?.layouts?.sm || [])],
              };

              // Añadir el layout al breakpoint actual
              updatedLayouts[currentBreakpoint] = [
                ...updatedLayouts[currentBreakpoint],
                layout,
              ];

              return {
                widgets: { ...state.widgets, [widgetWithId._id]: widgetWithId },
                // Actualizar también el dashboard si existe
                dashboard: state.dashboard
                  ? {
                      ...state.dashboard,
                      layouts: updatedLayouts,
                      widgets: [...state.dashboard.widgets, widgetWithId._id],
                    }
                  : null,
                addedWidgets: newAddedWidgets,
                deletedWidgets: newDeletedWidgets,
              };
            },
            false,
            "addWidget"
          ),

        removeWidget: (widgetId) =>
          set(
            (state) => {
              // Si era un widget añadido, simplemente lo quitamos del tracking
              // Si no, lo marcamos como eliminado
              const newAddedWidgets = new Set(state.addedWidgets);
              const newDeletedWidgets = new Set(state.deletedWidgets);
              const newModifiedWidgets = new Set(state.modifiedWidgets);

              if (newAddedWidgets.has(widgetId)) {
                newAddedWidgets.delete(widgetId);
              } else {
                newDeletedWidgets.add(widgetId);
              }

              // Si estaba marcado como modificado, ya no lo está (se eliminó)
              newModifiedWidgets.delete(widgetId);

              // Filtrar el layout del widget en todos los breakpoints
              const updatedLayouts: Record<Breakpoint, Layout[]> = {
                lg: (state.dashboard?.layouts?.lg || []).filter(
                  (item) => item.i !== widgetId
                ),
                md: (state.dashboard?.layouts?.md || []).filter(
                  (item) => item.i !== widgetId
                ),
                sm: (state.dashboard?.layouts?.sm || []).filter(
                  (item) => item.i !== widgetId
                ),
              };

              return {
                // Eliminar el widget del diccionario
                widgets: Object.fromEntries(
                  Object.entries(state.widgets || {}).filter(
                    ([id]) => id !== widgetId
                  )
                ),
                // Actualizar también el dashboard si existe
                dashboard: state.dashboard && {
                  ...state.dashboard,
                  widgets: state.dashboard.widgets.filter(
                    (id) => id !== widgetId
                  ),
                  layouts: updatedLayouts,
                },
                addedWidgets: newAddedWidgets,
                deletedWidgets: newDeletedWidgets,
                modifiedWidgets: newModifiedWidgets,
              };
            },
            false,
            "removeWidget"
          ),

        // Nuevos métodos para tracking explícito
        markWidgetAsAdded: (widgetId: string) =>
          set(
            (state) => {
              const newAddedWidgets = new Set(state.addedWidgets);
              newAddedWidgets.add(widgetId);
              return { addedWidgets: newAddedWidgets };
            },
            false,
            "markWidgetAsAdded"
          ),

        markWidgetAsDeleted: (widgetId: string) =>
          set(
            (state) => {
              const newDeletedWidgets = new Set(state.deletedWidgets);
              newDeletedWidgets.add(widgetId);
              return { deletedWidgets: newDeletedWidgets };
            },
            false,
            "markWidgetAsDeleted"
          ),

        markWidgetAsModified: (widgetId: string) =>
          set(
            (state) => {
              const newModifiedWidgets = new Set(state.modifiedWidgets);
              newModifiedWidgets.add(widgetId);
              return { modifiedWidgets: newModifiedWidgets };
            },
            false,
            "markWidgetAsModified"
          ),

        clearWidgetTracking: () =>
          set(
            {
              addedWidgets: new Set<string>(),
              deletedWidgets: new Set<string>(),
              modifiedWidgets: new Set<string>(),
            },
            false,
            "clearWidgetTracking"
          ),
      }),
      {
        // Configurar qué partes del estado entran en el historial
        partialize: (state) => ({
          dashboard: state.dashboard,
          widgets: state.widgets,
          addedWidgets: Array.from(state.addedWidgets),
          deletedWidgets: Array.from(state.deletedWidgets),
          modifiedWidgets: Array.from(state.modifiedWidgets),
        }),
        limit: 50, // Mantener hasta 50 acciones en el historial
      }
    ),
    {
      name: "grid-store",
    }
  )
);

// Exportar hooks útiles para el historial
export const useUndoRedo = () => {
  const { undo, redo, clear, futureStates, pastStates } =
    useGridStore.temporal.getState();

  const canUndo = !!pastStates.length;
  const canRedo = !!futureStates.length;

  return {
    undo,
    redo,
    clear,
    canUndo,
    canRedo,
    historyLength: pastStates.length,
    futureLength: futureStates.length,
  };
};

// Helper para usar tanto UI como Grid store juntos cuando sea necesario
export const useGridAndUI = () => {
  const grid = useGridStore();
  const ui = useUIStore();

  return {
    ...grid,
    ...ui,

    // Métodos combinados
    addWidgetAndSelect: (widget: Widget, layout: Layout) => {
      ui.setLockChanges(true);
      grid.addWidget(widget, layout);
      ui.selectWidget(widget._id);
      if (widget.type !== "text") {
        ui.openConfigSidebar();
      }
    },

    removeWidgetAndClearSelection: (widgetId: string) => {
      ui.setLockChanges(true);
      grid.removeWidget(widgetId);
      if (ui.selectedWidgetId === widgetId) {
        ui.selectWidget(null);
        ui.closeConfigSidebar();
      }
    },
  };
};
