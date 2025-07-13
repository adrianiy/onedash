import mongoose, { Schema } from "mongoose";

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password?: string; // Optional for OAuth users
  image?: string; // Avatar from OAuth provider
  role: "user" | "admin";
  permissions: string[]; // Array of permissions like "publisher"
  providerAccounts?: {
    provider: string;
    providerAccountId: string;
  }[];
  savedDashboards?: string[]; // Array of saved dashboard IDs
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
      required: false, // Not required for OAuth users
      minlength: 6,
      select: false, // No devolver el password en las consultas
    },
    image: {
      type: String,
      required: false,
    },
    providerAccounts: [
      {
        provider: {
          type: String,
          required: true,
        },
        providerAccountId: {
          type: String,
          required: true,
        },
      },
    ],
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    permissions: {
      type: [String],
      default: [],
    },
    savedDashboards: [
      {
        type: Schema.Types.ObjectId,
        ref: "Dashboard",
      },
    ],
  },
  {
    timestamps: true, // Agrega automáticamente createdAt y updatedAt
  }
);

// Evitar registrar el modelo múltiples veces en desarrollo
export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
