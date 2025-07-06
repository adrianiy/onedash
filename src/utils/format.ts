import numeral from "numeral";

// Configurar numeral.js para usar formato español (punto para separador de miles, coma para decimales)
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
  ordinal: (number) => {
    return "º";
  },
});

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
    .format("0,0%")
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
