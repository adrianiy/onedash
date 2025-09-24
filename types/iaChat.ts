import { Dashboard } from "./dashboard";
import { Widget } from "./widget";

/**
 * Tipos para el sistema de IA conversacional con checkpoints integrados
 */

/**
 * Tipo de mensaje en la conversación de IA
 */
export type MessageType = "user" | "assistant" | "system";

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
  checkpoint?: DashboardCheckpointState;
  isCurrentState?: boolean;
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
