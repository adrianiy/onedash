import { NextApiRequest, NextApiResponse } from "next";
import { getTokenFromRequest, verifyToken, TokenPayload } from "./auth";
import User from "./models/User";
import { connectToDatabase } from "./mongodb";

// Extendemos el tipo NextApiRequest para incluir el usuario autenticado
export interface AuthenticatedRequest extends NextApiRequest {
  user?: TokenPayload;
}

// Middleware para verificar autenticación
export const withAuth = (
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Obtener el token de la solicitud
      const token = getTokenFromRequest(req);

      if (!token) {
        return res.status(401).json({
          success: false,
          error: "No autenticado. Se requiere token.",
        });
      }

      // Verificar el token
      const decoded = verifyToken(token);

      if (!decoded) {
        return res.status(401).json({
          success: false,
          error: "Token inválido o expirado.",
        });
      }

      // Añadir el usuario decodificado a la solicitud
      (req as AuthenticatedRequest).user = decoded;

      // Continuar con el handler
      return handler(req as AuthenticatedRequest, res);
    } catch {
      return res.status(500).json({
        success: false,
        error: "Error de autenticación.",
      });
    }
  };
};

// Middleware para verificar rol de administrador
export const withAdmin = (
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) => {
  return withAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      // Verificar si el usuario es admin
      if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          error: "Acceso denegado. Se requiere rol de administrador.",
        });
      }

      // Continuar con el handler
      return handler(req, res);
    } catch {
      return res.status(500).json({
        success: false,
        error: "Error de autorización.",
      });
    }
  });
};

// Middleware para obtener el usuario completo desde la base de datos
export const withUserData = (
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) => {
  return withAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      await connectToDatabase();

      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          error: "Usuario no identificado.",
        });
      }

      // Obtener el usuario completo desde la BD
      // @ts-expect-error: No se puede inferir el tipo de Dashboard
      const user = await User.findById(req.user.id, "-password").exec();

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "Usuario no encontrado.",
        });
      }

      // Extender la interfaz para incluir userData
      interface RequestWithUserData extends AuthenticatedRequest {
        userData?: typeof user;
      }

      // Añadir el documento completo del usuario a la solicitud
      (req as RequestWithUserData).userData = user;

      // Continuar con el handler
      return handler(req, res);
    } catch {
      return res.status(500).json({
        success: false,
        error: "Error al obtener datos de usuario.",
      });
    }
  });
};
