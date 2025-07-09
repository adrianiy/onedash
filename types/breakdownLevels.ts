import type { IconName } from "../components/common/Icon";

export interface BreakdownOption {
  id: string;
  name: string;
}

export interface BreakdownCategory {
  id: string;
  name: string;
  description: string;
  icon: IconName;
  color: string; // Nuevo campo para el color
  options: BreakdownOption[];
}

export const breakdownCategories: BreakdownCategory[] = [
  {
    id: "geographic",
    name: "GEOGRÁFICO",
    description: "Ubicaciones y distribución territorial",
    icon: "map-pin",
    color: "purple",
    options: [
      { id: "zone", name: "Zona" },
      { id: "country", name: "País" },
      { id: "city", name: "Ciudad" },
      { id: "store", name: "Tienda" },
    ],
  },
  {
    id: "commercial",
    name: "COMERCIAL",
    description: "Productos, marcas y canales de venta",
    icon: "tag",
    color: "blue",
    options: [
      { id: "product", name: "Producto" },
      { id: "section", name: "Sección" },
      { id: "family", name: "Familia" },
      { id: "buyer", name: "Comprador" },
    ],
  },
  {
    id: "temporal",
    name: "TEMPORAL",
    description: "Períodos y fechas de análisis",
    icon: "calendar",
    color: "green",
    options: [
      { id: "day", name: "Día" },
      { id: "week", name: "Semana" },
      { id: "month", name: "Mes" },
      { id: "quarter", name: "Quarter" },
      { id: "year", name: "Año" },
    ],
  },
];
