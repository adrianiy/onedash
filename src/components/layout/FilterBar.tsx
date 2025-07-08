import React, { useMemo } from "react";
import { CustomMultiSelect } from "../common/CustomMultiSelect";
import { DateRangePicker } from "../common/DateRangePicker";
import { Icon } from "../common/Icon";
import { useVariableStore } from "../../store/variableStore";
import { useDashboardStore } from "../../store/dashboardStore";

interface FilterBarProps {
  className?: string;
}

// Opciones para los filtros
const PRODUCT_OPTIONS = [
  { value: "Ropa", label: "Ropa" },
  { value: "Calzado", label: "Calzado" },
  { value: "Perfumería", label: "Perfumería" },
];

const SECTION_OPTIONS = [
  { value: "Señora", label: "Señora" },
  { value: "Caballero", label: "Caballero" },
  { value: "Niño", label: "Niño" },
];

export const FilterBar: React.FC<FilterBarProps> = ({ className = "" }) => {
  const { variables, setVariable } = useVariableStore();
  const { isEditing } = useDashboardStore();

  // Extraer variables de filtro
  const dateStart = variables.dateStart || null;
  const dateEnd = variables.dateEnd || null;
  const selectedProducts = variables.selectedProducts || [];
  const selectedSections = variables.selectedSections || [];

  // Función auxiliar para formatear fechas preservando la fecha local
  const formatLocalDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  // Determinar si cada filtro está activo (diferente del valor por defecto)
  const today = useMemo(() => formatLocalDate(new Date()), []);
  const isDateFilterActive = useMemo(() => {
    return dateStart && dateEnd && (dateStart !== today || dateEnd !== today);
  }, [dateStart, dateEnd, today]);

  const isProductFilterActive = useMemo(() => {
    return selectedProducts.length > 0;
  }, [selectedProducts]);

  const isSectionFilterActive = useMemo(() => {
    return selectedSections.length > 0;
  }, [selectedSections]);

  // Handlers para los filtros
  const handleDateRangeChange = (
    startDate: string | null,
    endDate: string | null
  ) => {
    setVariable("dateStart", startDate);
    setVariable("dateEnd", endDate);
  };

  const handleProductsChange = (products: string[]) => {
    setVariable("selectedProducts", products);
  };

  const handleSectionsChange = (sections: string[]) => {
    setVariable("selectedSections", sections);
  };

  const handleClearAll = () => {
    // Obtener la fecha actual (hoy) como valor predeterminado para las fechas
    const today = formatLocalDate(new Date());
    setVariable("dateStart", today);
    setVariable("dateEnd", today);
    // Para los productos y secciones, el valor por defecto es array vacío
    setVariable("selectedProducts", []);
    setVariable("selectedSections", []);
  };

  // Verificar si hay filtros activos (diferentes a los valores predeterminados)
  const hasActiveFilters =
    isDateFilterActive || isProductFilterActive || isSectionFilterActive;

  return (
    <div className={`filter-bar ${isEditing ? "editing" : ""} ${className}`}>
      <div className="filter-bar__container">
        <div className="filter-bar__filters">
          <div className="filter-bar__filter-item">
            <DateRangePicker
              startDate={dateStart}
              endDate={dateEnd}
              onChange={handleDateRangeChange}
              placeholder="Fecha"
              className="filter-bar__filter-control"
              isActive={isDateFilterActive}
            />
          </div>

          <div className="filter-bar__filter-item">
            <CustomMultiSelect
              options={PRODUCT_OPTIONS}
              value={selectedProducts}
              onChange={handleProductsChange}
              placeholder="Producto"
              className="filter-bar__filter-control"
              isActive={isProductFilterActive}
            />
          </div>

          <div className="filter-bar__filter-item">
            <CustomMultiSelect
              options={SECTION_OPTIONS}
              value={selectedSections}
              onChange={handleSectionsChange}
              placeholder="Sección"
              className="filter-bar__filter-control"
              isActive={isSectionFilterActive}
            />
          </div>
        </div>

        <div className="filter-bar__actions">
          {hasActiveFilters && (
            <button
              className="filter-bar__clear-button"
              onClick={handleClearAll}
              title="Limpiar todos los filtros"
            >
              <Icon name="trash" size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
