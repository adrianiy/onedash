import mongoose from "mongoose";

// Definir el URI de MongoDB desde las variables de entorno
const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  throw new Error("Por favor, define la variable de entorno MONGODB_URI");
}

// Variable para almacenar la conexión (evita conexiones múltiples en desarrollo)
declare global {
  var mongoConnection: {
    client: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

// Inicializar la variable global en desarrollo
if (!global.mongoConnection) {
  global.mongoConnection = {
    client: null,
    promise: null,
  };
}

/**
 * Función para conectar a MongoDB usando Mongoose
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  // Si ya hay una conexión, retornarla
  if (global.mongoConnection.client) {
    return global.mongoConnection.client;
  }

  // Si ya hay una promesa de conexión en curso, esperarla
  if (!global.mongoConnection.promise) {
    global.mongoConnection.promise = mongoose.connect(MONGODB_URI);
  }

  try {
    // Esperar a que se resuelva la conexión
    global.mongoConnection.client = await global.mongoConnection.promise;
  } catch (e) {
    // En caso de error, resetear la promesa
    global.mongoConnection.promise = null;
    throw e;
  }

  return global.mongoConnection.client;
}
