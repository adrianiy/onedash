import React from "react";
import { Icon } from "../common/Icon";
import { CustomSelect } from "../common/CustomSelect";
import { useVariableStore } from "../../store/variableStore";
import type { DashboardVariable, VariableType } from "../../types/variables";

interface FilterBarProps {
  className?: string;
}

const getVariableOptions = (type: VariableType) => {
  switch (type) {
    case "indicator":
      return [
        { value: "importe", label: "Importe" },
        { value: "unidades", label: "Unidades" },
        { value: "pedidos", label: "Pedidos" },
      ];
    case "sale_type":
      return [
        { value: "bruto", label: "Bruto" },
        { value: "neto", label: "Neto" },
        { value: "devos", label: "Devoluciones" },
      ];
    case "scope":
      return [
        { value: "mismas_tiendas", label: "Mismas Tiendas" },
        { value: "total_tiendas", label: "Total Tiendas" },
      ];
    case "timeframe":
      return [
        { value: "hoy", label: "Hoy" },
        { value: "ayer", label: "Ayer" },
        { value: "semana", label: "Semana" },
        { value: "mes", label: "Mes" },
        { value: "año", label: "Año" },
      ];
    default:
      return [];
  }
};

const renderVariableInput = (
  variable: DashboardVariable,
  onValueChange: (value: unknown) => void
) => {
  const options = getVariableOptions(variable.type);

  if (options.length > 0) {
    return (
      <CustomSelect
        value={variable.value as string}
        onChange={onValueChange}
        options={options}
        placeholder={`Seleccionar ${variable.name.toLowerCase()}`}
      />
    );
  }

  // For custom variables or date ranges, show a simple input
  if (variable.type === "date_range") {
    return (
      <input
        type="date"
        value={variable.value as string}
        onChange={(e) => onValueChange(e.target.value)}
        className="filter-bar__input"
      />
    );
  }

  return (
    <input
      type="text"
      value={String(variable.value || "")}
      onChange={(e) => onValueChange(e.target.value)}
      placeholder={variable.name}
      className="filter-bar__input"
    />
  );
};

export const FilterBar: React.FC<FilterBarProps> = ({ className = "" }) => {
  const visibleVariables = useVariableStore((state) =>
    state.getVisibleVariables()
  );
  const setVariable = useVariableStore((state) => state.setVariable);

  if (visibleVariables.length === 0) {
    return null;
  }

  return (
    <div className={`filter-bar ${className}`}>
      <div className="filter-bar__content">
        <div className="filter-bar__icon">
          <Icon name="filter" size={20} />
        </div>

        <div className="filter-bar__filters">
          {visibleVariables.map((variable) => (
            <div key={variable.id} className="filter-bar__item">
              <label className="filter-bar__label">{variable.name}</label>
              {renderVariableInput(variable, (value) =>
                setVariable(variable.id, value)
              )}
            </div>
          ))}
        </div>

        <div className="filter-bar__actions">
          <button
            className="filter-bar__clear"
            onClick={() => {
              // Reset all variables to their default values
              visibleVariables.forEach((variable) => {
                const defaultValue =
                  getVariableOptions(variable.type)[0]?.value || "";
                setVariable(variable.id, defaultValue);
              });
            }}
          >
            <Icon name="x" size={16} />
            Limpiar
          </button>
        </div>
      </div>
    </div>
  );
};
