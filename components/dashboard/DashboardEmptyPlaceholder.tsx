import React, { useState, useRef, useEffect } from "react";
import { Icon } from "@/components/common/Icon";
import { useIaDashboardGeneration } from "@/hooks/useIaDashboardGeneration";
import { useTemplateApplication } from "@/hooks/useTemplateApplication";
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

interface DashboardEmptyPlaceholderProps {
  isEditing: boolean;
}

export const DashboardEmptyPlaceholder: React.FC<
  DashboardEmptyPlaceholderProps
> = ({ isEditing }) => {
  // Estado local para el texto del input
  const [inputValue, setInputValue] = useState<string>("");

  // Usamos el hook de auto-resize para el textarea
  const inputRef = useTextareaAutoResize(inputValue);

  // Hook para la gestión de estado global del UI
  const { openIaChat, setPreparedMessage } = useUIStore();

  // Hooks para la generación de dashboards con IA y aplicación de plantillas
  const { showIaInput } = useIaDashboardGeneration();
  const { applyTemplate } = useTemplateApplication();

  // Abrir el sidebar de chat de IA y enviar mensaje si existe
  const handleOpenIaChat = (message?: string) => {
    if (message && message.trim() !== "") {
      setPreparedMessage(message.trim());
    }
    openIaChat();
  };

  // Manejar el envío del mensaje desde el input
  const handleSendMessage = () => {
    if (inputValue.trim() !== "") {
      handleOpenIaChat(inputValue);
      setInputValue("");
    }
  };

  // Manejar la pulsación de Enter en el input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Aplicar una plantilla directamente al dashboard
  const handleApplyTemplate = (type: string) => {
    let templateId = "";

    switch (type) {
      case "simple":
        templateId = "simple-dashboard";
        break;
      case "advanced":
        templateId = "advanced-dashboard";
        break;
      case "detail":
        templateId = "detail-dashboard";
        break;
      default:
        templateId = "simple-dashboard";
    }

    console.log(`Aplicando plantilla directamente: ${templateId}`);

    // Aplicar la plantilla utilizando el hook
    const success = applyTemplate(templateId);

    if (!success) {
      console.error(`Error al aplicar plantilla: ${templateId}`);
    }
  };

  if (isEditing) {
    return (
      <div className="dashboard-empty-placeholder dashboard-empty-placeholder--editing">
        <Icon
          name="layout-grid"
          size={48}
          className="dashboard-empty-placeholder__icon dashboard-empty-placeholder__icon--editing"
        />
        <h3>¡Empieza a crear tu dashboard!</h3>
        <p>
          Arrastra widgets desde la barra de herramientas o haz clic en los
          botones para añadirlos
        </p>

        {showIaInput && (
          <div className="dashboard-empty-placeholder__ia-section">
            <div className="dashboard-empty-placeholder__ia-input-container">
              <textarea
                className="dashboard-empty-placeholder__ia-input"
                placeholder="Describe el dashboard que necesitas..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                ref={inputRef}
                rows={1}
              />
              <button
                className="dashboard-empty-placeholder__ia-send-button"
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                title="Generar dashboard"
              >
                <Icon name="corner-down-right" size={16} />
              </button>
            </div>

            <div className="dashboard-empty-placeholder__quick-actions">
              <p>O usa una plantilla rápida:</p>
              <div className="dashboard-empty-placeholder__quick-buttons">
                <button
                  className="dashboard-empty-placeholder__quick-button"
                  onClick={() => handleApplyTemplate("simple")}
                  title="Dashboard con 6 métricas clave organizadas en 2 filas"
                >
                  <Icon name="layout-dashboard" size={16} />
                  <span>Simple</span>
                </button>

                <button
                  className="dashboard-empty-placeholder__quick-button"
                  onClick={() => handleApplyTemplate("advanced")}
                  title="Dashboard completo con KPIs, gráficos y tabla de análisis"
                >
                  <Icon name="bar-chart" size={16} />
                  <span>Avanzado</span>
                </button>

                <button
                  className="dashboard-empty-placeholder__quick-button"
                  onClick={() => handleApplyTemplate("detail")}
                  title="Dashboard con KPIs y tabla detallada a ancho completo"
                >
                  <Icon name="table" size={16} />
                  <span>Detalle</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* El chat IA ahora está implementado como un sidebar global */}
      </div>
    );
  }

  return (
    <div className="dashboard-empty-placeholder">
      <Icon
        name="layout-dashboard"
        size={48}
        className="dashboard-empty-placeholder__icon dashboard-empty-placeholder__icon--viewing"
      />
      <h3>Dashboard vacío</h3>
      <p>Este dashboard no tiene widgets configurados</p>
    </div>
  );
};
