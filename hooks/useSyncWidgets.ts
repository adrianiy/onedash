import {
  useUpdateWidgetMutation,
  useCreateWidgetMutation,
  useDeleteWidgetMutation,
} from "@/hooks/queries/widgets";
import { useGridStore } from "@/store/gridStore";

interface SyncWidgetsOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Hook para sincronizar los widgets del gridStore con el backend
 * utilizando los hooks de React Query
 */
export function useSyncWidgets() {
  const { mutate: updateWidget } = useUpdateWidgetMutation();
  const { mutate: createWidget } = useCreateWidgetMutation();
  const { mutate: deleteWidget } = useDeleteWidgetMutation();

  const {
    widgets,
    addedWidgets,
    deletedWidgets,
    modifiedWidgets,
    clearWidgetTracking,
  } = useGridStore();

  /**
   * Sincroniza todos los widgets con el backend en paralelo
   */
  const syncWidgets = async (options?: SyncWidgetsOptions): Promise<void> => {
    try {
      if (!widgets) return;

      // 1. Crear widgets nuevos
      const createPromises = Array.from(addedWidgets).map(
        (widgetId) =>
          new Promise<void>((resolve, reject) => {
            const widget = widgets[widgetId];
            if (!widget) {
              resolve(); // Widget no encontrado, posiblemente fue eliminado
              return;
            }

            // Extraer solo las propiedades relevantes para la creación

            createWidget(
              {
                widgetData: widget,
                dashboardId: widget.dashboardId || "",
              },
              {
                onSuccess: () => resolve(),
                onError: reject,
              }
            );
          })
      );

      // 2. Actualizar widgets modificados
      const updatePromises = Array.from(modifiedWidgets).map(
        (widgetId) =>
          new Promise<void>((resolve, reject) => {
            const widget = widgets[widgetId];
            if (!widget) {
              resolve(); // Widget no encontrado, posiblemente fue eliminado
              return;
            }

            // No necesitamos estas propiedades pero las extraemos para no enviarlas
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { _id, createdAt, updatedAt, type, ...updatableProps } =
              widget;

            updateWidget(
              {
                widgetId: _id,
                updates: updatableProps,
              },
              {
                onSuccess: () => resolve(),
                onError: reject,
              }
            );
          })
      );

      // 3. Eliminar widgets
      const deletePromises = Array.from(deletedWidgets).map(
        (widgetId) =>
          new Promise<void>((resolve, reject) => {
            deleteWidget(
              {
                widgetId,
                dashboardId: widgets[widgetId]?.dashboardId,
              },
              {
                onSuccess: () => resolve(),
                onError: reject,
              }
            );
          })
      );

      // Ejecutar todas las promesas en paralelo
      await Promise.all([
        ...createPromises,
        ...updatePromises,
        ...deletePromises,
      ]);

      // Limpiar el tracking después de sincronizar exitosamente
      clearWidgetTracking();

      // Llamar al callback de éxito si se proporciona
      options?.onSuccess?.();
    } catch (error) {
      // Manejar errores
      console.error("Error sincronizando widgets:", error);
      options?.onError?.(error as Error);
      throw error;
    }
  };

  return { syncWidgets };
}
