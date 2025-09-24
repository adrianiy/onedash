import { Types } from "mongoose";

/**
 * Genera un ID único utilizando un método compatible con diferentes entornos
 * @returns string ID único
 */
export const generateId = () => {
  return new Types.ObjectId().toString();
};

/**
 * Crea una copia profunda de un objeto o valor para evitar referencias compartidas
 * @param value Valor a clonar profundamente
 * @returns Copia profunda del valor original
 */
export const deepClone = <T>(value: T): T => {
  if (value === null || value === undefined || typeof value !== "object") {
    return value;
  }

  // Manejo de Date
  if (value instanceof Date) {
    return new Date(value.getTime()) as unknown as T;
  }

  // Manejo de Array
  if (Array.isArray(value)) {
    return value.map((item) => deepClone(item)) as unknown as T;
  }

  // Manejo de Object (excluyendo casos especiales ya manejados)
  const clonedObj = {} as Record<string, unknown>;
  Object.entries(value as Record<string, unknown>).forEach(([key, val]) => {
    clonedObj[key] = deepClone(val);
  });

  return clonedObj as T;
};
