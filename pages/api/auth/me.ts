import { NextApiResponse } from "next";
import { AuthenticatedRequest, withUserData } from "../../../lib/middleware";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // Solo aceptar método GET
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Método no permitido",
    });
  }

  try {
    // El middleware withUserData ya se asegura de que exista un usuario
    // y añade los datos completos del usuario a req.userData

    // Accedemos a userData a través de casting
    interface RequestWithUserData extends AuthenticatedRequest {
      userData?: {
        _id: string;
        name: string;
        email: string;
        role: "user" | "admin";
        createdAt: Date;
        updatedAt: Date;
      };
    }

    const { userData } = req as RequestWithUserData;

    if (!userData) {
      return res.status(404).json({
        success: false,
        error: "Usuario no encontrado",
      });
    }

    // Enviar datos del usuario (sin contraseña)
    return res.status(200).json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error("Error en verificación de usuario:", error);
    return res.status(500).json({
      success: false,
      error: "Error en el servidor al verificar usuario",
    });
  }
}

// Usamos el middleware withUserData para proteger la ruta
// y obtener los datos completos del usuario
export default withUserData(handler);
