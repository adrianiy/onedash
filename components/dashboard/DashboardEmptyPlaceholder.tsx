import React, { useState, useRef } from "react";
import { Icon } from "@/components/common/Icon";
import { useIaDashboardGeneration } from "@/hooks/useIaDashboardGeneration";
import { useUIStore } from "@/store/uiStore";

interface DashboardEmptyPlaceholderProps {
  isEditing: boolean;
}

export const DashboardEmptyPlaceholder: React.FC<
  DashboardEmptyPlaceholderProps
> = ({ isEditing }) => {
  // Estado local para el texto del input
  const [inputValue, setInputValue] = useState<string>("");

  // Referencia al input para poder hacer foco en él
  const inputRef = useRef<HTMLInputElement>(null);

  // Hook para la gestión de estado global del UI
  const { openIaChat, setPreparedMessage } = useUIStore();

  // Hook para la generación de dashboards con IA
  const { showIaInput } = useIaDashboardGeneration();

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

  // Iniciar una conversación rápida para un dashboard ejecutivo
  const handleQuickStart = (type: string) => {
    let prompt = "";

    switch (type) {
      case "simple":
        prompt =
          "Crea un dashboard simple con métricas básicas en formato minimalista";
        break;
      case "advanced":
        prompt =
          "Crea un dashboard avanzado con múltiples visualizaciones y análisis detallado";
        break;
      case "detail":
        prompt =
          "Crea un dashboard de detalle con KPIs y tabla de análisis a ancho completo";
        break;
      default:
        prompt =
          "Crea un dashboard con métricas clave y visualizaciones que aproveche el ancho total de 24 columnas en desktop, 18 en tablet y 8 en móvil";
    }

    // Establecer el mensaje en el input y hacer foco para que el usuario pueda editarlo
    console.log("Preparando mensaje:", prompt);
    setInputValue(prompt);

    // Hacer foco en el input para que el usuario pueda editarlo
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
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
              <input
                type="text"
                className="dashboard-empty-placeholder__ia-input"
                placeholder="Describe el dashboard que necesitas..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                ref={inputRef}
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
                  onClick={() => handleQuickStart("simple")}
                  title="Dashboard con 6 métricas clave organizadas en 2 filas"
                >
                  <Icon name="layout-dashboard" size={16} />
                  <span>Simple</span>
                </button>

                <button
                  className="dashboard-empty-placeholder__quick-button"
                  onClick={() => handleQuickStart("advanced")}
                  title="Dashboard completo con KPIs, gráficos y tabla de análisis"
                >
                  <Icon name="bar-chart" size={16} />
                  <span>Avanzado</span>
                </button>

                <button
                  className="dashboard-empty-placeholder__quick-button"
                  onClick={() => handleQuickStart("detail")}
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
