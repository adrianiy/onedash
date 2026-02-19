import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useGridStore } from "@/store/gridStore";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { DashboardTemplate, getTemplateById } from "@/utils/dashboardTemplates";
import { Dashboard, DashboardLayout } from "@/types/dashboard";
import { Widget } from "@/types/widget";
import { deepClone } from "@/utils/helpers";

/**
 * Hook para manejar la aplicación directa de plantillas de dashboard
 */
export const useTemplateApplication = () => {
  // Acceder a los stores necesarios
  const { dashboard, setDashboard, setWidgets, updateDashboardLayouts } =
    useGridStore();
  const { startEditing } = useUIStore();
  const { user } = useAuthStore();

  /**
   * Genera nuevos IDs únicos para los widgets de la plantilla
   * para evitar colisiones con widgets existentes
   */
  const generateUniqueIds = useCallback(
    (widgets: Widget[]): Record<string, Widget> => {
      const widgetsMap: Record<string, Widget> = {};

      // Crear un mapa de ID originales a nuevos IDs
      const idMap: Record<string, string> = {};

      // Primero asignar nuevos IDs a cada widget
      widgets.forEach((widget) => {
        const originalId = widget._id;
        const newId = uuidv4();
        idMap[originalId] = newId;
      });

      // Luego clonar los widgets con los nuevos IDs
      widgets.forEach((originalWidget) => {
        const widget = deepClone(originalWidget);
        const originalId = widget._id;
        const newId = idMap[originalId];

        widget._id = newId;
        widget.createdAt = new Date();
        widget.updatedAt = new Date();

        widgetsMap[newId] = widget;
      });

      return widgetsMap;
    },
    []
  );

  /**
   * Actualiza los layouts con los nuevos IDs de widgets
   */
  const updateLayoutIds = useCallback(
    (
      layouts: Record<string, DashboardLayout[]>,
      idMap: Record<string, string>
    ): Record<string, DashboardLayout[]> => {
      const updatedLayouts: Record<string, DashboardLayout[]> = {};

      Object.keys(layouts).forEach((breakpoint) => {
        updatedLayouts[breakpoint] = layouts[breakpoint].map((layout) => ({
          ...layout,
          i: idMap[layout.i] || layout.i,
        }));
      });

      return updatedLayouts;
    },
    []
  );

  /**
   * Aplicar una plantilla al dashboard actual
   */
  const applyTemplate = useCallback(
    (templateId: string): boolean => {
      try {
        // Obtener la plantilla por ID
        const template = getTemplateById(templateId);
        if (!template) {
          console.error(`Plantilla no encontrada: ${templateId}`);
          return false;
        }

        // Generar nuevos IDs para los widgets
        const idMap: Record<string, string> = {};
        const widgetsWithUniqueIds = template.widgets.map((widget) => {
          const originalId = widget._id;
          const newId = uuidv4();
          idMap[originalId] = newId;

          return {
            ...deepClone(widget),
            _id: newId,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        });

        // Crear un mapa de widgets indexados por ID
        const widgetsMap = widgetsWithUniqueIds.reduce((acc, widget) => {
          acc[widget._id] = widget;
          return acc;
        }, {} as Record<string, Widget>);

        // Actualizar layouts con los nuevos IDs
        const updatedLayouts = Object.entries(template.layouts).reduce(
          (acc, [breakpoint, layouts]) => {
            acc[breakpoint as keyof typeof template.layouts] = layouts.map(
              (layout) => ({
                ...layout,
                i: idMap[layout.i] || layout.i,
              })
            );
            return acc;
          },
          {} as Record<keyof typeof template.layouts, DashboardLayout[]>
        );

        // Si ya existe un dashboard, actualizar su contenido
        if (dashboard) {
          // Actualizar el dashboard existente
          setDashboard({
            ...dashboard,
            widgets: widgetsWithUniqueIds.map((w) => w._id),
            layouts: updatedLayouts,
          });
        } else {
          // Crear un nuevo dashboard basado en la plantilla
          const newDashboard: Dashboard = {
            _id: uuidv4(),
            name: template.name,
            description: template.description,
            layouts: updatedLayouts,
            widgets: widgetsWithUniqueIds.map((w) => w._id),
            userId: user?._id || "unknown",
            visibility: "private",
            isReadonly: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          setDashboard(newDashboard);
        }

        // Establecer los widgets en el store
        setWidgets(widgetsMap);

        // Activar el modo de edición
        startEditing();

        return true;
      } catch (error) {
        console.error("Error al aplicar plantilla:", error);
        return false;
      }
    },
    [dashboard, user, setDashboard, setWidgets, startEditing]
  );

  return {
    applyTemplate,
  };
};
