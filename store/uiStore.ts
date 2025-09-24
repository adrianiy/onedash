import { Breakpoint, DashboardSettings } from "@/types/dashboard";
import { ChatMessage } from "@/types/iaChat";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface UIState {
  // Estado de la UI general
  settings: DashboardSettings;
  isEditing: boolean;
  isConfigSidebarOpen: boolean;
  selectedWidgetId: string | null;
  droppingItemSize: { w: number; h: number };
  lockChanges: boolean;
  currentBreakpoint: Breakpoint; // Añadido: breakpoint actual

  // Estado de IA
  iaChatOpen: boolean;
  iaMessages: ChatMessage[];
  iaCurrentCheckpointId: string | null;
  iaIsLoading: boolean;
  preparedMessage: string; // Añadido: mensaje preparado para el chat

  // Acciones de UI
  toggleEditing: () => void;
  startEditing: () => void;
  stopEditing: () => void;
  selectWidget: (widgetId: string | null) => void;
  clearSelection: () => void; // Alias para selectWidget(null)
  toggleConfigSidebar: () => void;
  openConfigSidebar: () => void;
  closeConfigSidebar: () => void;
  setDroppingItemSize: (size: { w: number; h: number }) => void;
  resetDroppingItemSize: () => void;
  setLockChanges: (value: boolean) => void;
  setCurrentBreakpoint: (breakpoint: Breakpoint) => void; // Añadido: acción para cambiar breakpoint

  // Acciones de IA
  toggleIaChat: () => void;
  openIaChat: () => void;
  closeIaChat: () => void;
  addIaMessage: (message: ChatMessage) => void;
  setIaMessages: (messages: ChatMessage[]) => void;
  updateIaMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  clearIaMessages: () => void;
  setIaIsLoading: (isLoading: boolean) => void;
  setIaCurrentCheckpoint: (checkpointId: string | null) => void;
  setPreparedMessage: (message: string) => void; // Añadido: establecer mensaje preparado
  clearPreparedMessage: () => void; // Añadido: limpiar mensaje preparado
}

const defaultSettings: DashboardSettings = {
  theme: "light",
  gridCols: 12,
  gridRowHeight: 60,
  gridMargin: [10, 10],
  isEditable: false,
};

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      // Estado inicial
      settings: defaultSettings,
      isEditing: false,
      isConfigSidebarOpen: false,
      selectedWidgetId: null,
      droppingItemSize: { w: 6, h: 6 },
      lockChanges: false,
      currentBreakpoint: "lg", // Añadido: valor por defecto (desktop)

      // Estado inicial de IA
      iaChatOpen: false,
      iaMessages: [],
      iaCurrentCheckpointId: null,
      iaIsLoading: false,
      preparedMessage: "", // Añadido: inicializado vacío

      // Acciones de UI
      toggleEditing: () => set((state) => ({ isEditing: !state.isEditing })),

      startEditing: () => set({ isEditing: true }),

      stopEditing: () => set({ isEditing: false }),

      selectWidget: (widgetId) => set({ selectedWidgetId: widgetId }),

      clearSelection: () => set({ selectedWidgetId: null }),

      toggleConfigSidebar: () =>
        set((state) => ({ isConfigSidebarOpen: !state.isConfigSidebarOpen })),

      openConfigSidebar: () => set({ isConfigSidebarOpen: true }),

      closeConfigSidebar: () => set({ isConfigSidebarOpen: false }),

      setDroppingItemSize: (size) => set({ droppingItemSize: size }),

      resetDroppingItemSize: () => set({ droppingItemSize: { w: 6, h: 6 } }),

      setLockChanges: (value) => set({ lockChanges: value }),

      // Añadido: acción para cambiar el breakpoint
      setCurrentBreakpoint: (breakpoint) =>
        set({ currentBreakpoint: breakpoint }),

      // Acciones de IA
      toggleIaChat: () => set((state) => ({ iaChatOpen: !state.iaChatOpen })),

      openIaChat: () => set({ iaChatOpen: true }),

      closeIaChat: () => set({ iaChatOpen: false }),

      addIaMessage: (message) =>
        set((state) => ({
          iaMessages: [...state.iaMessages, message],
        })),

      setIaMessages: (messages) => set({ iaMessages: messages }),

      updateIaMessage: (messageId, updates) =>
        set((state) => ({
          iaMessages: state.iaMessages.map((message) =>
            message.id === messageId ? { ...message, ...updates } : message
          ),
        })),

      clearIaMessages: () => set({ iaMessages: [] }),

      setIaIsLoading: (isLoading) => set({ iaIsLoading: isLoading }),

      setIaCurrentCheckpoint: (checkpointId) =>
        set({ iaCurrentCheckpointId: checkpointId }),

      // Añadido: acciones para el mensaje preparado
      setPreparedMessage: (message) => set({ preparedMessage: message }),

      clearPreparedMessage: () => set({ preparedMessage: "" }),
    }),
    {
      name: "ui-store",
    }
  )
);
