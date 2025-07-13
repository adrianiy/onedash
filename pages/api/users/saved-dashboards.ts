import { NextApiResponse } from "next";
import { AuthenticatedRequest, withUserData } from "@/lib/middleware";
import { connectToDatabase } from "@/lib/mongodb";
import User, { IUser } from "@/lib/models/User";
import Dashboard from "@/lib/models/Dashboard";
import mongoose from "mongoose";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (!req.user?.id) {
    return res.status(401).json({
      success: false,
      error: "Usuario no autenticado",
    });
  }

  await connectToDatabase();

  // GET - Obtener todos los dashboards guardados del usuario
  if (req.method === "GET") {
    try {
      // Obtener el usuario con los dashboards guardados
      const user = await User.findById(req.user.id).lean();
      const typedUser = user as unknown as IUser;

      if (
        !typedUser?.savedDashboards ||
        typedUser.savedDashboards.length === 0
      ) {
        return res.status(200).json({
          success: true,
          count: 0,
          data: [],
        });
      }

      // Obtener los dashboards completos
      const savedDashboards = await Dashboard.find({
        _id: { $in: typedUser.savedDashboards },
      }).lean();

      return res.status(200).json({
        success: true,
        count: savedDashboards.length,
        data: savedDashboards,
      });
    } catch (error) {
      console.error("Error al obtener dashboards guardados:", error);
      return res.status(500).json({
        success: false,
        error: "Error al obtener dashboards guardados",
      });
    }
  }

  // POST - Guardar un dashboard en la lista de favoritos
  if (req.method === "POST") {
    try {
      const { dashboardId } = req.body;

      if (!dashboardId) {
        return res.status(400).json({
          success: false,
          error: "Se requiere un ID de dashboard",
        });
      }

      // Verificar que el dashboard existe
      const dashboard = await Dashboard.findById(dashboardId);
      if (!dashboard) {
        return res.status(404).json({
          success: false,
          error: "Dashboard no encontrado",
        });
      }

      // Verificar que el dashboard es público o está compartido
      const isOwner = dashboard.userId.toString() === req.user?.id;
      const isPublic = dashboard.visibility === "public";
      const isShared = dashboard.isShared === true;
      const isCollaborator = dashboard.collaborators?.some(
        (collaboratorId: mongoose.Types.ObjectId) =>
          collaboratorId.toString() === req.user?.id
      );

      // Si no es propietario y no es público/compartido, denegar acceso
      if (!isOwner && !isPublic && !isShared && !isCollaborator) {
        return res.status(403).json({
          success: false,
          error: "No tienes permisos para guardar este dashboard",
        });
      }

      // Actualizar el documento del usuario añadiendo el dashboard a savedDashboards
      const result = await User.findByIdAndUpdate(
        req.user.id,
        {
          $addToSet: {
            savedDashboards: new mongoose.Types.ObjectId(dashboardId),
          },
        },
        { new: true }
      );

      if (!result) {
        return res.status(404).json({
          success: false,
          error: "Usuario no encontrado",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Dashboard guardado correctamente",
      });
    } catch (error) {
      console.error("Error al guardar dashboard:", error);
      return res.status(500).json({
        success: false,
        error: "Error al guardar el dashboard",
      });
    }
  }

  // DELETE - Eliminar un dashboard de la lista de favoritos
  if (req.method === "DELETE") {
    try {
      const { dashboardId } = req.query;

      if (!dashboardId) {
        return res.status(400).json({
          success: false,
          error: "Se requiere un ID de dashboard",
        });
      }

      // Actualizar el documento del usuario eliminando el dashboard de savedDashboards
      const result = await User.findByIdAndUpdate(
        req.user.id,
        {
          $pull: { savedDashboards: dashboardId },
        },
        { new: true }
      );

      if (!result) {
        return res.status(404).json({
          success: false,
          error: "Usuario no encontrado",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Dashboard eliminado de guardados correctamente",
      });
    } catch (error) {
      console.error("Error al eliminar dashboard de guardados:", error);
      return res.status(500).json({
        success: false,
        error: "Error al eliminar el dashboard de guardados",
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
