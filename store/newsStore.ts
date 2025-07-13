import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IconName } from "@/common/Icon";

export type NewsCategory = "functional" | "technical";

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  date: string;
  read: boolean;
  category: NewsCategory;
}

interface NewsStore {
  items: NewsItem[];
  lastViewedDate: string | null;
  bannerDismissed: boolean;

  // Acciones
  markAsRead: (id: string) => void;
  updateLastViewedDate: () => void;
  dismissBanner: () => void;
  resetBannerDismissed: () => void;

  // Selectores
  hasUnreadNews: () => boolean;
}

// Lista de novedades del proyecto
// Nuevas entradas se deben agregar al inicio del array
const newsItems: NewsItem[] = [
  // Novedades funcionales
  {
    id: "10",
    title: "Nueva guía de bienvenida",
    description:
      "Hemos añadido una guía de bienvenida para ayudarte a dar tus primeros pasos en OneDash y aprovechar al máximo todas sus funcionalidades.",
    icon: "list-todo",
    date: "2025-07-13",
    read: false,
    category: "functional",
  },
  {
    id: "9",
    title: "Sección de guías y novedades",
    description:
      "Ahora puedes acceder a las guías y novedades de la plataforma directamente desde el menú de usuario.",
    icon: "bell",
    date: "2025-07-12",
    read: false,
    category: "functional",
  },
  {
    id: "11",
    title: "Compartir dashboards",
    description:
      "Ahora puedes compartir tus dashboards con otros usuarios mediante un enlace y añadir colaboradores específicos con permisos de edición. Los usuarios también pueden guardar dashboards compartidos en su lista personal.",
    icon: "link",
    date: "2025-07-13",
    read: false,
    category: "functional",
  },
  {
    id: "8",
    title: "Nuevo tema de colores ITX",
    description:
      "Se ha añadido un nuevo tema de colores ITX que puedes seleccionar desde el botón del header para personalizar la apariencia de tu dashboard.",
    icon: "palette",
    date: "2025-07-10",
    read: false,
    category: "functional",
  },
  {
    id: "7",
    title: "Función de hacer/deshacer",
    description:
      "Ahora puedes deshacer y rehacer cambios en el modo edición, facilitando la corrección de errores y la exploración de diferentes configuraciones.",
    icon: "undo",
    date: "2025-07-05",
    read: false,
    category: "functional",
  },
  {
    id: "6",
    title: "Integración con backend de datos mock",
    description:
      "Hemos mejorado la integración con un backend de datos mock para proporcionar una experiencia más realista en la demo.",
    icon: "database",
    date: "2025-07-01",
    read: false,
    category: "functional",
  },
  {
    id: "5",
    title: "Mejora de tiempos en guardado",
    description:
      "Se han optimizado los procesos de guardado y restauración, reduciendo significativamente los tiempos de espera y mejorando la experiencia de usuario.",
    icon: "save",
    date: "2025-06-28",
    read: false,
    category: "functional",
  },
  {
    id: "4",
    title: "Configuración de anchos de barra",
    description:
      "Ahora puedes configurar el ancho de las barras en los gráficos de barras, permitiendo una personalización más detallada de tus visualizaciones.",
    icon: "bar-chart",
    date: "2025-06-25",
    read: false,
    category: "functional",
  },

  // Novedades técnicas
  {
    id: "3",
    title: "Refactorización de código",
    description:
      "Hemos realizado una extensa refactorización de código para eliminar duplicidades y mejorar la mantenibilidad del proyecto.",
    icon: "hash",
    date: "2025-06-20",
    read: false,
    category: "technical",
  },
  {
    id: "2",
    title: "Simplificación del store",
    description:
      "Se ha simplificado la estructura del store para mejorar la predictibilidad del estado y facilitar su mantenimiento.",
    icon: "layers",
    date: "2025-06-15",
    read: false,
    category: "technical",
  },
  {
    id: "1",
    title: "Implementación de React Query",
    description:
      "Hemos migrado de peticiones fetch directas desde el store a React Query, mejorando la gestión del caché y el rendimiento general de la aplicación.",
    icon: "zap",
    date: "2025-06-10",
    read: false,
    category: "technical",
  },
];

// Creación del store con persistencia
export const useNewsStore = create<NewsStore>()(
  persist(
    (set, get) => ({
      items: newsItems,
      lastViewedDate: null,
      bannerDismissed: false,

      markAsRead: (id) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, read: true } : item
          ),
        }));
      },

      updateLastViewedDate: () => {
        set({
          lastViewedDate: new Date().toISOString(),
        });
      },

      dismissBanner: () => {
        set({ bannerDismissed: true });
      },

      resetBannerDismissed: () => {
        set({ bannerDismissed: false });
      },

      hasUnreadNews: () => {
        return get().items.some((item) => !item.read);
      },
    }),
    {
      name: "onedash-news", // nombre único para localStorage
      version: 1,
      partialize: (state) => ({
        // Solo persistimos estos campos
        items: state.items.map((item) => ({
          ...item,
          // Si existen nuevas novedades en la lista hardcodeada,
          // mantenemos su estado como no leído
          read:
            newsItems.find((ni) => ni.id === item.id)?.read === false
              ? false
              : item.read,
        })),
        lastViewedDate: state.lastViewedDate,
        bannerDismissed: state.bannerDismissed,
      }),
    }
  )
);
