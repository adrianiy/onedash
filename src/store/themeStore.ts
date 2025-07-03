import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface ThemeState {
  theme: "light" | "dark";

  // Actions
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  devtools(
    persist(
      (set, get) => ({
        theme: "light",

        setTheme: (theme) => {
          set({ theme });
          // Update HTML data attribute for CSS theming
          document.documentElement.setAttribute("data-theme", theme);
        },

        toggleTheme: () => {
          const { theme } = get();
          const newTheme = theme === "light" ? "dark" : "light";
          get().setTheme(newTheme);
        },
      }),
      {
        name: "theme-storage",
      }
    ),
    {
      name: "theme-store",
    }
  )
);

// Initialize theme on store creation
useThemeStore.getState().setTheme(useThemeStore.getState().theme);
