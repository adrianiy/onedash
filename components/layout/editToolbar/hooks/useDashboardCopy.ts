import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useGridStore } from "@/store/gridStore";
import { Dashboard, Breakpoint, DashboardLayout } from "@/types/dashboard";
import { useCreateDashboardMutation } from "@/hooks/queries/dashboards";
import { useCreateWidgetMutation } from "@/hooks/queries/widgets/useCreateWidgetMutation";
import { generateId } from "@/utils/helpers";
import { Widget } from "@/types/widget";

interface UseDashboardCopyResult {
  copyDashboard: (
    dashboard: Dashboard,
    newName: string
  ) => Promise<string | undefined>;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook personalizado para copiar dashboards con sus widgets
 */
export const useDashboardCopy = (): UseDashboardCopyResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { mutateAsync: createDashboard } = useCreateDashboardMutation();
  const { mutateAsync: createWidget } = useCreateWidgetMutation();
  const userId = useAuthStore((state) => state.user?._id) || "";

  /**
   * Copia un dashboard y todos sus widgets
   * @param dashboard Dashboard a copiar
   * @param newName Nuevo nombre para la copia
   * @returns El ID del nuevo dashboard creado o undefined si ocurre un error
   */
  const copyDashboard = async (
    dashboard: Dashboard,
    newName: string
  ): Promise<string | undefined> => {
    setIsLoading(true);
    setError(null);

    try {
      // Obtener widgets del estado en lugar de hacer una petición a la API
      const allWidgets = useGridStore.getState().widgets || {};

      // Filtrar solo los widgets que pertenecen al dashboard actual
      const dashboardWidgets = Object.values(allWidgets).filter(
        (widget) => widget.dashboardId === dashboard._id
      );

      if (dashboardWidgets.length === 0) {
        throw new Error("No se encontraron widgets en el dashboard");
      }

      // Crear mapeo de IDs antiguos a nuevos IDs
      const idMapping: Record<string, string> = {};
      const newWidgetIds: string[] = [];

      // Generar nuevos IDs para cada widget
      dashboardWidgets.forEach((widget) => {
        const newWidgetId = generateId();
        idMapping[widget._id] = newWidgetId;
        newWidgetIds.push(newWidgetId);
      });

      // Crear copias de los layouts con los nuevos IDs
      const newLayouts: Record<Breakpoint, DashboardLayout[]> = {
        lg: [],
        md: [],
        sm: [],
      };

      // Actualizar los layouts para cada breakpoint
      Object.keys(dashboard.layouts).forEach((breakpoint) => {
        const breakpointLayouts = dashboard.layouts[breakpoint as Breakpoint];

        newLayouts[breakpoint as Breakpoint] = breakpointLayouts.map(
          (layout) => ({
            ...layout,
            i: idMapping[layout.i] || layout.i,
          })
        );
      });

      // Crear el nuevo dashboard
      const newDashboard = await createDashboard({
        name: newName,
        description: dashboard.description,
        layouts: newLayouts,
        widgets: newWidgetIds,
        variables: dashboard.variables,
        visibility: "private",
        userId,
        originalId: dashboard._id,
      });

      // Crear copias de todos los widgets con los nuevos IDs
      await Promise.all(
        dashboardWidgets.map(async (widget) => {
          const newWidgetId = idMapping[widget._id];
          if (!newWidgetId) return;

          // Crear la copia del widget con el nuevo ID
          return createWidget({
            widgetData: {
              _id: newWidgetId, // Especificar el ID que queremos usar
              type: widget.type,
              title: widget.title,
              description: widget.description,
              config: widget.config,
              events: widget.events || [],
              isConfigured: widget.isConfigured || false,
              dashboardId: newDashboard._id, // Referencia al nuevo dashboard
            } as Widget,
            dashboardId: newDashboard._id,
          });
        })
      );

      console.log(
        `Dashboard copiado como: ${newName} con ${newWidgetIds.length} widgets`
      );

      return newDashboard._id; // Devolver el ID del dashboard creado
    } catch (err) {
      console.error("Error al copiar el dashboard:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return undefined;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    copyDashboard,
    isLoading,
    error,
  };
};
