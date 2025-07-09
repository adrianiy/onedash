import { NextApiRequest, NextApiResponse } from "next";
import { deleteCookie } from "cookies-next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Solo aceptar método POST
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Método no permitido",
    });
  }

  try {
    // Eliminar la cookie de token
    deleteCookie("token", { req, res });

    // Responder con éxito
    return res.status(200).json({
      success: true,
      message: "Sesión cerrada con éxito",
    });
  } catch (error) {
    console.error("Error en logout:", error);
    return res.status(500).json({
      success: false,
      error: "Error en el servidor al cerrar sesión",
    });
  }
}
