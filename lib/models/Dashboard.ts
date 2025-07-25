import mongoose, { Schema } from "mongoose";
import { IUser } from "./User";
import { Types } from "mongoose";
import { VariableValue } from "./Variable";
import { Breakpoint } from "@/types/dashboard";

// Interfaces de tipos
export interface DashboardLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export interface IDashboard {
  _id?: string | Types.ObjectId;
  name: string;
  description?: string;

  // Reemplazar layout por layouts
  layouts: Record<Breakpoint, DashboardLayout[]>;

  widgets: string[]; // Referencias a los IDs de widgets
  userId: string | Types.ObjectId | IUser; // Referencia al propietario
  collaborators?: Array<string | Types.ObjectId>; // IDs de usuarios con permisos de edición
  visibility: "public" | "private";
  originalId?: string | Types.ObjectId; // Referencia al dashboard original (para copias)
  defaultVariables?: Record<string, VariableValue>; // Valores por defecto de variables
  isShared?: boolean; // Indica si el dashboard es compartible con usuarios autenticados
  createdAt: Date;
  updatedAt: Date;
}

interface LayoutsObject {
  lg: unknown[];
  md: unknown[];
  sm: unknown[];
  [key: string]: unknown[];
}

const DashboardSchema = new Schema<IDashboard>(
  {
    name: {
      type: String,
      required: [true, "Por favor, añade un nombre"],
      trim: true,
      maxlength: [100, "El nombre no puede tener más de 100 caracteres"],
    },
    description: {
      type: String,
      maxlength: [500, "La descripción no puede tener más de 500 caracteres"],
    },

    // Reemplazar layout por layouts
    layouts: {
      type: Schema.Types.Mixed, // Usamos Mixed para almacenar un objeto complejo
      default: {
        lg: [],
        md: [],
        sm: [],
      },
      validate: {
        validator: function (value: LayoutsObject) {
          // Validar que layouts tiene las propiedades esperadas
          return (
            value &&
            typeof value === "object" &&
            Array.isArray(value.lg) &&
            Array.isArray(value.md) &&
            Array.isArray(value.sm)
          );
        },
        message: 'Los layouts deben contener arrays para "lg", "md" y "sm"',
      },
    },

    widgets: {
      type: [String], // Array de IDs de widgets
      default: [],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "El dashboard debe estar asociado a un usuario"],
    },
    collaborators: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "private",
    },
    originalId: {
      type: Schema.Types.ObjectId,
      ref: "Dashboard",
    },
    defaultVariables: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isShared: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Evitar registrar el modelo múltiples veces en desarrollo
export default mongoose.models.Dashboard ||
  mongoose.model<IDashboard>("Dashboard", DashboardSchema);
