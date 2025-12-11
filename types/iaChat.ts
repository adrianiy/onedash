import { Dashboard } from "./dashboard";
import { Widget } from "./widget";

/**
 * Tipos para el sistema de IA conversacional con checkpoints integrados
 */

/**
 * Tipo de mensaje en la conversación de IA
 */
export type MessageType = "human" | "ai" | "system";

/**
 * Estado del sistema de IA para dashboard
 */
export interface DashboardCheckpointState {
  dashboardState: Partial<Dashboard>;
  widgetsState: Record<string, Widget>;
}

/**
 * Mensaje en el chat de IA
 */
export interface ChatMessage {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  error?: string;
  isRetryable?: boolean; // Indica si el error puede ser reintentado (ej: error 500)
  onRetry?: () => void; // Función para reintentar la acción
  checkpoint?: DashboardCheckpointState;
  isCurrentState?: boolean;
  suggestions?: string[];
}

/**
 * Estado de la conversación con IA
 */
export interface IaChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  isModalOpen: boolean;
  error: string | null;
}

/**
 * Sugerencias de la IA para continuar la conversación
 */
export interface IaSuggestion {
  text: string;
  action?: () => void;
}

/**
 * Respuesta de la API de IA para dashboard
 */
export interface IaDashboardResponse {
  dashboard: Partial<Dashboard>;
  widgets: Record<string, Widget>;
  userMessage: string;
  suggestions?: string[];
  needsMoreInfo?: {
    question: string;
    context: string;
  };
}

/**
 * Contexto para reintento automático cuando falla el procesamiento
 */
export interface RetryContext {
  originalMessage: string;
  errorDetails: string;
  failedResponse: string;
  attempt: number;
}
