import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { type IconName } from "@/common/Icon";

// Definición de los pasos del wizard
export interface WizardStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  icon: IconName; // Nombre del icono de Lucide
  completionCriteria: string; // Criterio para marcar como completado
  elementSelector?: string; // Selector CSS para resaltar un elemento específico
  position?: "top" | "right" | "bottom" | "left"; // Posición del indicador
}

interface WizardState {
  isVisible: boolean;
  isMinimized: boolean;
  steps: WizardStep[];
  currentStepIndex: number;

  // Acciones
  setVisible: (visible: boolean) => void;
  toggleVisibility: () => void;
  setMinimized: (minimized: boolean) => void;
  toggleMinimized: () => void;
  markStepAsCompleted: (stepId: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  resetWizard: () => void;
}

// Pasos predefinidos para el wizard
const initialSteps: WizardStep[] = [
  {
    id: "welcome",
    title: "Bienvenido a OneDash",
    description:
      "Esta guía te ayudará a conocer las principales funcionalidades de OneDash.",
    icon: "info",
    isCompleted: false,
    completionCriteria: "manual",
  },
  {
    id: "navigation",
    title: "Navegación",
    description:
      "Utiliza la barra lateral para navegar entre tus dashboards. Haz clic en el botón de dashboards para abrir el panel.",
    icon: "layout-dashboard",
    isCompleted: false,
    completionCriteria: "sidebar-open",
    elementSelector: ".floating-action-bar__button:nth-child(3)",
    position: "right",
  },
  {
    id: "edit-mode",
    title: "Modo Edición",
    description:
      "Activa el modo edición para personalizar tu dashboard y añadir widgets.",
    icon: "edit",
    isCompleted: false,
    completionCriteria: "edit-mode",
    elementSelector: ".floating-action-bar__button:first-child",
    position: "right",
  },
  {
    id: "widgets",
    title: "Widgets",
    description:
      "Añade widgets para visualizar tus datos de diferentes formas.",
    icon: "pie-chart",
    isCompleted: false,
    completionCriteria: "widget-created",
    elementSelector: ".toolbar-widget-actions",
    position: "bottom",
  },
  {
    id: "saving",
    title: "Guardar Cambios",
    description: "No olvides guardar los cambios realizados en tu dashboard.",
    icon: "save",
    isCompleted: false,
    completionCriteria: "dashboard-saved",
    elementSelector: ".save-button",
    position: "bottom",
  },
  {
    id: "theme",
    title: "Personalización",
    description:
      "Personaliza el aspecto de OneDash seleccionando un tema que se adapte a tus preferencias.",
    icon: "palette",
    isCompleted: false,
    completionCriteria: "theme-changed",
    elementSelector: ".theme-selector",
    position: "left",
  },
];

export const useWizardStore = create<WizardState>()(
  devtools(
    persist(
      (set) => ({
        isVisible: true, // Inicialmente visible para nuevos usuarios
        isMinimized: false,
        steps: initialSteps,
        currentStepIndex: 0,

        setVisible: (visible) => set({ isVisible: visible }),

        toggleVisibility: () =>
          set((state) => ({ isVisible: !state.isVisible })),

        setMinimized: (minimized) => set({ isMinimized: minimized }),

        toggleMinimized: () =>
          set((state) => ({ isMinimized: !state.isMinimized })),

        markStepAsCompleted: (stepId) =>
          set((state) => ({
            steps: state.steps.map((step) =>
              step.id === stepId
                ? { ...step, isCompleted: step.isCompleted ? false : true }
                : step
            ),
          })),

        nextStep: () =>
          set((state) => {
            const newIndex = Math.min(
              state.currentStepIndex + 1,
              state.steps.length - 1
            );
            return { currentStepIndex: newIndex };
          }),

        prevStep: () =>
          set((state) => {
            const newIndex = Math.max(state.currentStepIndex - 1, 0);
            return { currentStepIndex: newIndex };
          }),

        goToStep: (index) =>
          set((state) => {
            if (index >= 0 && index < state.steps.length) {
              return { currentStepIndex: index };
            }
            return {};
          }),

        resetWizard: () =>
          set({
            currentStepIndex: 0,
            steps: initialSteps.map((step) => ({
              ...step,
              isCompleted: false,
            })),
          }),
      }),
      {
        name: "wizard-storage", // nombre para persistencia local
      }
    ),
    {
      name: "wizard-store", // nombre para devtools
    }
  )
);
