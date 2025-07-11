import React, { useRef, useState, useEffect } from "react";
import Calendar from "react-calendar";
import { ConfigDropdown } from "@/components/widgets/common/ConfigDropdown";
import { CustomSelect } from "./CustomSelect";
import { Icon } from "./Icon";
import "react-calendar/dist/Calendar.css";

interface DateRangeDropdownProps {
  startDate: string | null;
  endDate: string | null;
  onChange: (startDate: string | null, endDate: string | null) => void;
  placeholder?: string;
  isDisabled?: boolean;
  className?: string;
  isActive?: boolean;
}

interface QuickOption {
  label: string;
  value: string;
  getDates: () => { start: string; end: string };
}

const getQuickOptions = (): QuickOption[] => {
  const today = new Date();

  // Calculamos el límite mínimo (2 años atrás)
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 2);

  // Calculamos el límite máximo (mañana)
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 1);

  // Configuramos las fechas para las opciones rápidas, respetando límites
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const lastWeekStart = new Date(today);
  lastWeekStart.setDate(today.getDate() - 7);
  // Asegurarnos que no sea anterior al límite mínimo
  if (lastWeekStart < minDate) {
    lastWeekStart.setTime(minDate.getTime());
  }

  const lastMonthStart = new Date(today);
  lastMonthStart.setMonth(today.getMonth() - 1);
  // Asegurarnos que no sea anterior al límite mínimo
  if (lastMonthStart < minDate) {
    lastMonthStart.setTime(minDate.getTime());
  }

  const lastQuarterStart = new Date(today);
  lastQuarterStart.setMonth(today.getMonth() - 3);
  // Asegurarnos que no sea anterior al límite mínimo
  if (lastQuarterStart < minDate) {
    lastQuarterStart.setTime(minDate.getTime());
  }

  const yearStart = new Date(today.getFullYear(), 0, 1);
  // Asegurarnos que no sea anterior al límite mínimo
  if (yearStart < minDate) {
    yearStart.setTime(minDate.getTime());
  }

  // Función auxiliar para formatear fechas preservando la fecha local
  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

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

export const DateRangeDropdown: React.FC<DateRangeDropdownProps> = ({
  startDate,
  endDate,
  onChange,
  placeholder = "Seleccionar fechas",
  isDisabled = false,
  className = "", // Se mantiene por consistencia con la API aunque no se use directamente
  isActive = false,
}) => {
  const setDropdownOpenRef = useRef<((isOpen: boolean) => void) | null>(null);
  const [selectedQuickOption, setSelectedQuickOption] = useState<string | null>(
    null
  );
  const quickOptions = getQuickOptions();
  const [compareType, setCompareType] = useState<string>("comercial");

  const compareOptions = [
    { value: "calendario", label: "Comparable Calendario" },
    { value: "comercial", label: "Comparable Comercial" },
    { value: "ordinal", label: "Comparable Ordinal" },
  ];

  // Función auxiliar para formatear fechas preservando la fecha local
  const formatLocalDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  // Detectar automáticamente la opción rápida seleccionada
  useEffect(() => {
    if (startDate && endDate) {
      const today = formatLocalDate(new Date());

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

  return (
    <ConfigDropdown
      setIsOpenRef={setDropdownOpenRef}
      className={`date-range-dropdown ${className}`}
      placement="top-end"
      offsetDistance={4}
      usePortal={true}
      triggerElement={({ ref, onClick, referenceProps }) => (
        <div
          ref={ref}
          className={`date-range-picker__control ${
            isDisabled ? "date-range-picker__control--disabled" : ""
          } ${isActive ? "filter-bar__filter-control--active" : ""}`}
          onClick={() => !isDisabled && onClick()}
          {...referenceProps}
        >
          <div className="date-range-picker__text">{getDisplayText()}</div>
          <div className="date-range-picker__chevron">
            {isActive ? (
              <button
                className="date-range-picker__reset-button"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  // Obtener la fecha actual usando formateo de fecha local
                  const today = new Date();
                  const formattedToday = `${today.getFullYear()}-${String(
                    today.getMonth() + 1
                  ).padStart(2, "0")}-${String(today.getDate()).padStart(
                    2,
                    "0"
                  )}`;
                  onChange(formattedToday, formattedToday);
                }}
                aria-label="Restablecer a fecha actual"
              >
                <Icon
                  name="x"
                  size={14}
                  className="date-range-picker__reset-icon"
                />
              </button>
            ) : (
              <Icon name="chevron-down" size={14} />
            )}
          </div>
        </div>
      )}
    >
      <div className="date-range-dropdown__content">
        <div className="date-range-dropdown__calendar-container">
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
                    onClick={() => {
                      const dates = option.getDates();
                      setSelectedQuickOption(option.value);
                      onChange(dates.start, dates.end);
                      if (setDropdownOpenRef.current) {
                        setDropdownOpenRef.current(false);
                      }
                    }}
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
                value={
                  startDate && endDate
                    ? [new Date(startDate), new Date(endDate)]
                    : null
                }
                onChange={(value) => {
                  setSelectedQuickOption(null); // Deseleccionar opciones rápidas

                  if (Array.isArray(value)) {
                    // Rango seleccionado
                    const [start, end] = value;
                    if (start && end) {
                      const startStr = formatLocalDate(start);
                      const endStr = formatLocalDate(end);
                      onChange(startStr, endStr);
                    }
                  } else if (value) {
                    // Fecha única seleccionada
                    const dateStr = formatLocalDate(value);
                    onChange(dateStr, dateStr);
                  }

                  // Cerramos el dropdown después de seleccionar
                  if (setDropdownOpenRef.current) {
                    setDropdownOpenRef.current(false);
                  }
                }}
                locale="es-ES"
                className="date-range-picker__calendar"
                calendarType="iso8601"
                showNeighboringMonth={false}
                minDate={(() => {
                  const date = new Date();
                  date.setFullYear(date.getFullYear() - 2);
                  return date;
                })()}
                maxDate={(() => {
                  const date = new Date();
                  date.setDate(date.getDate() + 1);
                  return date;
                })()}
                minDetail="year"
                maxDetail="month"
                formatShortWeekday={(_locale, date) => {
                  const weekdays = ["D", "L", "M", "X", "J", "V", "S"];
                  return weekdays[date.getDay()];
                }}
              />
            </div>
          </div>

          <div className="date-range-picker__footer">
            <div className="date-range-picker__compare-selector">
              <CustomSelect
                value={compareType}
                onChange={(value) => setCompareType(value)}
                options={compareOptions}
                placeholder="Tipo de comparable"
                className="date-range-picker__compare-select"
                menuPlacement="top"
                menuPortalTarget={document.body}
                styles={{
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
                }}
              />
            </div>
            <div className="date-range-picker__footer-actions">
              <button
                className="date-range-picker__apply"
                onClick={() => {
                  if (setDropdownOpenRef.current) {
                    setDropdownOpenRef.current(false);
                  }
                }}
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      </div>
    </ConfigDropdown>
  );
};
