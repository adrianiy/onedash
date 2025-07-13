import { NextApiResponse } from "next";
import { AuthenticatedRequest, withUserData } from "@/lib/middleware";
import { connectToDatabase } from "@/lib/mongodb";
import Widget from "@/lib/models/Widget";
import mongoose from "mongoose";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (!req.user?.id) {
    return res.status(401).json({
      success: false,
      error: "Usuario no autenticado",
    });
  }

  await connectToDatabase();

  const { id } = req.query;

  // Validar que el ID sea válido
  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    return res.status(400).json({
      success: false,
      error: "ID de widget inválido",
    });
  }

  try {
    // Obtener el widget por ID
    const widget = await Widget.findById(id);

    // Verificar si existe el widget
    if (!widget) {
      return res.status(404).json({
        success: false,
        error: "Widget no encontrado",
      });
    }

    // Verificar si el usuario tiene acceso al dashboard que contiene el widget
    if (widget.dashboardId) {
      const Dashboard = (await import("../../../lib/models/Dashboard")).default;
      const dashboard = await Dashboard.findById(widget.dashboardId);

      if (!dashboard) {
        return res.status(404).json({
          success: false,
          error: "Dashboard asociado no encontrado",
        });
      }

      // Verificar permisos: propietario, público, compartido o colaborador
      const isOwner = dashboard.userId.toString() === req.user!.id;
      const isPublic = dashboard.visibility === "public";
      const isShared = dashboard.isShared === true;
      const isCollaborator = dashboard.collaborators?.some(
        (collaboratorId: string) => collaboratorId.toString() === req.user!.id
      );

      const hasAccess = isOwner || isPublic || isShared || isCollaborator;

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: "No tienes permiso para acceder a este widget",
        });
      }
    }

    // GET - Obtener widget por ID
    if (req.method === "GET") {
      return res.status(200).json({
        success: true,
        data: widget,
      });
    }

    // PUT - Actualizar widget
    if (req.method === "PUT") {
      // Campos permitidos para actualizar
      const { title, config, events, isConfigured, dashboardId } = req.body;

      // Actualizar solo los campos permitidos
      if (title) widget.title = title;
      if (config) widget.config = config;
      if (events) widget.events = events;
      if (isConfigured !== undefined) widget.isConfigured = isConfigured;
      if (dashboardId !== undefined) widget.dashboardId = dashboardId;

      // Guardar cambios
      await widget.save();

      return res.status(200).json({
        success: true,
        data: widget,
      });
    }

    // DELETE - Eliminar widget
    if (req.method === "DELETE") {
      // Eliminar el widget
      await widget.deleteOne();

      return res.status(200).json({
        success: true,
        message: "Widget eliminado correctamente",
      });
    }

    // Para otros métodos
    return res.status(405).json({
      success: false,
      error: `Método ${req.method} no permitido`,
    });
  } catch (error) {
    console.error(`Error al procesar widget ${id}:`, error);
    return res.status(500).json({
      success: false,
      error: "Error al procesar la solicitud del widget",
    });
  }
}

export default withUserData(handler);
