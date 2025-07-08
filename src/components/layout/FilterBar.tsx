import React from "react";
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
    setVariable("dateStart", null);
    setVariable("dateEnd", null);
    setVariable("selectedProducts", []);
    setVariable("selectedSections", []);
  };

  // Verificar si hay filtros activos
  const hasActiveFilters =
    dateStart ||
    dateEnd ||
    selectedProducts.length > 0 ||
    selectedSections.length > 0;

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
            />
          </div>

          <div className="filter-bar__filter-item">
            <CustomMultiSelect
              options={PRODUCT_OPTIONS}
              value={selectedProducts}
              onChange={handleProductsChange}
              placeholder="Producto"
              className="filter-bar__filter-control"
            />
          </div>

          <div className="filter-bar__filter-item">
            <CustomMultiSelect
              options={SECTION_OPTIONS}
              value={selectedSections}
              onChange={handleSectionsChange}
              placeholder="Sección"
              className="filter-bar__filter-control"
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
