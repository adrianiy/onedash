import { NextApiResponse } from "next";
import { AuthenticatedRequest, withUserData } from "../../../lib/middleware";
import { connectToDatabase } from "../../../lib/mongodb";
import Widget, { IWidget } from "../../../lib/models/Widget";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (!req.user?.id) {
    return res.status(401).json({
      success: false,
      error: "Usuario no autenticado",
    });
  }

  await connectToDatabase();

  // GET - Obtener widgets por dashboard
  if (req.method === "GET") {
    try {
      const { dashboardId } = req.query;

      // El dashboardId es requerido
      if (!dashboardId) {
        return res.status(400).json({
          success: false,
          error: "Se requiere el ID del dashboard",
        });
      }

      // Verificar que el usuario tenga acceso al dashboard
      const Dashboard = (await import("../../../lib/models/Dashboard")).default;
      const dashboard = await Dashboard.findById(dashboardId);

      if (!dashboard) {
        return res.status(404).json({
          success: false,
          error: "Dashboard no encontrado",
        });
      }

      // Verificar permisos: propietario o publico
      const hasAccess =
        dashboard.userId.toString() === req.user!.id ||
        dashboard.visibility === "public";

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: "No tienes permisos para acceder a este dashboard",
        });
      }

      // Obtener widgets del dashboard
      const widgets = await Widget.find({ dashboardId });

      return res.status(200).json({
        success: true,
        count: widgets.length,
        data: widgets,
      });
    } catch (error) {
      console.error("Error al obtener widgets:", error);
      return res.status(500).json({
        success: false,
        error: "Error al obtener los widgets",
      });
    }
  }

  // POST - Crear un nuevo widget
  if (req.method === "POST") {
    try {
      const { type, title, config, dashboardId, _id } = req.body;

      // Validar datos requeridos
      if (!type || !dashboardId) {
        return res.status(400).json({
          success: false,
          error: "Se requieren type y dashboardId",
        });
      }

      // Verificar que el usuario tenga acceso al dashboard
      const Dashboard = (await import("../../../lib/models/Dashboard")).default;
      const dashboard = await Dashboard.findById(dashboardId);

      if (!dashboard) {
        return res.status(404).json({
          success: false,
          error: "Dashboard no encontrado",
        });
      }

      // Verificar permisos: propietario o colaborador
      const hasAccess =
        dashboard.userId.toString() === req.user!.id ||
        dashboard.collaborators?.some(
          (collaboratorId: string) => collaboratorId.toString() === req.user!.id
        );

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: "No tienes permisos para crear widgets en este dashboard",
        });
      }

      // Tipos de widgets válidos
      const validTypes = ["chart", "metric", "table", "text"];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          error: `Tipo de widget inválido. Debe ser uno de: ${validTypes.join(
            ", "
          )}`,
        });
      }

      // Crear widget con el _id proporcionado si existe
      const widgetData: Omit<IWidget, "createdAt" | "updatedAt"> = {
        type,
        title,
        config,
        dashboardId,
        userId: req.user!.id,
        isConfigured: false,
        events: [],
      };

      // Si se proporciona un _id válido, usarlo
      if (_id && /^[0-9a-f]{24}$/.test(_id)) {
        widgetData._id = _id;
      }

      const widget = await Widget.create(widgetData);

      return res.status(201).json({
        success: true,
        data: widget,
      });
    } catch (error) {
      console.error("Error al crear widget:", error);
      return res.status(500).json({
        success: false,
        error: "Error al crear el widget",
      });
    }
  }

  // Para otros métodos
  return res.status(405).json({
    success: false,
    error: `Método ${req.method} no permitido`,
  });
}

export default withUserData(handler);
