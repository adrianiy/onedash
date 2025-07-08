import React from "react";
import Select, { components } from "react-select";
import type {
  StylesConfig,
  MultiValue,
  DropdownIndicatorProps,
  ClearIndicatorProps,
  ValueContainerProps,
} from "react-select";
import { Icon } from "./Icon";

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomMultiSelectProps {
  options: SelectOption[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  isDisabled?: boolean;
  className?: string;
  isActive?: boolean;
}

// Componente custom para el dropdown indicator (chevron)
const DropdownIndicator = (props: DropdownIndicatorProps<SelectOption>) => {
  const { hasValue } = props;

  // Si hay valores seleccionados, no mostrar el chevron
  if (hasValue) {
    return null;
  }

  return (
    <components.DropdownIndicator {...props}>
      <Icon name="chevron-down" size={14} />
    </components.DropdownIndicator>
  );
};

// Componente custom para quitar el separador
const IndicatorSeparator = () => null;

// Componente custom para el botón de limpiar todo
const ClearIndicator = (props: ClearIndicatorProps<SelectOption>) => {
  const { hasValue } = props;

  // Solo mostrar el indicador de limpieza cuando hay valores seleccionados
  if (!hasValue) {
    return null;
  }

  return (
    <components.ClearIndicator {...props}>
      <Icon name="x" size={14} className="custom-multiselect__reset-icon" />
    </components.ClearIndicator>
  );
};

// Componente custom para el contenedor de valores (mostrar contador en lugar de chips)
const ValueContainer = (props: ValueContainerProps<SelectOption>) => {
  const { children, getValue, selectProps } = props;
  const selectedValues = getValue();
  const placeholder = selectProps.placeholder;

  // Si no hay valores seleccionados, usar el comportamiento por defecto (placeholder)
  if (selectedValues.length === 0) {
    return (
      <components.ValueContainer {...props}>
        {children}
      </components.ValueContainer>
    );
  }

  // Si hay una sola selección, mostrar solo el nombre
  if (selectedValues.length === 1) {
    return (
      <components.ValueContainer {...props}>
        <span style={{ color: "var(--color-text-primary)", fontSize: "14px" }}>
          {selectedValues[0].label}
        </span>
        {children}
      </components.ValueContainer>
    );
  }

  // Si hay múltiples selecciones, mostrar el placeholder con contador
  return (
    <components.ValueContainer {...props}>
      <span style={{ color: "var(--color-text-primary)", fontSize: "14px" }}>
        {placeholder} ({selectedValues.length})
      </span>
      {children}
    </components.ValueContainer>
  );
};

export const CustomMultiSelect: React.FC<CustomMultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Seleccionar...",
  isDisabled = false,
  className = "",
  isActive = false,
}) => {
  const selectedOptions = options.filter((opt) => value.includes(opt.value));

  const handleChange = (newValue: MultiValue<SelectOption>) => {
    const values = newValue ? newValue.map((option) => option.value) : [];
    onChange(values);
  };

  // Estilos personalizados usando los tokens de diseño existentes
  const customStyles: StylesConfig<SelectOption, true> = {
    control: (provided, state) => ({
      ...provided,
      minHeight: "38px",
      border: "1px solid var(--color-border)",
      borderRadius: "6px",
      backgroundColor: "var(--color-background)",
      boxShadow: "none", // Eliminamos todos los box-shadow
      borderColor: state.isFocused
        ? "var(--color-primary)"
        : state.hasValue
        ? "rgba(var(--color-primary-rgb), 0.3)"
        : "var(--color-border)",
      cursor: "pointer",
      "&:hover": {
        borderColor: state.isFocused
          ? "var(--color-primary)"
          : state.hasValue
          ? "rgba(var(--color-primary-rgb), 0.5)"
          : "var(--color-border-hover)",
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: "6px 12px",
      gap: "4px",
      flexWrap: "nowrap",
      overflow: "hidden",
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "rgba(var(--color-primary-rgb), 0.1)",
      border: "1px solid rgba(var(--color-primary-rgb), 0.2)",
      borderRadius: "4px",
      margin: "0 2px 0 0",
      maxWidth: "120px",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "var(--color-primary)",
      fontSize: "12px",
      padding: "2px 6px",
      fontWeight: "500",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "var(--color-primary)",
      cursor: "pointer",
      padding: "2px",
      borderRadius: "2px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      "&:hover": {
        backgroundColor: "rgba(var(--color-primary-rgb), 0.2)",
        color: "var(--color-primary)",
      },
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
    clearIndicator: (provided) => ({
      ...provided,
      color: "var(--color-text-secondary)",
      cursor: "pointer",
      padding: "6px",
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
      position: "relative",
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
    <div className={`custom-multiselect ${className}`}>
      <Select
        className={`custom-multiselect__select ${
          isActive ? "filter-bar__filter-control--active" : ""
        }`}
        classNamePrefix="custom-multiselect"
        options={options}
        value={selectedOptions}
        onChange={handleChange}
        placeholder={placeholder}
        isDisabled={isDisabled}
        isSearchable={false}
        isMulti
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        styles={customStyles}
        components={{
          DropdownIndicator,
          IndicatorSeparator,
          ValueContainer,
          ClearIndicator,
          MultiValue: () => null, // Ocultar los chips individuales
          MultiValueRemove: () => null, // Ocultar los botones de eliminar individual
        }}
      />
    </div>
  );
};
