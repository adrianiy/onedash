import { Types } from "mongoose";

/**
 * Genera un ID único utilizando un método compatible con diferentes entornos
 * @returns string ID único
 */
export const generateId = () => {
  return new Types.ObjectId().toString();
};
