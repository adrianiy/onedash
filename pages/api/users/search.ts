import { NextApiResponse } from "next";
import { AuthenticatedRequest, withUserData } from "../../../lib/middleware";
import { connectToDatabase } from "../../../lib/mongodb";
import User from "../../../lib/models/User";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (!req.user?.id) {
    return res.status(401).json({
      success: false,
      error: "Usuario no autenticado",
    });
  }

  await connectToDatabase();

  // GET - Buscar usuarios por nombre o email
  if (req.method === "GET") {
    try {
      const { q, limit = 10 } = req.query;

      if (!q || typeof q !== "string") {
        return res.status(400).json({
          success: false,
          error: "Parámetro de búsqueda requerido",
        });
      }

      const searchQuery = q.trim();
      if (searchQuery.length < 2) {
        return res.status(400).json({
          success: false,
          error: "La búsqueda debe tener al menos 2 caracteres",
        });
      }

      // Buscar usuarios por nombre o email (case insensitive)
      // Excluir al usuario actual de los resultados
      const users = await User.find({
        _id: { $ne: req.user.id },
        $or: [
          { name: { $regex: searchQuery, $options: "i" } },
          { email: { $regex: searchQuery, $options: "i" } },
        ],
      })
        .select("_id name email") // Solo devolver campos necesarios
        .limit(parseInt(limit as string))
        .lean();

      return res.status(200).json({
        success: true,
        count: users.length,
        data: users,
      });
    } catch (error) {
      console.error("Error al buscar usuarios:", error);
      return res.status(500).json({
        success: false,
        error: "Error al buscar usuarios",
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
