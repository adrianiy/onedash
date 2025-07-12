/**
 * Constantes centralizadas para generación de datos
 * Elimina duplicación entre generateChartData y generateTableData
 */

// Constantes para las dimensiones conocidas
export const KNOWN_DIMENSIONS = {
  product: ["Ropa", "Calzado", "Perfumería"],
  section: ["Señora", "Caballero", "Niño"],
  zone: ["Europa", "América", "Asia", "África"],
  country: [
    "España",
    "Francia",
    "Italia",
    "Alemania",
    "Reino Unido",
    "Estados Unidos",
    "México",
    "China",
    "Japón",
  ],
  city: [
    "Madrid",
    "Barcelona",
    "París",
    "Roma",
    "Berlín",
    "Londres",
    "Nueva York",
    "Ciudad de México",
    "Pekín",
    "Tokio",
  ],
  store: ["Flagship", "Centro comercial", "Calle", "Outlet", "Pop-up"],
  family: ["Básicos", "Temporada", "Colección", "Premium", "Sport"],
  buyer: ["Equipo A", "Equipo B", "Equipo C", "Equipo D"],
  day: [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ],
  week: ["Semana 1", "Semana 2", "Semana 3", "Semana 4"],
  month: [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ],
  quarter: ["Q1", "Q2", "Q3", "Q4"],
  year: ["2023", "2024", "2025"],
};

// Rangos aproximados para métricas
export const METRIC_RANGES = {
  importe: { min: 500, max: 100000 },
  unidades: { min: 10, max: 5000 },
  pedidos: { min: 1, max: 500 },
};

// Pesos de venta por sección (para distribución realista)
export const SECTION_WEIGHTS = {
  Señora: 0.5, // 50% de las ventas
  Caballero: 0.3, // 30% de las ventas
  Niño: 0.2, // 20% de las ventas
};

// Factores de temporada (para simular variaciones estacionales)
export const SEASONALITY = {
  month: {
    Enero: 0.7, // Rebajas de invierno
    Febrero: 0.6,
    Marzo: 0.8,
    Abril: 0.9,
    Mayo: 1.0,
    Junio: 1.1,
    Julio: 1.3, // Rebajas de verano
    Agosto: 1.2,
    Septiembre: 1.0,
    Octubre: 0.9,
    Noviembre: 1.0,
    Diciembre: 1.5, // Navidad
  },
  day: {
    Lunes: 0.8,
    Martes: 0.7,
    Miércoles: 0.8,
    Jueves: 0.9,
    Viernes: 1.2,
    Sábado: 1.5, // Mayor afluencia
    Domingo: 1.1,
  },
};
