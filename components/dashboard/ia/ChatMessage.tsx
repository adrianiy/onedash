import React from "react";
import { ChatMessage as ChatMessageType } from "@/types/iaChat";
import { Icon } from "@/components/common/Icon";
import { MessageSquare } from "lucide-react";
import { formatTimeAgo } from "@/utils/format";

interface ChatMessageProps {
  message: ChatMessageType;
  onRestore?: (messageId: string) => void;
  onTruncateHistory?: (messageId: string) => void;
  isLastMessage?: boolean;
  onSuggestionClick?: (suggestion: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onRestore,
  onTruncateHistory,
  isLastMessage = false,
  onSuggestionClick,
}) => {
  const isUser = message.type === "human";
  const isSystem = message.type === "system";
  const hasCheckpoint = !!message.checkpoint;
  const isCurrentState = !!message.isCurrentState;
  const canTruncate = isCurrentState && !isLastMessage && !isUser;

  // Formatear la fecha del mensaje
  const timeAgo = formatTimeAgo(message.timestamp);

  /**
   * Maneja el click en el botón de restauración
   */
  const handleRestoreClick = () => {
    if (onRestore && message.id) {
      onRestore(message.id);
    }
  };

  /**
   * Maneja el click en el botón de truncar historial
   */
  const handleTruncateClick = () => {
    if (onTruncateHistory && message.id) {
      if (
        window.confirm(
          "¿Estás seguro de que deseas borrar el historial posterior? Esta acción no se puede deshacer."
        )
      ) {
        onTruncateHistory(message.id);
      }
    }
  };

  return (
    <div className="chat-message-container">
      <div
        className={`chat-message chat-message--${message.type} ${
          message.isLoading ? "chat-message--loading" : ""
        }`}
      >
        {/* Avatar y tipo de mensaje */}
        <div className="chat-message__avatar">
          {isUser ? (
            <div className="chat-message__user-avatar">
              <Icon name="user" size={16} />
            </div>
          ) : isSystem ? (
            <div className="chat-message__system-avatar">
              <Icon name="info" size={16} />
            </div>
          ) : (
            <div className="chat-message__ai-avatar">
              <Icon name="zap" size={16} />
            </div>
          )}
        </div>

        {/* Contenido del mensaje */}
        <div className="chat-message__content">
          <div className="chat-message__header">
            <span className="chat-message__sender">
              {isUser ? "Tú" : isSystem ? "Sistema" : "Asistente"}
            </span>
            <span className="chat-message__time">{timeAgo}</span>
          </div>

          {message.isLoading ? (
            <div className="chat-message__loading-indicator">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          ) : (
            <div className="chat-message__text">
              {message.content}

              {/* Mostrar error si existe */}
              {message.error && (
                <div className="chat-message__error">
                  <Icon name="alert-circle" size={16} />
                  <span>{message.error}</span>

                  {/* Botón de reintento si el error es recuperable */}
                  {message.isRetryable && message.onRetry && (
                    <button
                      className="chat-message__retry-button"
                      onClick={() => message.onRetry && message.onRetry()}
                      aria-label="Reintentar"
                    >
                      <Icon name="rotate-cw" size={16} />
                      <span>Reintentar</span>
                    </button>
                  )}
                </div>
              )}

              {/* Botón de restauración para mensajes con checkpoint */}
              {!isUser && hasCheckpoint && (
                <div className="chat-message__actions">
                  <button
                    className={`restore-button ${
                      isCurrentState ? "restore-button--current" : ""
                    }`}
                    onClick={handleRestoreClick}
                    disabled={isCurrentState}
                    aria-label={
                      isCurrentState
                        ? "Estado actual"
                        : "Restaurar a este estado"
                    }
                  >
                    {isCurrentState ? (
                      <>
                        <Icon name="check" size={16} />
                        <span>Estado actual</span>
                      </>
                    ) : (
                      <>
                        <Icon name="rotate-cw" size={16} />
                        <span>Restaurar este estado</span>
                      </>
                    )}
                  </button>

                  {/* Botón para truncar historial posterior */}
                  {canTruncate && (
                    <button
                      className="truncate-button"
                      onClick={handleTruncateClick}
                      aria-label="Borrar historial posterior"
                    >
                      <Icon name="trash" size={16} />
                      <span>Borrar historial posterior</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sugerencias generadas por la IA (fuera del contenedor del mensaje) */}
      {!isUser &&
        !message.isLoading &&
        message.suggestions &&
        message.suggestions.length > 0 &&
        isLastMessage && (
          <div className="chat-message__suggestions-container">
            <div className="chat-message__suggestions-list">
              {message.suggestions.map((suggestion, index) => (
                <button
                  key={`suggestion-${index}`}
                  className="chat-message__suggestion-button"
                  onClick={() =>
                    onSuggestionClick && onSuggestionClick(suggestion)
                  }
                >
                  <MessageSquare size={16} strokeWidth={1.1} />
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          </div>
        )}
    </div>
  );
};
