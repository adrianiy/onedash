import React from "react";
import Select, { components } from "react-select";
import type {
  StylesConfig,
  SingleValue,
  MultiValue,
  ActionMeta,
  DropdownIndicatorProps,
} from "react-select";
import { Icon } from "./Icon";

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isDisabled?: boolean;
  className?: string;
  menuPlacement?: "auto" | "bottom" | "top";
  menuPortalTarget?: HTMLElement | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  styles?: any;
}

// Componente custom para el dropdown indicator (chevron)
const DropdownIndicator = (props: DropdownIndicatorProps<SelectOption>) => {
  return (
    <components.DropdownIndicator {...props}>
      <Icon name="chevron-down" size={14} />
    </components.DropdownIndicator>
  );
};

// Componente custom para quitar el separador
const IndicatorSeparator = () => null;

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Seleccionar...",
  isDisabled = false,
  className = "",
  menuPlacement,
  menuPortalTarget,
  styles: customStyles,
}) => {
  const selectedOption = options.find((opt) => opt.value === value) || null;

  const handleChange = (
    newValue: SingleValue<SelectOption> | MultiValue<SelectOption>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    actionMeta: ActionMeta<SelectOption>
  ) => {
    // Para select simple, newValue es un objeto con value y label
    if (newValue && "value" in newValue) {
      onChange(newValue.value);
    }
  };

  // Estilos personalizados usando los tokens de diseño existentes
  // Crear una copia de los estilos base y fusionarla con los estilos personalizados si existen
  const baseStyles: StylesConfig<SelectOption, false> = {
    control: (provided, state) => ({
      ...provided,
      minHeight: "38px",
      border: "1px solid var(--color-border)",
      borderRadius: "6px",
      backgroundColor: "var(--color-background)",
      boxShadow: state.isFocused
        ? "0 0 0 2px rgba(var(--color-primary-rgb), 0.2)"
        : "none",
      borderColor: state.isFocused
        ? "var(--color-primary)"
        : "var(--color-border)",
      cursor: "pointer",
      "&:hover": {
        borderColor: state.isFocused
          ? "var(--color-primary)"
          : "var(--color-border-hover)",
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: "8px 12px",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "var(--color-text-primary)",
      fontSize: "14px",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "var(--color-text-muted)",
      fontSize: "14px",
    }),
    input: (provided) => ({
      ...provided,
      color: "var(--color-text-primary)",
      fontSize: "14px",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: "var(--color-text-secondary)",
      padding: "8px",
      "&:hover": {
        color: "var(--color-text-primary)",
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: "6px",
      boxShadow: "var(--shadow-lg)",
      marginTop: "4px",
      zIndex: 9999,
      minHeight: "auto",
      maxHeight: "200px",
    }),
    menuList: (provided) => ({
      ...provided,
      padding: "4px",
      maxHeight: "196px",
      overflowY: "auto",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? "var(--color-surface-hover)"
        : state.isSelected
        ? "rgba(var(--color-primary-rgb), 0.1)"
        : "transparent",
      color: state.isSelected
        ? "var(--color-primary)"
        : "var(--color-text-primary)",
      padding: "8px 12px",
      borderRadius: "4px",
      margin: "2px 0",
      cursor: "pointer",
      fontSize: "14px",
      "&:hover": {
        backgroundColor: state.isSelected
          ? "rgba(var(--color-primary-rgb), 0.15)"
          : "var(--color-surface-hover)",
      },
    }),
    noOptionsMessage: (provided) => ({
      ...provided,
      color: "var(--color-text-muted)",
      fontSize: "14px",
      padding: "8px 12px",
    }),
  };

  return (
    <Select
      className={`custom-select ${className}`}
      classNamePrefix="custom-select"
      options={options}
      value={selectedOption}
      onChange={handleChange}
      placeholder={placeholder}
      isDisabled={isDisabled}
      isSearchable={false}
      styles={{ ...baseStyles, ...customStyles }}
      menuPlacement={menuPlacement}
      menuPortalTarget={menuPortalTarget}
      components={{
        DropdownIndicator,
        IndicatorSeparator,
      }}
    />
  );
};
