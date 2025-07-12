import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { hashPassword, generateToken } from "@/lib/auth";
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
    const { name, email, password } = req.body;

    // Validar datos
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Por favor, proporciona todos los campos requeridos",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    // Verificar si el correo ya existe
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "El correo electrónico ya está registrado",
      });
    }

    // Hashear la contraseña
    const hashedPassword = await hashPassword(password);

    // Crear el usuario
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user", // Por defecto todos los usuarios son rol 'user'
    });

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
    return res.status(201).json({
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
    console.error("Error en registro:", error);
    return res.status(500).json({
      success: false,
      error: "Error en el servidor al registrar el usuario",
    });
  }
}
