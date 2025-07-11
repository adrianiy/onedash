import { NextApiResponse } from "next";
import { AuthenticatedRequest, withUserData } from "@/lib/middleware";
import { connectToDatabase } from "@/lib/mongodb";
import Variable from "@/lib/models/Variable";
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
      error: "ID de variable inválido",
    });
  }

  try {
    // Obtener la variable por ID
    const variable = await Variable.findById(id);

    // Verificar si existe la variable
    if (!variable) {
      return res.status(404).json({
        success: false,
        error: "Variable no encontrada",
      });
    }

    // Verificar si el usuario es el propietario de la variable
    if (variable.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "No tienes permiso para acceder a esta variable",
      });
    }

    // GET - Obtener variable por ID
    if (req.method === "GET") {
      return res.status(200).json({
        success: true,
        data: variable,
      });
    }

    // PUT - Actualizar variable
    if (req.method === "PUT") {
      // Solo se permite actualizar el valor
      const { value } = req.body;

      if (value !== undefined) {
        variable.value = value;
        await variable.save();
      }

      return res.status(200).json({
        success: true,
        data: variable,
      });
    }

    // DELETE - Eliminar variable
    if (req.method === "DELETE") {
      // Eliminar la variable
      await variable.deleteOne();

      return res.status(200).json({
        success: true,
        message: "Variable eliminada correctamente",
      });
    }

    // Para otros métodos
    return res.status(405).json({
      success: false,
      error: `Método ${req.method} no permitido`,
    });
  } catch (error) {
    console.error(`Error al procesar variable ${id}:`, error);
    return res.status(500).json({
      success: false,
      error: "Error al procesar la solicitud de la variable",
    });
  }
}

export default withUserData(handler);
