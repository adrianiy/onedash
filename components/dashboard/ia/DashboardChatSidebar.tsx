import React, { useState, useRef, useEffect } from "react";
import { Icon } from "@/components/common/Icon";
import { ChatMessage } from "./ChatMessage";
import { useIaDashboardGeneration } from "@/hooks/useIaDashboardGeneration";
import { useUIStore } from "@/store/uiStore";

// Hook personalizado para auto-resize del textarea
const useTextareaAutoResize = (value: string, maxRows: number = 3) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to calculate scrollHeight properly
    textarea.style.height = "auto";

    // Calculate required height
    const lineHeight = 24; // Aproximadamente 1.5rem
    const minHeight = lineHeight;
    const maxHeight = lineHeight * maxRows;
    const scrollHeight = textarea.scrollHeight;

    // Set appropriate height
    if (scrollHeight <= maxHeight) {
      textarea.style.height = `${Math.max(scrollHeight, minHeight)}px`;
      textarea.style.overflowY = "hidden";
    } else {
      textarea.style.height = `${maxHeight}px`;
      textarea.style.overflowY = "auto";
    }
  }, [value, maxRows]);

  return textareaRef;
};

interface DashboardChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DashboardChatSidebar: React.FC<DashboardChatSidebarProps> = ({
  isOpen,
  onClose,
}) => {
  // Input para nuevo mensaje
  const [newMessage, setNewMessage] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Usamos el hook de auto-resize para el textarea
  const inputRef = useTextareaAutoResize(newMessage);

  // Hook de IA
  const {
    messages,
    isLoading,
    sendMessage,
    resetConversation,
    restoreFromCheckpoint,
    truncateHistoryFromMessage,
  } = useIaDashboardGeneration();

  // Store de UI para el mensaje preparado
  const { preparedMessage, clearPreparedMessage } = useUIStore();

  // Cuando se recibe un nuevo mensaje, hacer scroll al final
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Recuperar el foco en el input cuando termina la carga (la IA ha respondido)
  useEffect(() => {
    // Cuando isLoading cambia de true a false, significa que la IA ha respondido
    if (!isLoading && inputRef.current) {
      // Pequeño timeout para asegurar que todos los cambios de DOM se han completado
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isLoading]);

  // Al abrir el sidebar, hacer foco en el input y establecer mensaje preparado
  useEffect(() => {
    if (isOpen && inputRef.current) {
      console.log("Mensaje preparado:", preparedMessage);
      // Si hay un mensaje preparado, establecerlo en el input
      if (preparedMessage) {
        setNewMessage(preparedMessage);
        // Enviarlo automáticamente después de un breve delay
        setTimeout(() => {
          if (preparedMessage.trim() && !isLoading) {
            sendMessage(preparedMessage);
            setNewMessage(""); // Borrar el input
            clearPreparedMessage();

            // Asegurar que el input mantiene el foco después de enviar
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }
        }, 100);
      }
      inputRef.current.focus();
    }
  }, [isOpen, preparedMessage]);

  /**
   * Envía un mensaje al pulsar Enter (sin shift)
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Envía el mensaje actual
   */
  const handleSendMessage = () => {
    if (newMessage.trim() && !isLoading) {
      sendMessage(newMessage);
      setNewMessage("");

      // Si había un mensaje preparado, lo limpiamos después de enviarlo
      if (preparedMessage) {
        clearPreparedMessage();
      }
    }
  };

  /**
   * Restaura el dashboard a un checkpoint específico
   */
  const handleRestoreCheckpoint = (messageId: string) => {
    restoreFromCheckpoint(messageId);
  };

  /**
   * Elimina los mensajes posteriores al mensaje con el ID especificado
   */
  const handleTruncateHistory = (messageId: string) => {
    truncateHistoryFromMessage(messageId);
  };

  /**
   * Limpia la conversación
   */
  const handleClearChat = () => {
    resetConversation();
    setNewMessage("");
  };

  // Si el sidebar no está abierto, no renderizar nada
  if (!isOpen) return null;

  return (
    <div
      className={`dashboard-chat-sidebar ${
        isOpen ? "dashboard-chat-sidebar--open" : ""
      }`}
    >
      <div className="dashboard-chat-sidebar__container">
        {/* Cabecera */}
        <div className="dashboard-chat-sidebar__header">
          <h3 className="dashboard-chat-sidebar__title">
            <Icon name="zap" size={20} />
            OneDashboard AI
          </h3>

          <div className="dashboard-chat-sidebar__actions">
            {messages.length > 0 && (
              <button
                className="dashboard-chat-sidebar__action-button"
                onClick={handleClearChat}
                title="Limpiar conversación"
              >
                <Icon name="trash" size={16} />
              </button>
            )}

            <button
              className="dashboard-chat-sidebar__action-button"
              onClick={onClose}
              title="Cerrar"
            >
              <Icon name="x" size={18} />
            </button>
          </div>
        </div>

        {/* Cuerpo con mensajes */}
        <div className="dashboard-chat-sidebar__body">
          {messages.length === 0 ? (
            <div className="dashboard-chat-sidebar__empty">
              <div className="dashboard-chat-sidebar__empty-icon">
                <Icon name="layout-dashboard" size={32} />
              </div>
              <h4>Asistente de generación de dashboards</h4>
              <p>
                Describe el dashboard que necesitas y lo generaré para ti. Puedo
                añadir métricas, gráficos, tablas y más.
              </p>
              <div className="dashboard-chat-sidebar__suggestions">
                <button
                  className="dashboard-chat-sidebar__suggestion"
                  onClick={() =>
                    setNewMessage(
                      "Crea un dashboard simple con métricas básicas en formato minimalista"
                    )
                  }
                >
                  <Icon name="layout-dashboard" size={16} />
                  <span>Dashboard Simple</span>
                </button>
                <button
                  className="dashboard-chat-sidebar__suggestion"
                  onClick={() =>
                    setNewMessage(
                      "Crea un dashboard avanzado con múltiples visualizaciones y análisis detallado"
                    )
                  }
                >
                  <Icon name="bar-chart" size={16} />
                  <span>Dashboard Avanzado</span>
                </button>
                <button
                  className="dashboard-chat-sidebar__suggestion"
                  onClick={() =>
                    setNewMessage(
                      "Crea un dashboard de detalle con KPIs y tabla de análisis a ancho completo"
                    )
                  }
                >
                  <Icon name="table" size={16} />
                  <span>Dashboard de Detalle</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="dashboard-chat-sidebar__messages">
              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onRestore={handleRestoreCheckpoint}
                  onTruncateHistory={handleTruncateHistory}
                  isLastMessage={index === messages.length - 1}
                  onSuggestionClick={(suggestion) => {
                    if (suggestion.trim() && !isLoading) {
                      sendMessage(suggestion);
                    }
                  }}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Pie con input */}
        <div className="dashboard-chat-sidebar__footer">
          <div className="dashboard-chat-sidebar__input-container">
            <textarea
              ref={inputRef}
              className="dashboard-chat-sidebar__input"
              value={newMessage || preparedMessage || ""}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Con que quieres que te ayude?"
              rows={1}
              disabled={isLoading}
            />

            <button
              className="dashboard-chat-sidebar__send-button"
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isLoading}
              title="Enviar mensaje"
            >
              {isLoading ? (
                <Icon name="loader" size={16} className="icon-spin" />
              ) : (
                <Icon name="corner-down-right" size={16} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
