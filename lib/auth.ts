import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IUser } from "./models/User";

// Constantes para JWT
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "30d";

// Validar que JWT_SECRET esté definido
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET must be defined");
}

/**
 * Genera un hash para una contraseña
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

/**
 * Compara una contraseña con un hash
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Genera un token JWT para un usuario
 */
export const generateToken = (user: IUser): string => {
  const payload = {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  // @ts-expect-error - Temporal fix for jsonwebtoken type issues
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Interfaz para el payload del token JWT
 */
export interface TokenPayload {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  iat?: number;
  exp?: number;
}

/**
 * Verifica un token JWT
 */
export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
};

/**
 * Interfaz para la request con headers y cookies
 */
export interface RequestWithAuth {
  headers: {
    authorization?: string;
  };
  cookies?: {
    token?: string;
  };
}

/**
 * Obtiene el token de la petición
 */
export const getTokenFromRequest = (req: RequestWithAuth): string | null => {
  // Obtener el token de la cabecera Authorization
  const authHeader = req.headers.authorization;

  // Comprobar si hay token y si es del tipo Bearer
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  // Obtener el token de las cookies
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  return null;
};
