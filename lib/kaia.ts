import { ConfidentialClientApplication } from "@azure/msal-node";
import axios from "axios";

const KAIA_URL = process.env.KAIA_URL || "";
const KAIA_SCOPE = process.env.KAIA_SCOPE || "";
const KAIA_ID = process.env.KAIA_ID || "";
const KAIA_SECRET = process.env.KAIA_SECRET || "";
const KAIA_TENANT = process.env.KAIA_TENANT || "";

if (!KAIA_URL) {
  throw new Error("KAIA_URL is required");
}
if (!KAIA_SECRET) {
  throw new Error("KAIA_SECRET is required");
}
if (!KAIA_ID) {
  throw new Error("KAIA_ID is required");
}
if (!KAIA_SCOPE) {
  throw new Error("KAIA_SCOPE is required");
}
if (!KAIA_TENANT) {
  throw new Error("KAIA_TENANT is required");
}

const msalConfig = {
  auth: {
    clientId: KAIA_ID,
    authority: "https://login.microsoftonline.com/" + KAIA_TENANT,
    clientSecret: KAIA_SECRET,
  },
};

// Sistema de caché para el token
interface TokenCacheEntry {
  accessToken: string;
  expiresAt: number;
}

let tokenCache: TokenCacheEntry | null = null;

// Crear una instancia del cliente confidencial MSAL
const msalClient = new ConfidentialClientApplication(msalConfig);

/**
 * Obtiene un token de acceso, ya sea de la caché o solicitando uno nuevo
 * @returns Token de acceso para la API de KAIA
 */
async function getAccessToken(): Promise<string> {
  try {
    // Si tenemos un token en caché y no ha expirado (con 5 minutos de margen), lo devolvemos
    if (tokenCache && tokenCache.expiresAt > Date.now() + 5 * 60 * 1000) {
      return tokenCache.accessToken;
    }

    // Si no hay token en caché o está por expirar, solicitamos uno nuevo
    const tokenResponse = await msalClient.acquireTokenByClientCredential({
      scopes: [KAIA_SCOPE],
    });

    if (!tokenResponse || !tokenResponse.accessToken) {
      throw new Error("No se recibió token de acceso válido");
    }

    // Calculamos el tiempo de expiración
    // Si expiresOn está presente, lo usamos. De lo contrario, asumimos 1 hora
    const expiresAt = tokenResponse.expiresOn
      ? new Date(tokenResponse.expiresOn).getTime()
      : Date.now() + 3600 * 1000;

    // Guardamos el token en la caché
    tokenCache = {
      accessToken: tokenResponse.accessToken,
      expiresAt: expiresAt,
    };

    return tokenResponse.accessToken;
  } catch (error) {
    console.error("Error al obtener el token de acceso:", error);

    // Limpiar la caché si hay un error
    tokenCache = null;

    throw new Error(
      `No se pudo obtener el token de acceso para KAIA: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Fuerza la renovación del token aunque no haya expirado
 * @returns Nuevo token de acceso
 */
async function forceTokenRenewal(): Promise<string> {
  // Limpiar la caché para forzar una renovación
  tokenCache = null;
  return getAccessToken();
}

// Tipos para las peticiones
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  timeout?: number;
}

/**
 * Interfaz para datos de petición a KAIA API
 */
interface KaiaRequestData {
  [key: string]: unknown;
}

// Middleware para realizar peticiones a la API de KAIA
async function kaiaRequest<T = unknown>(
  endpoint: string,
  method: HttpMethod = "GET",
  data?: KaiaRequestData,
  options: RequestOptions = {}
): Promise<T> {
  try {
    // Obtener token de acceso
    const accessToken = await getAccessToken();

    if (!accessToken) {
      throw new Error("No se pudo obtener el token de acceso");
    }

    // Configurar la petición
    const url = `${KAIA_URL}${endpoint}`;
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Realizar la petición
    const response = await axios({
      method,
      url,
      headers,
      data,
      params: options.params,
      timeout: options.timeout,
    });

    return response.data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error en la petición a KAIA (${endpoint}):`, errorMessage);

    // Manejar errores de autenticación - renovar token y reintentar una vez
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      try {
        // Forzar renovación del token
        await forceTokenRenewal();

        // Reintentar la petición con el nuevo token
        const accessToken = await getAccessToken();
        const retryResponse = await axios({
          method,
          url: `${KAIA_URL}${endpoint}`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            ...options.headers,
          },
          data,
          params: options.params,
          timeout: options.timeout,
        });

        return retryResponse.data;
      } catch (retryError) {
        console.error(
          "Error al reintentar la petición tras renovar token:",
          retryError
        );
      }
    }

    // Manejar errores de respuesta
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        `Error ${error.response.status}: ${JSON.stringify(error.response.data)}`
      );
    }

    throw error;
  }
}

export { kaiaRequest, getAccessToken, forceTokenRenewal };
