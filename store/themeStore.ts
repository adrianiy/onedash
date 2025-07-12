import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface ThemeState {
  theme: "light" | "dark" | "itx";

  // Actions
  setTheme: (theme: "light" | "dark" | "itx") => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  devtools(
    persist(
      (set, get) => ({
        theme: "light",

        setTheme: (theme) => {
          set({ theme });
          // Update HTML data attribute for CSS theming (only on client)
          if (typeof window !== "undefined") {
            document.documentElement.setAttribute("data-theme", theme);
          }
        },

        toggleTheme: () => {
          const { theme } = get();
          // Rotación de temas: light -> dark -> itx -> light
          let newTheme: "light" | "dark" | "itx";

          switch (theme) {
            case "light":
              newTheme = "dark";
              break;
            case "dark":
              newTheme = "itx";
              break;
            case "itx":
              newTheme = "light";
              break;
            default:
              newTheme = "light";
          }

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

// Initialize theme on store creation (only on client)
if (typeof window !== "undefined") {
  useThemeStore.getState().setTheme(useThemeStore.getState().theme);
}
