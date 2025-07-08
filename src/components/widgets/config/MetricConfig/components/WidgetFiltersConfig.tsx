import React, { useState, useRef } from "react";
import { Icon } from "../../../../common/Icon";
import { Tooltip } from "react-tooltip";
import { ConfigDropdown } from "../../../common/ConfigDropdown";
import { CustomMultiSelect } from "../../../../common/CustomMultiSelect";
import { DateRangeDropdown } from "../../../../common/DateRangeDropdown";
import { useWidgetStore } from "../../../../../store/widgetStore";
import type { Widget, MetricWidgetConfig } from "../../../../../types/widget";

interface WidgetFiltersConfigProps {
  widget: Widget;
}

// Opciones para los filtros (mismas que en FilterBar)
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

// Tipo de filtro
type FilterType = "products" | "sections" | "dateRange";

export const WidgetFiltersConfig: React.FC<WidgetFiltersConfigProps> = ({
  widget,
}) => {
  const metricConfig = widget.type === "metric" ? widget.config : {};
  const widgetFilters =
    (metricConfig as MetricWidgetConfig).widgetFilters || {};

  // Referencia para controlar el estado del dropdown
  const setDropdownOpenRef = useRef<((isOpen: boolean) => void) | null>(null);

  // Obtener valores actuales de filtros o inicializar vacíos
  const products = widgetFilters.products || [];
  const sections = widgetFilters.sections || [];
  const dateRange = widgetFilters.dateRange || { start: null, end: null };

  // Estado para determinar qué tipos de filtros ya están añadidos
  const [addedFilterTypes, setAddedFilterTypes] = useState<FilterType[]>(() => {
    const types: FilterType[] = [];
    if (products.length > 0) types.push("products");
    if (sections.length > 0) types.push("sections");
    if (dateRange.start !== null || dateRange.end !== null)
      types.push("dateRange");
    return types;
  });

  // Funciones para actualizar los filtros
  const updateWidgetFilters = (
    newFilters: Partial<MetricWidgetConfig["widgetFilters"]>
  ) => {
    if (widget.type === "metric") {
      useWidgetStore.getState().updateWidget(widget.id, {
        config: {
          ...widget.config,
          widgetFilters: {
            ...widgetFilters,
            ...newFilters,
          },
        },
      });
    }
  };

  // Handlers para los filtros
  const handleProductsChange = (values: string[]) => {
    updateWidgetFilters({ products: values });
  };

  const handleSectionsChange = (values: string[]) => {
    updateWidgetFilters({ sections: values });
  };

  const handleDateRangeChange = (start: string | null, end: string | null) => {
    updateWidgetFilters({
      dateRange: {
        start,
        end,
      },
    });
  };

  // Función para eliminar un filtro
  const handleRemoveFilter = (filterType: FilterType) => {
    setAddedFilterTypes(addedFilterTypes.filter((type) => type !== filterType));

    switch (filterType) {
      case "products":
        updateWidgetFilters({ products: [] });
        break;
      case "sections":
        updateWidgetFilters({ sections: [] });
        break;
      case "dateRange":
        updateWidgetFilters({ dateRange: { start: null, end: null } });
        break;
    }
  };

  // Función para añadir un nuevo tipo de filtro
  const handleAddFilterType = (filterType: FilterType) => {
    if (!addedFilterTypes.includes(filterType)) {
      setAddedFilterTypes([...addedFilterTypes, filterType]);

      // Inicializar filtro vacío según el tipo
      switch (filterType) {
        case "products":
          updateWidgetFilters({ products: [] });
          break;
        case "sections":
          updateWidgetFilters({ sections: [] });
          break;
        case "dateRange":
          updateWidgetFilters({ dateRange: { start: null, end: null } });
          break;
      }
    }

    // Cerrar dropdown
    if (setDropdownOpenRef.current) {
      setDropdownOpenRef.current(false);
    }
  };

  // Verificar qué tipos de filtros están disponibles para añadir
  const availableFilterTypes = ["products", "sections", "dateRange"].filter(
    (type) => !addedFilterTypes.includes(type as FilterType)
  ) as FilterType[];

  // Renderizar los filtros configurados
  const renderConfiguredFilters = () => {
    if (addedFilterTypes.length === 0) return null;

    return (
      <div className="widget-filters__list config-panel__items-list">
        {addedFilterTypes.includes("products") && (
          <div className="widget-filters__item">
            <div className="widget-filters__item-header">
              <span className="widget-filters__item-title">Productos</span>
              <button
                className="widget-filters__remove-button"
                onClick={() => handleRemoveFilter("products")}
                data-tooltip-id="widget-filter-tooltip-products"
                data-tooltip-content="Eliminar filtro de productos"
              >
                <Icon name="trash" size={14} />
              </button>
              <Tooltip id="widget-filter-tooltip-products" place="top" />
            </div>
            <div className="widget-filters__item-content">
              <CustomMultiSelect
                options={PRODUCT_OPTIONS}
                value={products}
                onChange={handleProductsChange}
                placeholder="Seleccionar productos"
                className="widget-filters__control"
              />
            </div>
          </div>
        )}

        {addedFilterTypes.includes("sections") && (
          <div className="widget-filters__item">
            <div className="widget-filters__item-header">
              <span className="widget-filters__item-title">Secciones</span>
              <button
                className="widget-filters__remove-button"
                onClick={() => handleRemoveFilter("sections")}
                data-tooltip-id="widget-filter-tooltip-sections"
                data-tooltip-content="Eliminar filtro de secciones"
              >
                <Icon name="trash" size={14} />
              </button>
              <Tooltip id="widget-filter-tooltip-sections" place="top" />
            </div>
            <div className="widget-filters__item-content">
              <CustomMultiSelect
                options={SECTION_OPTIONS}
                value={sections}
                onChange={handleSectionsChange}
                placeholder="Seleccionar secciones"
                className="widget-filters__control"
              />
            </div>
          </div>
        )}

        {addedFilterTypes.includes("dateRange") && (
          <div className="widget-filters__item">
            <div className="widget-filters__item-header">
              <span className="widget-filters__item-title">
                Rango de fechas
              </span>
              <button
                className="widget-filters__remove-button"
                onClick={() => handleRemoveFilter("dateRange")}
                data-tooltip-id="widget-filter-tooltip-dateRange"
                data-tooltip-content="Eliminar filtro de fechas"
              >
                <Icon name="trash" size={14} />
              </button>
              <Tooltip id="widget-filter-tooltip-dateRange" place="top" />
            </div>
            <div className="widget-filters__item-content">
              <DateRangeDropdown
                startDate={dateRange.start}
                endDate={dateRange.end}
                onChange={handleDateRangeChange}
                placeholder="Seleccionar fechas"
                className="widget-filters__control"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`widget-filters widget-filters--standalone ${
        addedFilterTypes.length > 0
          ? "widget-filters--with-filters"
          : "widget-filters--empty-state"
      }`}
    >
      <ConfigDropdown
        className="widget-filters-dropdown"
        setIsOpenRef={setDropdownOpenRef}
        triggerElement={({ ref, onClick, referenceProps }) =>
          addedFilterTypes.length > 0 ? (
            <>
              <div className="viz-section-header widget-filters__header">
                <h3 className="viz-section-title">Filtros de componente</h3>
                {availableFilterTypes.length > 0 && (
                  <button
                    ref={ref}
                    className="viz-add-button"
                    onClick={onClick}
                    {...referenceProps}
                  >
                    <Icon name="plus" size={14} /> Añadir filtros
                  </button>
                )}
              </div>
              {renderConfiguredFilters()}
            </>
          ) : (
            <div className="widget-filters-empty">
              <button
                ref={ref}
                className="widget-filters-add-centered"
                onClick={onClick}
                {...referenceProps}
              >
                <Icon name="filter" size={14} /> Añadir filtros
              </button>
            </div>
          )
        }
      >
        <div className="widget-filters__dropdown-content">
          <div className="widget-filters__dropdown-description">
            Estos filtros se aplicarán siempre a esta métrica,
            independientemente de los filtros globales
          </div>

          <div className="widget-filters-options">
            {availableFilterTypes.includes("products") && (
              <button
                className="widget-filters-option"
                onClick={() => handleAddFilterType("products")}
              >
                <div className="widget-filters-icon-container">
                  <Icon name="database" size={14} />
                </div>
                <div className="widget-filters-option__title">Productos</div>
              </button>
            )}

            {availableFilterTypes.includes("sections") && (
              <button
                className="widget-filters-option"
                onClick={() => handleAddFilterType("sections")}
              >
                <div className="widget-filters-icon-container">
                  <Icon name="tag" size={14} />
                </div>
                <div className="widget-filters-option__title">Secciones</div>
              </button>
            )}

            {availableFilterTypes.includes("dateRange") && (
              <button
                className="widget-filters-option"
                onClick={() => handleAddFilterType("dateRange")}
              >
                <div className="widget-filters-icon-container">
                  <Icon name="calendar" size={14} />
                </div>
                <div className="widget-filters-option__title">
                  Rango de fechas
                </div>
              </button>
            )}

            {availableFilterTypes.length === 0 && (
              <div className="widget-filters__empty-options">
                No hay más filtros disponibles para añadir
              </div>
            )}
          </div>
        </div>
      </ConfigDropdown>
    </div>
  );
};
