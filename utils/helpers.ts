/**
 * Genera un ID único utilizando un método compatible con diferentes entornos
 * @returns string ID único
 */
export function generateId(): string {
  // Usar Date.now() + random para crear un ID único
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}
