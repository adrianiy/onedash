import { NextApiResponse } from "next";
import { AuthenticatedRequest, withUserData } from "@/lib/middleware";
import { connectToDatabase } from "@/lib/mongodb";
import Variable from "@/lib/models/Variable";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (!req.user?.id) {
    return res.status(401).json({
      success: false,
      error: "Usuario no autenticado",
    });
  }

  await connectToDatabase();

  // GET - Obtener variables del usuario
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

      // Obtener variables
      const variables = await Variable.find(query);

      return res.status(200).json({
        success: true,
        count: variables.length,
        data: variables,
      });
    } catch (error) {
      console.error("Error al obtener variables:", error);
      return res.status(500).json({
        success: false,
        error: "Error al obtener las variables",
      });
    }
  }

  // POST - Crear una nueva variable
  if (req.method === "POST") {
    try {
      const { dashboardId, key, value } = req.body;

      // Validar datos requeridos
      if (!dashboardId || !key) {
        return res.status(400).json({
          success: false,
          error: "Se requieren dashboardId y key para crear una variable",
        });
      }

      // Verificar si ya existe una variable con la misma key en el dashboard
      const existingVariable = await Variable.findOne({
        dashboardId,
        userId: req.user.id,
        key,
      });

      if (existingVariable) {
        // Actualizar el valor de la variable existente
        existingVariable.value = value;
        await existingVariable.save();

        return res.status(200).json({
          success: true,
          message: "Variable actualizada correctamente",
          data: existingVariable,
        });
      }

      // Crear variable
      const variable = await Variable.create({
        dashboardId,
        userId: req.user.id,
        key,
        value,
      });

      return res.status(201).json({
        success: true,
        data: variable,
      });
    } catch (error) {
      console.error("Error al crear variable:", error);
      return res.status(500).json({
        success: false,
        error: "Error al crear la variable",
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
