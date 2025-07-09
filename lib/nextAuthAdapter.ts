import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { Session } from "next-auth";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import { TokenPayload } from "./auth";
import { connectToDatabase } from "./mongodb";
import User from "./models/User";

/**
 * Obtiene la sesión de NextAuth del request
 */
export const getNextAuthSession = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const session = await getServerSession(req, res, authOptions);
    return session;
  } catch (error) {
    console.error("Error getting NextAuth session:", error);
    return null;
  }
};

/**
 * Convierte una sesión de NextAuth en TokenPayload para compatibilidad
 */
export const sessionToTokenPayload = async (
  session: Session
): Promise<TokenPayload | null> => {
  if (!session?.user?.email) {
    return null;
  }

  try {
    await connectToDatabase();

    // Obtener datos completos del usuario desde la BD usando el email
    // Esto es más seguro que usar el ID que puede tener un formato incorrecto
    const user = await User.findOne({ email: session.user.email }).exec();

    if (!user) {
      return null;
    }

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };
  } catch (error) {
    console.error("Error converting session to token payload:", error);
    return null;
  }
};

/**
 * Verifica autenticación usando NextAuth
 */
export const verifyNextAuthSession = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<TokenPayload | null> => {
  try {
    const session = await getNextAuthSession(req, res);

    if (!session) {
      return null;
    }

    return await sessionToTokenPayload(session);
  } catch (error) {
    console.error("Error verifying NextAuth session:", error);

    // Si hay un error de descifrado de JWT, registrar información útil para depuración
    if (error instanceof Error && error.name === "JWEDecryptionFailed") {
      console.warn(
        "NextAuth JWT decryption failed. This usually happens when NEXTAUTH_SECRET changes or is missing.",
        "Please check your .env.local file and ensure NEXTAUTH_SECRET is set correctly."
      );
    }

    return null;
  }
};
