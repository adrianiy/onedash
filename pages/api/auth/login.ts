import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";
import User from "../../../lib/models/User";
import { comparePassword, generateToken } from "../../../lib/auth";
import { setCookie } from "cookies-next";

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
    // Conectar a la BD
    await connectToDatabase();

    // Extraer datos del body
    const { email, password } = req.body;

    // Validar datos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Por favor, proporciona email y contraseña",
      });
    }

    // Buscar el usuario por email y seleccionar también la contraseña
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Credenciales inválidas",
      });
    }

    // Verificar contraseña
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Credenciales inválidas",
      });
    }

    // Generar token
    const token = generateToken(user);

    // Establecer cookie con el token
    setCookie("token", token, {
      req,
      res,
      maxAge: 30 * 24 * 60 * 60, // 30 días
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // Enviar respuesta exitosa (sin incluir la contraseña)
    return res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({
      success: false,
      error: "Error en el servidor al iniciar sesión",
    });
  }
}
