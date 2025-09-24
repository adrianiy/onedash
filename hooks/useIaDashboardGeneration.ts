import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useGridStore } from "@/store/gridStore";
import { useUIStore } from "@/store/uiStore";
import { ChatMessage, DashboardCheckpointState } from "@/types/iaChat";
import { apiService, ApiResponse } from "@/services/apiService";
import { Dashboard } from "@/types/dashboard";
import { Widget } from "@/types/widget";
import { deepClone } from "@/utils/helpers";
import { useEffect } from "react";
import { applyPatch } from "fast-json-patch";

// Interfaz para la estructura de respuesta del endpoint de IA dashboard
interface IaDashboardResponse {
  dashboard: Dashboard;
  widgets: Record<string, Widget>; // Añadido campo widgets
  userMessage: string;
  suggestions?: string[];
  needsMoreInfo?: {
    question: string;
    context: string;
  };
  type?: "full_dashboard" | "diff_operations";
  operations?: any[];
}

/**
 * Hook para gestionar la generación de dashboards con IA y sistema de checkpoints
 */
export const useIaDashboardGeneration = () => {
  // Estados
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Store de Grid y UI
  const {
    dashboard,
    widgets,
    setDashboard,
    setWidgets,
    updateDashboardLayouts,
  } = useGridStore();
  const { isEditing } = useUIStore();

  /**
   * Iniciar una conversación con la IA
   */
  const startConversation = useCallback(
    async (prompt: string) => {
      if (!prompt.trim()) return;

      setIsLoading(true);
      setError(null);

      // Crear mensaje de usuario
      const userMessage: ChatMessage = {
        id: uuidv4(),
        type: "user",
        content: prompt,
        timestamp: new Date(),
      };

      // Crear mensaje de asistente con estado de carga
      const assistantMessageId = uuidv4();
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        type: "assistant",
        content: "",
        timestamp: new Date(),
        isLoading: true,
      };

      setMessages([userMessage, assistantMessage]);

      try {
        // Llamar a la API de IA
        const response = await apiService.post<IaDashboardResponse>(
          "/ia/dashboard",
          {
            prompt,
            context: null, // Se puede añadir contexto si es necesario
          }
        );

        console.log("Respuesta API IA dashboard:", response);

        if (response?.data?.needsMoreInfo) {
          // Si la IA necesita más información
          const updatedAssistantMessage: ChatMessage = {
            ...assistantMessage,
            isLoading: false,
            content:
              response.data.needsMoreInfo.question ||
              "Necesito más información",
            error: "Necesito más información para generar el dashboard",
          };

          setMessages([userMessage, updatedAssistantMessage]);
          setIsLoading(false);
          return;
        }

        // Verificar si es una operación diff o un dashboard completo
        if (
          response?.data?.type === "diff_operations" &&
          Array.isArray(response?.data?.operations)
        ) {
          console.log("Recibida operación diff:", response.data.operations);

          // Solo podemos aplicar diffs si ya tenemos un dashboard
          if (!dashboard) {
            throw new Error(
              "No se puede aplicar diff sin un dashboard existente"
            );
          }

          // Crear estado actual para aplicar diffs
          const currentState = {
            dashboard: deepClone(dashboard),
            widgets: deepClone(widgets || {}),
          };

          // Aplicar las operaciones JSON Patch
          const result = applyPatch(currentState, response.data.operations);
          const newState = result.newDocument;

          console.log("Estado después de aplicar diffs:", newState);

          // Guardar el estado resultante como checkpoint
          const checkpoint: DashboardCheckpointState = {
            dashboardState: newState.dashboard,
            widgetsState: newState.widgets,
          };

          // Actualizar mensaje con el checkpoint
          const updatedAssistantMessage: ChatMessage = {
            ...assistantMessage,
            isLoading: false,
            content:
              response.data.userMessage ||
              "He actualizado el dashboard según tu petición.",
            checkpoint,
            isCurrentState: true,
          };

          setMessages([userMessage, updatedAssistantMessage]);

          // Aplicar cambios al dashboard y widgets
          applyDashboardChanges(checkpoint, newState.widgets);
        }
        // Si la respuesta tiene un dashboard completo
        else if (response?.data?.dashboard) {
          // Procesar los widgets recibidos
          const widgetsData = response?.data?.widgets || {};

          // Guardar el estado actual como checkpoint
          const checkpoint: DashboardCheckpointState = {
            dashboardState: response.data.dashboard,
            widgetsState: processWidgetsFromDashboard(
              response.data.dashboard,
              widgetsData
            ),
          };

          // Actualizar mensaje con el checkpoint
          const updatedAssistantMessage: ChatMessage = {
            ...assistantMessage,
            isLoading: false,
            content:
              response.data.userMessage ||
              "He generado el dashboard según tu petición.",
            checkpoint,
            isCurrentState: true,
          };

          setMessages([userMessage, updatedAssistantMessage]);

          // Aplicar cambios al dashboard y widgets
          applyDashboardChanges(checkpoint, widgetsData);
        } else {
          throw new Error(
            "La respuesta no contiene un dashboard válido ni operaciones diff"
          );
        }
      } catch (err) {
        console.error("Error al generar el dashboard:", err);

        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        const updatedAssistantMessage: ChatMessage = {
          ...assistantMessage,
          isLoading: false,
          content: "No he podido generar el dashboard.",
          error: errorMessage,
        };

        setMessages([userMessage, updatedAssistantMessage]);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [dashboard]
  );

  /**
   * Enviar un mensaje para continuar la conversación
   */
  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || isLoading) return;

      setIsLoading(true);
      setError(null);

      // Crear mensaje de usuario
      const userMessage: ChatMessage = {
        id: uuidv4(),
        type: "user",
        content: message,
        timestamp: new Date(),
      };

      // Crear mensaje de asistente con estado de carga
      const assistantMessageId = uuidv4();
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        type: "assistant",
        content: "",
        timestamp: new Date(),
        isLoading: true,
      };

      // Añadir mensajes manteniendo el historial
      setMessages((prevMessages) => [
        ...prevMessages,
        userMessage,
        assistantMessage,
      ]);

      try {
        // Crear contexto con el estado actual del dashboard
        // Si hay un dashboard existente, enviamos su estructura completa y los widgets
        const context = dashboard
          ? JSON.stringify({
              currentDashboard: {
                ...dashboard,
                isExistingDashboard: true, // Flag para indicar que es una modificación
                // Importante: No usar dashboardWidgets que confunde al modelo
                // En su lugar, enviar la estructura correcta que coincide con el estado real
              },
              // Incluir los widgets como estructura separada, que es como se almacenan realmente
              widgets: dashboard.widgets.reduce((acc, widgetId) => {
                // Solo incluir los widgets que existen en el store
                if (widgets && widgets[widgetId]) {
                  acc[widgetId] = widgets[widgetId];
                }
                return acc;
              }, {} as Record<string, Widget>),
            })
          : null;

        // Llamar a la API de IA
        const response = await apiService.post<IaDashboardResponse>(
          "/ia/dashboard",
          {
            prompt: message,
            context,
          }
        );

        console.log("Respuesta API IA dashboard (actualización):", response);

        if (response?.data?.needsMoreInfo) {
          // Si la IA necesita más información
          const updatedAssistantMessage: ChatMessage = {
            ...assistantMessage,
            isLoading: false,
            content:
              response.data.needsMoreInfo.question ||
              "Necesito más información",
            error: "Necesito más información para actualizar el dashboard",
          };

          setMessages((prevMessages) => [
            ...prevMessages.slice(0, -1),
            updatedAssistantMessage,
          ]);
          setIsLoading(false);
          return;
        }

        // Marcar todos los estados anteriores como no actuales
        setMessages((prevMessages) =>
          prevMessages.map((msg) => ({
            ...msg,
            isCurrentState: false,
          }))
        );

        // Verificar si es una operación diff o un dashboard completo
        if (
          response?.data?.type === "diff_operations" &&
          Array.isArray(response?.data?.operations)
        ) {
          console.log(
            "Recibida operación diff (en continuación):",
            response.data.operations
          );

          // Solo podemos aplicar diffs si ya tenemos un dashboard
          if (!dashboard) {
            throw new Error(
              "No se puede aplicar diff sin un dashboard existente"
            );
          }

          // Crear estado actual para aplicar diffs
          const currentState = {
            dashboard: deepClone(dashboard),
            widgets: deepClone(widgets || {}),
          };

          // Aplicar las operaciones JSON Patch
          const result = applyPatch(currentState, response.data.operations);
          const newState = result.newDocument;

          console.log("Estado después de aplicar diffs:", newState);

          // Guardar el estado resultante como checkpoint
          const checkpoint: DashboardCheckpointState = {
            dashboardState: newState.dashboard,
            widgetsState: newState.widgets,
          };

          // Actualizar mensaje con el checkpoint
          const updatedAssistantMessage: ChatMessage = {
            ...assistantMessage,
            isLoading: false,
            content:
              response.data.userMessage ||
              "He actualizado el dashboard según tu petición.",
            checkpoint,
            isCurrentState: true,
          };

          setMessages((prevMessages) => [
            ...prevMessages.slice(0, -1),
            updatedAssistantMessage,
          ]);

          // Aplicar cambios al dashboard y widgets
          applyDashboardChanges(checkpoint, newState.widgets);
        }
        // Si la respuesta tiene un dashboard completo
        else if (response?.data?.dashboard) {
          // Procesar los widgets recibidos
          const widgetsData = response?.data?.widgets || {};

          // Guardar el nuevo estado como checkpoint
          const checkpoint: DashboardCheckpointState = {
            dashboardState: response.data.dashboard,
            widgetsState: processWidgetsFromDashboard(
              response.data.dashboard,
              widgetsData
            ),
          };

          // Actualizar mensaje con el checkpoint
          const updatedAssistantMessage: ChatMessage = {
            ...assistantMessage,
            isLoading: false,
            content:
              response.data.userMessage ||
              "He actualizado el dashboard según tu petición.",
            checkpoint,
            isCurrentState: true,
          };

          setMessages((prevMessages) => [
            ...prevMessages.slice(0, -1),
            updatedAssistantMessage,
          ]);

          // Aplicar cambios al dashboard y widgets
          applyDashboardChanges(checkpoint, widgetsData);
        } else {
          throw new Error(
            "La respuesta no contiene un dashboard válido ni operaciones diff"
          );
        }
      } catch (err) {
        console.error("Error al actualizar el dashboard:", err);

        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        const updatedAssistantMessage: ChatMessage = {
          ...assistantMessage,
          isLoading: false,
          content: "No he podido actualizar el dashboard.",
          error: errorMessage,
        };

        setMessages((prevMessages) => [
          ...prevMessages.slice(0, -1),
          updatedAssistantMessage,
        ]);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [dashboard, isLoading]
  );

  /**
   * Restaurar un estado de checkpoint específico
   */
  const restoreFromCheckpoint = useCallback(
    (messageId: string) => {
      const messageWithCheckpoint = messages.find(
        (msg) => msg.id === messageId && msg.checkpoint
      );

      if (!messageWithCheckpoint || !messageWithCheckpoint.checkpoint) {
        setError("No se pudo restaurar el estado, checkpoint no encontrado");
        return;
      }

      // Marcar todos los estados como no actuales
      setMessages((prevMessages) =>
        prevMessages.map((msg) => ({
          ...msg,
          isCurrentState: msg.id === messageId,
        }))
      );

      // Aplicar los cambios desde el checkpoint, pasando explícitamente los widgets almacenados
      console.log(
        "Restaurando desde checkpoint:",
        messageWithCheckpoint.checkpoint
      );
      applyDashboardChanges(
        messageWithCheckpoint.checkpoint,
        messageWithCheckpoint.checkpoint.widgetsState
      );
    },
    [messages]
  );

  /**
   * Aplicar cambios de dashboard desde un checkpoint
   */
  /**
   * Procesa los widgets desde la respuesta del endpoint
   *
   * @param dashboardData Dashboard con información sobre widgets
   * @param widgetsData Objeto con los widgets procesados (si está disponible)
   * @returns Objeto con los widgets indexados por ID
   */
  const processWidgetsFromDashboard = (
    dashboardData: Dashboard,
    widgetsData?: Record<string, Widget>
  ): Record<string, Widget> => {
    // Si tenemos los widgets procesados, los devolvemos directamente
    if (widgetsData && Object.keys(widgetsData).length > 0) {
      console.log("Usando widgets procesados:", widgetsData);
      return widgetsData;
    }

    // Si no hay widgets procesados, devolvemos un objeto vacío
    console.log("No hay widgets procesados disponibles");
    return {};
  };

  /**
   * Aplicar cambios de dashboard desde un checkpoint
   * Ahora incluye la creación de widgets en el store
   */
  const applyDashboardChanges = useCallback(
    (
      checkpoint: DashboardCheckpointState,
      widgetsData?: Record<string, Widget>
    ) => {
      const { dashboardState } = checkpoint;

      // Usar deep clone para evitar referencias cruzadas
      const dashboardUpdate = deepClone(dashboardState) as Dashboard;

      // Actualizar el dashboard
      if (dashboard) {
        console.log("Actualizando dashboard existente con:", dashboardUpdate);
        setDashboard({
          ...dashboard,
          ...dashboardUpdate,
          // Asegurarnos de preservar el ID si ya existe
          _id: dashboard._id,
        });
      } else {
        console.log("Creando nuevo dashboard:", dashboardUpdate);
        setDashboard(dashboardUpdate as Dashboard);
      }

      // Determinar qué widgets aplicar: primero usar widgetsData pasado como parámetro,
      // y si no está disponible, usar los widgets del checkpoint
      const widgetsToApply = widgetsData || checkpoint.widgetsState;

      // Crear los widgets en el store
      if (widgetsToApply && Object.keys(widgetsToApply).length > 0) {
        console.log("Actualizando widgets en el store:", widgetsToApply);
        setWidgets(widgetsToApply);
      } else {
        console.warn(
          "No se encontraron widgets para aplicar al restaurar el checkpoint"
        );
      }

      // Actualizar layouts si están disponibles
      if (dashboardUpdate.layouts) {
        console.log("Actualizando layouts:", dashboardUpdate.layouts);
        updateDashboardLayouts(dashboardUpdate.layouts);
      } else {
        console.warn("El checkpoint no contiene información de layouts");
      }
    },
    [dashboard, setDashboard, setWidgets, updateDashboardLayouts]
  );

  /**
   * Cerrar la conversación
   */
  const closeConversation = useCallback(() => {
    // Mantenemos la función por compatibilidad, pero sin funcionalidad de modal
  }, []);

  /**
   * Trunca el historial desde un mensaje específico
   * Elimina todos los mensajes posteriores al mensaje con el ID especificado
   */
  const truncateHistoryFromMessage = useCallback(
    (messageId: string) => {
      const messageIndex = messages.findIndex((msg) => msg.id === messageId);

      if (messageIndex === -1) {
        console.error(`No se encontró mensaje con ID ${messageId}`);
        return;
      }

      // Verificar que el mensaje tiene el estado actual
      const isActiveState = messages[messageIndex].isCurrentState;
      if (!isActiveState) {
        console.error("Solo se puede truncar desde el estado activo");
        return;
      }

      // Conservar solo los mensajes hasta el índice encontrado (inclusive)
      console.log(
        `Truncando historial desde mensaje ${messageId} (índice ${messageIndex})`
      );
      setMessages((prevMessages) => prevMessages.slice(0, messageIndex + 1));
    },
    [messages]
  );

  /**
   * Borrar todos los mensajes y reiniciar la conversación
   */
  const resetConversation = useCallback(() => {
    setMessages([]);
    setError(null);
    setIsLoading(false);
  }, []);

  // Efecto para registrar el estado actual del dashboard y sus widgets
  // esto nos ayuda a depurar problemas
  useEffect(() => {
    if (dashboard && widgets) {
      console.log("[useIaDashboardGeneration] Estado actualizado:");
      console.log("Dashboard:", dashboard);
      console.log("Widgets:", widgets);
    }
  }, [dashboard, widgets]);

  return {
    messages,
    isLoading,
    error,
    startConversation,
    sendMessage,
    restoreFromCheckpoint,
    truncateHistoryFromMessage,
    closeConversation,
    resetConversation,
    showIaInput:
      isEditing && (!dashboard?.widgets || dashboard.widgets.length === 0),
  };
};
