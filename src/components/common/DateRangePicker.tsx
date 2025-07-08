import React, { useState, useRef, useEffect } from "react";
import Calendar from "react-calendar";
import { Icon } from "./Icon";
import "react-calendar/dist/Calendar.css";

interface DateRangePickerProps {
  startDate: string | null;
  endDate: string | null;
  onChange: (startDate: string | null, endDate: string | null) => void;
  placeholder?: string;
  isDisabled?: boolean;
  className?: string;
}

interface QuickOption {
  label: string;
  value: string;
  getDates: () => { start: string; end: string };
}

const getQuickOptions = (): QuickOption[] => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const lastWeekStart = new Date(today);
  lastWeekStart.setDate(today.getDate() - 7);

  const lastMonthStart = new Date(today);
  lastMonthStart.setMonth(today.getMonth() - 1);

  const lastQuarterStart = new Date(today);
  lastQuarterStart.setMonth(today.getMonth() - 3);

  const yearStart = new Date(today.getFullYear(), 0, 1);

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  return [
    {
      label: "Hoy",
      value: "today",
      getDates: () => ({ start: formatDate(today), end: formatDate(today) }),
    },
    {
      label: "Ayer",
      value: "yesterday",
      getDates: () => ({
        start: formatDate(yesterday),
        end: formatDate(yesterday),
      }),
    },
    {
      label: "Última semana",
      value: "lastWeek",
      getDates: () => ({
        start: formatDate(lastWeekStart),
        end: formatDate(today),
      }),
    },
    {
      label: "Último mes",
      value: "lastMonth",
      getDates: () => ({
        start: formatDate(lastMonthStart),
        end: formatDate(today),
      }),
    },
    {
      label: "Último trimestre",
      value: "lastQuarter",
      getDates: () => ({
        start: formatDate(lastQuarterStart),
        end: formatDate(today),
      }),
    },
    {
      label: "Año actual",
      value: "currentYear",
      getDates: () => ({
        start: formatDate(yearStart),
        end: formatDate(today),
      }),
    },
  ];
};

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onChange,
  placeholder = "Seleccionar fecha",
  isDisabled = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedQuickOption, setSelectedQuickOption] = useState<string | null>(
    null
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const quickOptions = getQuickOptions();

  // Detectar automáticamente la opción rápida seleccionada
  useEffect(() => {
    if (startDate && endDate) {
      const today = new Date().toISOString().split("T")[0];

      // Verificar si las fechas corresponden a "Hoy"
      if (startDate === today && endDate === today) {
        setSelectedQuickOption("today");
        return;
      }

      // Verificar otras opciones rápidas
      for (const option of quickOptions) {
        const dates = option.getDates();
        if (dates.start === startDate && dates.end === endDate) {
          setSelectedQuickOption(option.value);
          return;
        }
      }
    }

    // Si no coincide con ninguna opción rápida, deseleccionar
    setSelectedQuickOption(null);
  }, [startDate, endDate, quickOptions]);

  // Formatear fecha para mostrar
  const formatDateForDisplay = (date: string | null) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Obtener el texto a mostrar
  const getDisplayText = () => {
    if (!startDate && !endDate) return placeholder;

    // Si hay una opción rápida seleccionada, mostrar su etiqueta
    if (selectedQuickOption) {
      const option = quickOptions.find(
        (opt) => opt.value === selectedQuickOption
      );
      if (option) {
        return option.label;
      }
    }

    if (startDate && endDate) {
      if (startDate === endDate) {
        return formatDateForDisplay(startDate);
      }
      return `${formatDateForDisplay(startDate)} - ${formatDateForDisplay(
        endDate
      )}`;
    }
    if (startDate) return `Desde ${formatDateForDisplay(startDate)}`;
    if (endDate) return `Hasta ${formatDateForDisplay(endDate)}`;
    return placeholder;
  };

  // Convertir strings a Date objects para el calendario
  const getCalendarValue = (): [Date, Date] | Date | null => {
    if (startDate && endDate) {
      return [new Date(startDate), new Date(endDate)];
    }
    if (startDate) {
      return new Date(startDate);
    }
    if (endDate) {
      return new Date(endDate);
    }
    return null;
  };

  // Manejar cambio en el calendario
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCalendarChange = (value: any) => {
    setSelectedQuickOption(null); // Deseleccionar opciones rápidas

    if (Array.isArray(value)) {
      // Rango seleccionado
      const [start, end] = value;
      if (start && end) {
        const startStr = start.toISOString().split("T")[0];
        const endStr = end.toISOString().split("T")[0];
        onChange(startStr, endStr);
      }
    } else if (value) {
      // Fecha única seleccionada
      const dateStr = value.toISOString().split("T")[0];
      onChange(dateStr, dateStr);
    }
  };

  // Manejar clic en opción rápida
  const handleQuickOption = (option: QuickOption) => {
    const dates = option.getDates();
    setSelectedQuickOption(option.value);
    onChange(dates.start, dates.end);
    setIsOpen(false);
  };

  // Limpiar fechas
  const handleClear = () => {
    setSelectedQuickOption(null);
    onChange(null, null);
    setIsOpen(false);
  };

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`date-range-picker ${className}`} ref={containerRef}>
      <div
        className={`date-range-picker__control ${
          isOpen ? "date-range-picker__control--open" : ""
        } ${isDisabled ? "date-range-picker__control--disabled" : ""}`}
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
      >
        <div className="date-range-picker__text">{getDisplayText()}</div>
        <div className="date-range-picker__chevron">
          <Icon name="chevron-down" size={14} />
        </div>
      </div>

      {isOpen && (
        <div className="date-range-picker__dropdown">
          <div className="date-range-picker__layout">
            <div className="date-range-picker__quick-section">
              <div className="date-range-picker__quick-title">
                Opciones rápidas
              </div>
              <div className="date-range-picker__quick-options">
                {quickOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`date-range-picker__quick-option ${
                      selectedQuickOption === option.value
                        ? "date-range-picker__quick-option--active"
                        : ""
                    }`}
                    onClick={() => handleQuickOption(option)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="date-range-picker__calendar-section">
              <Calendar
                selectRange={true}
                showDoubleView={true}
                value={getCalendarValue()}
                onChange={handleCalendarChange}
                locale="es-ES"
                className="date-range-picker__calendar"
                calendarType="iso8601"
                minDetail="month"
                maxDetail="month"
                showNeighboringMonth={false}
                formatShortWeekday={(_locale, date) => {
                  const weekdays = ["D", "L", "M", "X", "J", "V", "S"];
                  return weekdays[date.getDay()];
                }}
              />
            </div>
          </div>

          <div className="date-range-picker__actions">
            <button className="date-range-picker__clear" onClick={handleClear}>
              <Icon name="x" size={14} />
              Limpiar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
