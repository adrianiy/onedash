import mongoose, { Schema } from "mongoose";
import { IUser } from "./User";
import { IDashboard } from "./Dashboard";

// Tipo para representar cualquier valor de variable
export type VariableValue =
  | string
  | number
  | boolean
  | null
  | Record<string, unknown>
  | unknown[];

export interface IVariable {
  _id?: string;
  dashboardId: string | IDashboard;
  userId: string | IUser;
  key: string;
  value: VariableValue; // Puede ser cualquier tipo de valor
  createdAt: Date;
  updatedAt: Date;
}

// Schema para validar variables en MongoDB
const VariableSchema = new Schema<IVariable>(
  {
    dashboardId: {
      type: Schema.Types.ObjectId,
      ref: "Dashboard",
      required: [true, "La variable debe estar asociada a un dashboard"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "La variable debe estar asociada a un usuario"],
    },
    key: {
      type: String,
      required: [true, "El nombre de la variable es obligatorio"],
      trim: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Índice compuesto para buscar variables eficientemente
VariableSchema.index({ dashboardId: 1, userId: 1, key: 1 }, { unique: true });

// Evitar registrar el modelo múltiples veces en desarrollo
export default mongoose.models.Variable ||
  mongoose.model<IVariable>("Variable", VariableSchema);
