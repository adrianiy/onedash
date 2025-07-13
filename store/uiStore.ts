import { Breakpoint, DashboardSettings } from "@/types/dashboard";
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
    }),
    {
      name: "ui-store",
    }
  )
);
