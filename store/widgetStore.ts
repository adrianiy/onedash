import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Types } from "mongoose";
import type { Widget } from "@/types/widget";

interface WidgetState {
  widgets: Widget[];
  isLoading: boolean;

  // Actions with improved type safety
  addWidget: <T extends Widget["type"]>(
    widget: Omit<
      Extract<Widget, { type: T }>,
      "_id" | "createdAt" | "updatedAt"
    >
  ) => Extract<Widget, { type: T }>;
  updateWidget: (
    _id: string,
    updates: Partial<Omit<Widget, "type" | "_id">>
  ) => void;
  deleteWidget: (_id: string) => void;
  getWidget: (_id: string) => Widget | undefined;
  getWidgetsByIds: (ids: string[]) => Widget[];
  setWidgets: (widgets: Widget[]) => void;
  fetchWidgetsByDashboardId: (dashboardId: string) => Promise<void>;
}

// Generar ID único usando ObjectId de MongoDB
const generateId = () => {
  return new Types.ObjectId().toString();
};

export const useWidgetStore = create<WidgetState>()(
  devtools((set, get) => ({
    widgets: [],
    isLoading: false,

    // Crear un nuevo widget (solo local)
    addWidget: (widgetData) => {
      const now = new Date();
      const _id = generateId();

      const newWidget = {
        ...widgetData,
        _id,
        createdAt: now,
        updatedAt: now,
        events: widgetData.events || [],
        isConfigured: widgetData.isConfigured || false,
        persisted: false, // Nuevo widget no persistido aún
      } as Extract<Widget, { type: typeof widgetData.type }>;

      // Actualizar estado local
      set((state: WidgetState) => ({
        widgets: [...state.widgets, newWidget],
      }));

      return newWidget;
    },

    // Actualizar un widget existente
    updateWidget: (_id, updates) => {
      set((state: WidgetState) => ({
        widgets: state.widgets.map((widget) => {
          if (widget._id !== _id) return widget;

          // Verificar que no se intente cambiar propiedades inmutables
          if ("type" in updates || "_id" in updates) {
            console.warn(
              "No se pueden modificar propiedades inmutables del widget"
            );
            return widget;
          }

          // Crear widget actualizado manteniendo la seguridad de tipos
          const updatedWidget = {
            ...widget,
            ...updates,
            updatedAt: new Date(),
            // Asegurar que estas propiedades no cambien
            _id: widget._id,
            type: widget.type,
          } as Widget;

          return updatedWidget;
        }),
      }));
    },

    // Eliminar un widget
    deleteWidget: (_id) => {
      set((state) => ({
        widgets: state.widgets.filter((widget) => widget._id !== _id),
      }));
    },

    // Obtener un widget por su ID (desde el estado local)
    getWidget: (_id) => {
      return get().widgets.find((widget) => widget._id === _id);
    },

    // Obtener widgets por IDs (desde el estado local)
    getWidgetsByIds: (ids) => {
      const { widgets } = get();
      return widgets.filter((widget) => ids.includes(widget._id));
    },

    // Establecer widgets directamente (para restaurar desde snapshot)
    setWidgets: (widgets) => {
      set({ widgets });
    },

    // Cargar widgets de un dashboard específico desde MongoDB
    fetchWidgetsByDashboardId: async (dashboardId: string) => {
      // Validar que sea un ID de MongoDB
      if (!/^[0-9a-f]{24}$/.test(dashboardId)) {
        console.log(
          "⚠️ ID de dashboard no válido para MongoDB, omitiendo carga de widgets"
        );
        return;
      }

      set({ isLoading: true });

      try {
        const { apiService } = await import("../services/apiService");
        const response = await apiService.get(
          `/widgets?dashboardId=${dashboardId}`
        );

        if (response.success && response.data) {
          const widgetsFromAPI = (response.data as Widget[]).map(
            (widget: Widget) => ({
              ...widget,
              createdAt: new Date(widget.createdAt),
              updatedAt: new Date(widget.updatedAt),
              persisted: true, // Los widgets que vienen de la API están persistidos
            })
          );

          set((state) => ({
            // Mantener otros widgets que no son de este dashboard
            widgets: [
              ...state.widgets.filter((w) => w.dashboardId !== dashboardId),
              ...widgetsFromAPI,
            ],
            isLoading: false,
          }));

          console.log(
            `✅ ${widgetsFromAPI.length} widgets cargados para el dashboard ${dashboardId}`
          );
        } else {
          set({ isLoading: false });
        }
      } catch (error) {
        console.error(
          `❌ Error al cargar widgets del dashboard ${dashboardId}:`,
          error
        );
        set({ isLoading: false });
      }
    },
  }))
);
