import numeral from "numeral";

// Configurar numeral.js para usar formato español (punto para separador de miles, coma para decimales)
// Solo registrar si no está ya registrado
try {
  numeral.register("locale", "es", {
    delimiters: {
      thousands: ".",
      decimal: ",",
    },
    abbreviations: {
      thousand: "k",
      million: "m",
      billion: "b",
      trillion: "t",
    },
    currency: {
      symbol: "€",
    },
    ordinal: () => {
      return "º";
    },
  });
} catch {
  // Locale ya está registrado, continuar
}

// Cambiar a formato español
numeral.locale("es");

/**
 * Formatea un número con separadores de miles y decimales según formato español
 * @param value El valor a formatear
 * @param format El formato a aplicar (por defecto con 0 decimales)
 */
export const formatNumber = (value: number, format: string = "0,0"): string => {
  return numeral(value).format(format);
};

/**
 * Formatea un valor de tipo porcentaje
 * @param value El valor a formatear (ej: 12.5 para 12,5%)
 */
export const formatPercent = (value: number): string => {
  return numeral(value / 100)
    .format("+0,0%")
    .replace("%", " %");
};

/**
 * Formatea un valor como moneda (euros)
 * @param value El valor a formatear
 */
export const formatCurrency = (value: number): string => {
  return numeral(value).format("0,0.00 $").replace("$", "€");
};

/**
 * Formatea un número según su tipo
 * @param value El valor a formatear
 * @param type El tipo de valor (porcentaje, moneda, etc.)
 */
export const formatValue = (
  value: number,
  type: string = "default"
): string => {
  switch (type) {
    case "percent":
    case "percentage":
    case "crecimiento":
    case "peso":
      return formatPercent(value);
    case "currency":
    case "money":
    case "euros":
      return formatCurrency(value);
    default:
      // Para números grandes usar formato con separador de miles
      return formatNumber(value);
  }
};

/**
 * Formatea una fecha para mostrar cuánto tiempo ha pasado desde entonces
 * @param date La fecha a formatear
 * @returns String con el tiempo transcurrido (ej: "hace 5 minutos", "hace 2 horas")
 */
export const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Menos de un minuto
  if (diffInSeconds < 60) {
    return "ahora mismo";
  }

  // Menos de una hora
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `hace ${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
  }

  // Menos de un día
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `hace ${hours} ${hours === 1 ? "hora" : "horas"}`;
  }

  // Menos de un mes
  if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `hace ${days} ${days === 1 ? "día" : "días"}`;
  }

  // Menos de un año
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `hace ${months} ${months === 1 ? "mes" : "meses"}`;
  }

  // Más de un año
  const years = Math.floor(diffInSeconds / 31536000);
  return `hace ${years} ${years === 1 ? "año" : "años"}`;
};
