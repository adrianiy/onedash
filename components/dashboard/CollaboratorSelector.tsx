import React, { useState, useEffect } from "react";
import Select, {
  components,
  MenuProps,
  OptionProps,
  MultiValueProps,
  MultiValueRemoveProps,
} from "react-select";
import { Icon } from "@/common/Icon";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface CollaboratorSelectorProps {
  collaborators: User[];
  onCollaboratorsChange: (collaborators: User[]) => void;
  disabled?: boolean;
}

// Interfaz para opciones de react-select
interface UserOption {
  value: string;
  label: string;
  user: User;
}

export const CollaboratorSelector: React.FC<CollaboratorSelectorProps> = ({
  collaborators,
  onCollaboratorsChange,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [options, setOptions] = useState<UserOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Convertir colaboradores a opciones para react-select
  const selectedOptions = collaborators.map((user) => ({
    value: user._id,
    label: user.name,
    user,
  }));

  // Buscar usuarios cuando cambia el input
  useEffect(() => {
    const searchUsers = async () => {
      if (inputValue.trim().length < 2) {
        setOptions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/users/search?q=${encodeURIComponent(inputValue.trim())}`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Filtrar colaboradores ya seleccionados
            const filteredResults = data.data.filter(
              (user: User) =>
                !collaborators.some(
                  (collaborator) => collaborator._id === user._id
                )
            );

            // Convertir a opciones de react-select
            const newOptions = filteredResults.map((user: User) => ({
              value: user._id,
              label: user.name,
              user,
            }));

            setOptions(newOptions);
          }
        }
      } catch (error) {
        console.error("Error searching users:", error);
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [inputValue, collaborators]);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
  };

  const handleChange = (selected: readonly UserOption[]) => {
    if (!selected) {
      onCollaboratorsChange([]);
      return;
    }

    // Verificar si se está añadiendo un nuevo colaborador
    const previousIds = collaborators.map((user) => user._id);
    const newSelected = selected.filter(
      (option) => !previousIds.includes(option.value)
    );

    // Convertir las opciones seleccionadas de vuelta a usuarios
    const selectedUsers = selected.map((option) => option.user);
    onCollaboratorsChange(selectedUsers);

    // Si se añadió al menos un nuevo colaborador, disparar el evento
    if (newSelected.length > 0) {
      const event = new CustomEvent("dashboard-collaborator-added");
      document.dispatchEvent(event);
    }
  };

  // Función para eliminar un colaborador
  const handleRemoveCollaborator = (userId: string) => {
    onCollaboratorsChange(
      collaborators.filter((collaborator) => collaborator._id !== userId)
    );
  };

  // Componente personalizado para la opción en el menú
  const Option = (props: OptionProps<UserOption, true>) => {
    const { data } = props;
    return (
      <components.Option {...props}>
        <div className="collaborator-selector__user-info">
          <span className="collaborator-selector__user-name">
            {data.user.name}
          </span>
          <span className="collaborator-selector__user-email">
            {data.user.email}
          </span>
        </div>
      </components.Option>
    );
  };

  // Componente personalizado para el botón de eliminar en los chips
  const MultiValueRemove = (props: MultiValueRemoveProps<UserOption, true>) => {
    const { data } = props;

    // Usar nuestra propia función de eliminación
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      console.log("Remove button clicked for:", data.user.name);
      // Prevenir comportamiento por defecto y propagación
      e.preventDefault();
      e.stopPropagation();

      // Eliminar el colaborador
      handleRemoveCollaborator(data.user._id);
    };

    return (
      <button
        type="button"
        className="collaborator-selector__chip-remove"
        onMouseDown={handleClick}
        title="Eliminar colaborador"
        aria-label={`Eliminar ${data.user.name}`}
      >
        <Icon name="x" size={16} />
      </button>
    );
  };

  // Componente personalizado para los chips (MultiValue)
  const MultiValue = (props: MultiValueProps<UserOption, true>) => {
    const { data } = props;

    return (
      <div className="collaborator-selector__chip">
        <span className="collaborator-selector__chip-name">
          {data.user.name}
        </span>
        <MultiValueRemove {...props} />
      </div>
    );
  };

  // Componente personalizado para el menú
  const Menu = (props: MenuProps<UserOption, true>) => {
    if (options.length === 0 && !isLoading && inputValue.trim().length >= 2) {
      return (
        <components.Menu {...props}>
          <div className="collaborator-selector__no-results">
            No se encontraron usuarios
          </div>
        </components.Menu>
      );
    }
    return <components.Menu {...props} />;
  };

  // Componente personalizado para el indicador de carga
  const LoadingIndicator = () => {
    return isLoading ? (
      <div className="collaborator-selector__loading">
        <Icon name="loader" size={16} className="animate-spin" />
      </div>
    ) : null;
  };

  // Componente personalizado para eliminar el chevron
  const DropdownIndicator = () => {
    return null; // No mostrar nada
  };

  return (
    <div className="collaborator-selector">
      {/* Input de búsqueda con react-select y chips integrados */}
      <div className="collaborator-selector__input-container">
        <Select
          className="collaborator-selector"
          classNamePrefix="react-select"
          inputValue={inputValue}
          onInputChange={handleInputChange}
          onChange={(selected) =>
            handleChange(selected as readonly UserOption[])
          }
          options={options}
          placeholder="Buscar usuarios por nombre o email..."
          isDisabled={disabled}
          isLoading={isLoading}
          menuIsOpen={menuIsOpen}
          onMenuOpen={() => setMenuIsOpen(true)}
          onMenuClose={() => setMenuIsOpen(false)}
          menuPortalTarget={document.body}
          menuPosition="fixed"
          components={{
            Option,
            Menu,
            LoadingIndicator,
            MultiValue,
            MultiValueRemove,
            DropdownIndicator,
          }}
          styles={{
            control: (base) => ({
              ...base,
              minHeight: "40px",
              boxShadow: "none",
              padding: "2px 0",
            }),
            multiValue: (base) => ({
              ...base,
              margin: "5px", // Aumentar el margen entre chips
            }),
            valueContainer: (base) => ({
              ...base,
              padding: "4px 8px", // Aumentar el padding vertical
              flexWrap: "wrap",
              gap: "2px", // Añadir espacio adicional entre elementos
            }),
            // Eliminar el borde del contenedor de indicadores
            indicatorSeparator: (base) => {
              return {
                ...base,
                display: "none", // Ocultar completamente el separador
              };
            },
            // Asegurar que los botones de eliminar sean clickeables
            multiValueRemove: (base) => {
              return {
                ...base,
                zIndex: 2,
                position: "relative",
              };
            },
            // Estilos para el portal del menú
            menuPortal: (base) => ({
              ...base,
              zIndex: 9999, // Asegurar que esté por encima de todos los elementos
            }),
          }}
          noOptionsMessage={() => null}
          value={selectedOptions}
          isMulti={true}
          closeMenuOnSelect={false}
          hideSelectedOptions={true}
        />
      </div>
    </div>
  );
};
