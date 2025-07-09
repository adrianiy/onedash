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

  // GET - Obtener todos los widgets del usuario
  if (req.method === "GET") {
    try {
      // Opcionalmente filtrar por dashboard
      const { dashboardId } = req.query;

      // Construir la consulta
      const query: Record<string, unknown> = { userId: req.user.id };

      // Si se especifica un dashboardId, filtrar por él
      if (dashboardId) {
        query.dashboardId = dashboardId;
      }

      // Obtener widgets
      // @ts-expect-error: No se puede inferir el tipo de widgetData
      const widgets = await Widget.find(query);

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
      if (!type) {
        return res.status(400).json({
          success: false,
          error: "Se requieren type",
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
        userId: req.user.id,
        isConfigured: false,
        events: [],
      };

      // Si se proporciona un _id válido, usarlo
      if (_id && /^[0-9a-f]{24}$/.test(_id)) {
        widgetData._id = _id;
      }

      // @ts-expect-error: No se puede inferir el tipo de widgetData
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
