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

// Definición de guías disponibles
export type GuideType = "welcome" | "share-dashboard";

interface WizardState {
  isVisible: boolean;
  isMinimized: boolean;
  showToggleButton: boolean;
  activeGuide: GuideType;
  steps: WizardStep[];
  currentStepIndex: number;

  // Acciones
  setVisible: (visible: boolean) => void;
  toggleVisibility: () => void;
  setMinimized: (minimized: boolean) => void;
  toggleMinimized: () => void;
  setShowToggleButton: (show: boolean) => void;
  markStepAsCompleted: (stepId: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  resetWizard: () => void;
  setActiveGuide: (guideType: GuideType) => void;
}

// Pasos predefinidos para el wizard de bienvenida
// Pasos para las distintas guías
const welcomeGuideSteps: WizardStep[] = [
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

// Pasos para la guía de compartir dashboards
const shareDashboardGuideSteps: WizardStep[] = [
  {
    id: "share-intro",
    title: "Comparte tus dashboards",
    description:
      "Aprende a compartir tus dashboards con otros usuarios y colaboradores. Esta guía te explicará paso a paso cómo crear, configurar y compartir un dashboard.",
    icon: "link",
    isCompleted: false,
    completionCriteria: "manual",
  },
  {
    id: "create-private",
    title: "Crear dashboard privado",
    description:
      "Para comenzar, necesitas crear un dashboard privado:\n\n* Menú **Dashboards** > **Crear Nuevo Dashboard**\n* Completa **nombre** y **descripción**\n* Asegúrate que **'Privado'** esté seleccionado\n* Haz clic en el botón **'Crear'**",
    icon: "plus",
    isCompleted: false,
    completionCriteria: "dashboard-private-created",
  },
  {
    id: "edit-dashboard",
    title: "Acceder a opciones de edición",
    description:
      "Con el dashboard ya creado:\n\n* Menú **Dashboards** > Pasa el cursor sobre el dashboard deseado\n* Haz clic en el **botón de edición** (icono de lápiz ✏️) que aparece\n* Se abrirá el **modal de edición** del dashboard",
    icon: "edit",
    isCompleted: false,
    completionCriteria: "dashboard-edit-opened",
  },
  {
    id: "activate-share",
    title: "Activar compartir",
    description:
      "En el modal de edición:\n\n* Busca la sección **'Visibilidad'**\n* Activa el toggle **'Compartir con enlace'**\n* Verás que aparecen opciones adicionales para gestionar colaboradores",
    icon: "check",
    isCompleted: false,
    completionCriteria: "dashboard-share-toggled",
  },
  {
    id: "add-collaborators",
    title: "Añadir colaboradores",
    description:
      "Para permitir que otros usuarios editen tu dashboard:\n\n* En la sección **'Añade usuarios que pueden editar este dashboard'**\n* Haz clic en el **campo de búsqueda**\n* Busca usuarios por **nombre** o **email**\n* Selecciona los usuarios que quieres añadir de la lista",
    icon: "user-plus",
    isCompleted: false,
    completionCriteria: "dashboard-collaborator-added",
  },
  {
    id: "copy-link",
    title: "Compartir enlace",
    description:
      "Para finalizar y compartir:\n\n* Haz clic en **'Copiar enlace'** (botón en la parte inferior)\n* El enlace se copiará automáticamente al portapapeles\n* Haz clic en **'Guardar'** para confirmar todos los cambios\n* Comparte el enlace con quien desees. **Recuerda**: solo los colaboradores añadidos podrán **editar** el dashboard",
    icon: "copy",
    isCompleted: false,
    completionCriteria: "dashboard-link-copied",
  },
];

// Guía inicial por defecto
const initialGuide: GuideType = "welcome";
const initialSteps = welcomeGuideSteps;

// Mapa de guías disponibles
const guidesMap = {
  welcome: welcomeGuideSteps,
  "share-dashboard": shareDashboardGuideSteps,
};

export const useWizardStore = create<WizardState>()(
  devtools(
    persist(
      (set) => ({
        isVisible: true, // Inicialmente visible para nuevos usuarios
        isMinimized: false,
        showToggleButton: true, // Inicialmente visible
        activeGuide: initialGuide,
        steps: initialSteps,
        currentStepIndex: 0,

        setVisible: (visible) => set({ isVisible: visible }),

        toggleVisibility: () =>
          set((state) => ({ isVisible: !state.isVisible })),

        setMinimized: (minimized) => set({ isMinimized: minimized }),

        toggleMinimized: () =>
          set((state) => ({ isMinimized: !state.isMinimized })),

        setShowToggleButton: (show) => set({ showToggleButton: show }),

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
            steps: guidesMap[initialGuide].map((step) => ({
              ...step,
              isCompleted: false,
            })),
          }),

        setActiveGuide: (guideType) =>
          set({
            activeGuide: guideType,
            currentStepIndex: 0,
            steps: guidesMap[guideType].map((step) => ({
              ...step,
              isCompleted: false,
            })),
          }),
      }),
      {
        name: "wizard-storage", // nombre para persistencia local
        version: 1,
      }
    ),
    {
      name: "wizard-store", // nombre para devtools
    }
  )
);
