import { NextApiResponse } from "next";
import { AuthenticatedRequest, withUserData } from "../../../lib/middleware";
import { connectToDatabase } from "../../../lib/mongodb";
import Dashboard from "../../../lib/models/Dashboard";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (!req.user?.id) {
    return res.status(401).json({
      success: false,
      error: "Usuario no autenticado",
    });
  }

  await connectToDatabase();

  // GET - Obtener todos los dashboards del usuario
  if (req.method === "GET") {
    try {
      // Obtener dashboards propios del usuario
      const ownDashboards = await Dashboard.find({ userId: req.user.id });

      // Obtener dashboards públicos de otros usuarios
      const publicDashboards = await Dashboard.find({
        userId: { $ne: req.user.id },
        visibility: "public",
      }).populate("userId", "name email");

      // Combinar ambos conjuntos
      const dashboards = [...ownDashboards, ...publicDashboards];

      return res.status(200).json({
        success: true,
        count: dashboards.length,
        data: dashboards,
      });
    } catch (error) {
      console.error("Error al obtener dashboards:", error);
      return res.status(500).json({
        success: false,
        error: "Error al obtener los dashboards",
      });
    }
  }

  // POST - Crear un nuevo dashboard
  if (req.method === "POST") {
    try {
      const {
        name,
        description,
        visibility = "private",
        defaultVariables,
        collaborators = [],
      } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          error: "El nombre del dashboard es obligatorio",
        });
      }

      console.log(
        "🔄 Creando dashboard con defaultVariables:",
        defaultVariables
      );

      // Crear dashboard
      const dashboard = await Dashboard.create({
        name,
        description,
        userId: req.user.id,
        visibility,
        layout: [],
        widgets: [],
        defaultVariables: defaultVariables || {},
        collaborators: visibility === "public" ? collaborators : [],
      });

      console.log(
        "✅ Dashboard creado con defaultVariables:",
        dashboard.defaultVariables
      );

      return res.status(201).json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      console.error("Error al crear dashboard:", error);
      return res.status(500).json({
        success: false,
        error: "Error al crear el dashboard",
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
