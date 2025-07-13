import React, { useEffect, useState } from "react";
import { useWizardStore } from "@/store/wizardStore";
import { useThemeStore } from "@/store/themeStore";
import { Icon } from "@/common/Icon";
import { Tooltip } from "react-tooltip";
import { useUIStore } from "@/store/uiStore";

export const AppWizard: React.FC = () => {
  const {
    isVisible,
    isMinimized,
    showToggleButton,
    steps,
    setVisible,
    setShowToggleButton,
    toggleMinimized,
    markStepAsCompleted,
  } = useWizardStore();

  // Estado local para manejar qué paso está expandido
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);

  const { isEditing } = useUIStore();
  const { theme } = useThemeStore();

  // Separar el paso "welcome" del resto de pasos
  const welcomeStep = steps.find((step) => step.id === "welcome");
  const tutorialSteps = steps.filter((step) => step.id !== "welcome");

  const toggleStep = (stepId: string) => {
    setExpandedStepId(expandedStepId === stepId ? null : stepId);
  };

  // Manejar la detección automática de pasos completados
  useEffect(() => {
    // Verificar todos los pasos en cada render para actualizaciones automáticas
    steps.forEach((step) => {
      if (!step.isCompleted) {
        switch (step.completionCriteria) {
          case "edit-mode":
            if (isEditing) {
              markStepAsCompleted(step.id);
            }
            break;
          case "theme-changed":
            // Se maneja con eventos
            break;
        }
      }
    });

    // Observer para monitorear cambios en elementos del DOM
    const elementsToHighlight: HTMLElement[] = [];

    steps.forEach((step) => {
      if (step.elementSelector) {
        const targetElement = document.querySelector(
          step.elementSelector
        ) as HTMLElement;
        if (targetElement) {
          // Solo resaltar el elemento si su paso está expandido
          if (expandedStepId === step.id) {
            targetElement.classList.add("wizard-highlight");
            elementsToHighlight.push(targetElement);
          }
        }
      }
    });

    // Limpiar resaltados al desmontar
    return () => {
      elementsToHighlight.forEach((el) => {
        el.classList.remove("wizard-highlight");
      });
    };
  }, [steps, isEditing, theme, markStepAsCompleted, expandedStepId]);

  // Manejar la detección de eventos específicos
  useEffect(() => {
    // Suscribirse a eventos específicos según los pasos
    const handleSidebarToggle = () => {
      const navigationStep = steps.find((s) => s.id === "navigation");
      if (navigationStep && !navigationStep.isCompleted) {
        markStepAsCompleted("navigation");
      }
    };

    const handleSaveClick = () => {
      const savingStep = steps.find((s) => s.id === "saving");
      if (savingStep && !savingStep.isCompleted) {
        markStepAsCompleted("saving");
      }
    };

    const handleWidgetCreation = () => {
      const widgetStep = steps.find((s) => s.id === "widgets");
      if (widgetStep && !widgetStep.isCompleted) {
        markStepAsCompleted("widgets");
      }
    };

    const handleThemeChange = () => {
      const themeStep = steps.find((s) => s.id === "theme");
      if (themeStep && !themeStep.isCompleted) {
        markStepAsCompleted("theme");
      }
    };

    // Añadir listeners de eventos
    document.addEventListener("sidebar-toggle", handleSidebarToggle);
    document.addEventListener("dashboard-save", handleSaveClick);
    document.addEventListener("widget-create", handleWidgetCreation);
    document.addEventListener("theme-changed", handleThemeChange);

    // Limpiar eventos al desmontar
    return () => {
      document.removeEventListener("sidebar-toggle", handleSidebarToggle);
      document.removeEventListener("dashboard-save", handleSaveClick);
      document.removeEventListener("widget-create", handleWidgetCreation);
      document.removeEventListener("theme-changed", handleThemeChange);
    };
  }, [steps, markStepAsCompleted]);

  // Si el wizard está minimizado, mostrar el botón con la insignia
  if (isMinimized) {
    return (
      <div className="app-wizard app-wizard--minimized">
        <button
          className="app-wizard__toggle-btn"
          onClick={toggleMinimized}
          aria-label="Expandir guía de OneDash"
        >
          <Icon name="info" size={20} />
          <span className="app-wizard__toggle-badge">
            {
              steps.filter((step) => step.isCompleted && step.id !== "welcome")
                .length
            }
            /{tutorialSteps.length}
          </span>
        </button>
      </div>
    );
  }

  // Calcular el progreso excluyendo el paso welcome
  const completedSteps = steps.filter(
    (step) => step.isCompleted && step.id !== "welcome"
  ).length;
  const totalSteps = tutorialSteps.length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  // Calcular si todos los pasos (excepto welcome) están completados
  const allStepsCompleted = completedSteps === totalSteps;

  // Función para cerrar completamente el wizard (incluido el botón toggle)
  const handleCloseWizard = () => {
    setVisible(false);
    setShowToggleButton(false);
  };

  return (
    <>
      {/* Botón de toggle, visible solo si showToggleButton es true */}
      {showToggleButton && (
        <button
          className="app-wizard__toggle-btn app-wizard__toggle-btn--fixed"
          onClick={() => setVisible(!isVisible)}
          aria-label={
            isVisible ? "Cerrar guía de OneDash" : "Abrir guía de OneDash"
          }
        >
          <Icon name={isVisible ? "x" : "list-todo"} size={20} />
        </button>
      )}

      {isVisible && (
        <div className="app-wizard app-wizard--accordion">
          {/* Cabecera con la información del paso "welcome" */}
          {welcomeStep && (
            <div className="app-wizard__intro">
              <h3 className="app-wizard__intro-title">{welcomeStep.title}</h3>
              <p className="app-wizard__intro-description">
                {welcomeStep.description}
              </p>
            </div>
          )}

          <div className="app-wizard__subtitle">
            <span>Pasos</span>
            <div className="app-wizard__progress-info">
              <span>
                {completedSteps} de {totalSteps} completados
              </span>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="app-wizard__progress-container">
            <div
              className="app-wizard__progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Contenedor de acordeón con los pasos (excluyendo el welcome) */}
          <div className="app-wizard__steps-container">
            {tutorialSteps.map((step, index) => (
              <div
                key={step.id}
                className={`app-wizard__step ${
                  step.isCompleted ? "app-wizard__step--completed" : ""
                } ${
                  expandedStepId === step.id ? "app-wizard__step--expanded" : ""
                } ${
                  (step.id === "widgets" || step.id === "saving") && !isEditing
                    ? "app-wizard__step--disabled"
                    : ""
                }`}
              >
                <button
                  className="app-wizard__step-header"
                  onClick={() => toggleStep(step.id)}
                  aria-expanded={expandedStepId === step.id}
                >
                  <div className="app-wizard__step-number">
                    {step.isCompleted ? (
                      <Icon name="check" size={14} />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div className="app-wizard__step-title">
                    <div className="app-wizard__step-title-icon">
                      <Icon name={step.icon} size={16} />
                    </div>
                    <span>{step.title}</span>
                  </div>
                  <Icon
                    name={"chevron-down"}
                    size={16}
                    className="app-wizard__step-toggle-icon"
                  />
                </button>

                {/* Panel de contenido expandible */}
                <div className="app-wizard__step-content">
                  <p className="app-wizard__step-description">
                    {step.description}
                    {(step.id === "widgets" || step.id === "saving") &&
                      !isEditing && (
                        <span className="app-wizard__edit-mode-warning">
                          <Icon name="warning" size={14} />
                          Activa el modo edición primero para acceder a esta
                          funcionalidad.
                        </span>
                      )}
                  </p>

                  <div className="app-wizard__step-actions">
                    {!step.isCompleted && (
                      <>
                        {step.elementSelector && (
                          <button
                            className="app-wizard__try-btn app-wizard__element-interactive"
                            onClick={() => {
                              // Solo intentar hacer scroll si el elemento existe
                              const element = document.querySelector(
                                step.elementSelector as string
                              );
                              if (element) {
                                element.scrollIntoView({
                                  behavior: "smooth",
                                  block: "center",
                                });
                                element.classList.add("wizard-highlight");

                                // Mostrar tooltip acción sobre el elemento
                                const elementId = `element-action-tooltip-${step.id}`;
                                const elementTooltip = document.querySelector(
                                  `#${elementId}`
                                );
                                if (!elementTooltip) {
                                  const tooltipDiv =
                                    document.createElement("div");
                                  tooltipDiv.id = elementId;
                                  tooltipDiv.className =
                                    "wizard-tooltip wizard-tooltip-action wizard-tooltip-external";
                                  tooltipDiv.style.position = "absolute";
                                  tooltipDiv.style.zIndex = "10000";
                                  tooltipDiv.innerHTML = "¡Haz clic aquí!";
                                  document.body.appendChild(tooltipDiv);

                                  // Posicionar el tooltip según la posición configurada para el paso
                                  const rect = element.getBoundingClientRect();

                                  if (step.position === "left") {
                                    tooltipDiv.style.top = `${
                                      rect.top +
                                      rect.height / 2 -
                                      tooltipDiv.offsetHeight / 2
                                    }px`;
                                    tooltipDiv.style.left = `${
                                      rect.left - tooltipDiv.offsetWidth - 10
                                    }px`;
                                  } else if (step.position === "top") {
                                    tooltipDiv.style.top = `${
                                      rect.top - tooltipDiv.offsetHeight - 10
                                    }px`;
                                    tooltipDiv.style.left = `${
                                      rect.left +
                                      rect.width / 2 -
                                      tooltipDiv.offsetWidth / 2
                                    }px`;
                                  } else if (step.position === "bottom") {
                                    tooltipDiv.style.top = `${
                                      rect.bottom + 10
                                    }px`;
                                    tooltipDiv.style.left = `${
                                      rect.left +
                                      rect.width / 2 -
                                      tooltipDiv.offsetWidth / 2
                                    }px`;
                                  } else {
                                    // default: right
                                    tooltipDiv.style.top = `${
                                      rect.top +
                                      rect.height / 2 -
                                      tooltipDiv.offsetHeight / 2
                                    }px`;
                                    tooltipDiv.style.left = `${
                                      rect.right + 10
                                    }px`;
                                  }

                                  // Eliminar después de un tiempo
                                  setTimeout(() => {
                                    if (tooltipDiv && tooltipDiv.parentNode) {
                                      tooltipDiv.parentNode.removeChild(
                                        tooltipDiv
                                      );
                                    }
                                    element.classList.remove(
                                      "wizard-highlight"
                                    );
                                  }, 3000);
                                }
                              }
                            }}
                            data-tooltip-id={`view-element-tooltip-${step.id}`}
                            data-tooltip-class="wizard-tooltip"
                            disabled={
                              (step.id === "widgets" || step.id === "saving") &&
                              !isEditing
                            }
                          >
                            <Icon name="arrow-right" size={14} />
                            {(step.id === "widgets" || step.id === "saving") &&
                            !isEditing
                              ? "Requiere modo edición"
                              : "Ver elemento"}
                          </button>
                        )}

                        <button
                          className="app-wizard__complete-btn app-wizard__element-interactive"
                          onClick={() => markStepAsCompleted(step.id)}
                          data-tooltip-id="complete-step-tooltip"
                          data-tooltip-variant="success"
                          data-tooltip-class="wizard-tooltip"
                          disabled={
                            (step.id === "widgets" || step.id === "saving") &&
                            !isEditing
                          }
                        >
                          <Icon name="square" size={18} />
                          {step.isCompleted && (
                            <span className="app-wizard__complete-check">
                              <Icon name="check" size={14} />
                            </span>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          {allStepsCompleted && (
            <div className="app-wizard__footer">
              <div className="app-wizard__completion-message">
                <Icon name="check" size={16} />
                ¡Has completado todos los pasos!
              </div>
              {/* Botón para cerrar completamente la guía */}
              <button
                className="app-wizard__close-btn"
                onClick={handleCloseWizard}
              >
                <Icon name="x" size={16} />
                Cerrar guía
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tooltips para elementos interactivos */}
      <Tooltip
        id="complete-step-tooltip"
        content="Marcar/Desmarcar como completado"
        place="top"
        className="wizard-tooltip"
      />

      {tutorialSteps.map((step) => (
        <Tooltip
          key={`view-element-tooltip-${step.id}`}
          id={`view-element-tooltip-${step.id}`}
          content="¡Haz clic para resaltar el elemento!"
          place="bottom"
          className="wizard-tooltip"
        />
      ))}
    </>
  );
};
