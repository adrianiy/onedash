import { Dashboard, DashboardLayout, Breakpoint } from "@/types/dashboard";
import { Widget } from "@/types/widget";
import { simpleTemplate } from "./simpleTemplate";
import { advancedTemplate } from "./advancedTemplate";
import { detailTemplate } from "./detailTemplate";

export { simpleTemplate, advancedTemplate, detailTemplate };

/**
 * Interfaz para definir plantillas de dashboard
 */
export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  widgets: Widget[];
  layouts: Record<Breakpoint, DashboardLayout[]>;
  tags: string[];
  use_cases: string[];
}

/**
 * Obtiene todas las plantillas de dashboard disponibles
 */
export function getAllTemplates(): DashboardTemplate[] {
  return [simpleTemplate, advancedTemplate, detailTemplate];
}

/**
 * Obtiene una plantilla por su ID
 */
export function getTemplateById(id: string): DashboardTemplate | undefined {
  return getAllTemplates().find((template) => template.id === id);
}

/**
 * Obtiene plantillas filtradas por etiquetas
 */
export function getTemplatesByTags(tags: string[]): DashboardTemplate[] {
  if (!tags.length) return getAllTemplates();

  const lowerTags = tags.map((tag) => tag.toLowerCase());
  return getAllTemplates().filter((template) =>
    template.tags.some((tag) => lowerTags.includes(tag.toLowerCase()))
  );
}

/**
 * Obtiene plantillas relacionadas con un caso de uso específico
 */
export function getTemplatesByUseCase(useCase: string): DashboardTemplate[] {
  const lowerUseCase = useCase.toLowerCase();
  return getAllTemplates().filter((template) =>
    template.use_cases.some((uc) => uc.toLowerCase().includes(lowerUseCase))
  );
}

/**
 * Convierte una plantilla a un objeto Dashboard listo para guardar en la base de datos
 */
export function templateToDashboard(
  template: DashboardTemplate,
  userId: string,
  customName?: string,
  customDescription?: string
): Omit<Dashboard, "_id" | "createdAt" | "updatedAt"> {
  return {
    name: customName || template.name,
    description: customDescription || template.description,
    layouts: template.layouts,
    widgets: template.widgets.map((w) => w._id),
    userId: userId,
    visibility: "private",
    isReadonly: false,
  };
}
