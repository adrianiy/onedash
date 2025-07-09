import mongoose, { Schema } from "mongoose";

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Por favor, añade un nombre"],
    },
    email: {
      type: String,
      required: [true, "Por favor, añade un email"],
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Por favor, añade un email válido",
      ],
    },
    password: {
      type: String,
      required: [true, "Por favor, añade una contraseña"],
      minlength: 6,
      select: false, // No devolver el password en las consultas
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true, // Agrega automáticamente createdAt y updatedAt
  }
);

// Evitar registrar el modelo múltiples veces en desarrollo
export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
