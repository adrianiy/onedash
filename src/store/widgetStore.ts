import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { Widget } from "../types/widget";
import { generateId } from "../utils/helpers";

interface WidgetState {
  widgets: Widget[];

  // Actions
  addWidget: (widget: Omit<Widget, "id" | "createdAt" | "updatedAt">) => Widget;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  deleteWidget: (id: string) => void;
  getWidget: (id: string) => Widget | undefined;
  getWidgetsByIds: (ids: string[]) => Widget[];
}

export const useWidgetStore = create<WidgetState>()(
  devtools(
    persist(
      (set, get) => ({
        widgets: [],

        addWidget: (widgetData) => {
          const newWidget: Widget = {
            ...widgetData,
            id: generateId(),
            createdAt: new Date(),
            updatedAt: new Date(),
          } as Widget;

          set((state) => ({
            widgets: [...state.widgets, newWidget],
          }));

          return newWidget;
        },

        updateWidget: (id, updates) => {
          set((state) => ({
            widgets: state.widgets.map((widget) =>
              widget.id === id
                ? { ...widget, ...updates, updatedAt: new Date() }
                : widget
            ),
          }));
        },

        deleteWidget: (id) => {
          set((state) => ({
            widgets: state.widgets.filter((widget) => widget.id !== id),
          }));
        },

        getWidget: (id) => {
          return get().widgets.find((widget) => widget.id === id);
        },

        getWidgetsByIds: (ids) => {
          const { widgets } = get();
          return widgets.filter((widget) => ids.includes(widget.id));
        },
      }),
      {
        name: "widget-storage",
        partialize: (state) => ({
          widgets: state.widgets,
        }),
      }
    ),
    {
      name: "widget-store",
    }
  )
);
