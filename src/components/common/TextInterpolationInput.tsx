import React, { useState, useRef, useEffect } from "react";
import { Tooltip } from "react-tooltip";
import { Icon } from "./Icon";
import { ConfigDropdown } from "../widgets/common/ConfigDropdown";
import type { MetricDefinition } from "../../types/metricConfig";
import {
  interpolateText,
  getAvailableVariables,
  filterVariables,
  insertVariableAtPosition,
  findInsertPosition,
} from "../../utils/textInterpolation";

interface TextInterpolationInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  variables: Record<string, unknown>;
  metric?: MetricDefinition;
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export const TextInterpolationInput: React.FC<TextInterpolationInputProps> = ({
  value,
  onChange,
  onKeyDown,
  onBlur,
  variables,
  metric,
  className = "",
  placeholder = "",
  autoFocus = false,
}) => {
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteSearch, setAutocompleteSearch] = useState("");
  const [autocompletePosition, setAutocompletePosition] = useState<{
    startPos: number;
    endPos: number;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteDropdownRef = useRef<((isOpen: boolean) => void) | null>(
    null
  );

  // Obtener variables disponibles
  const availableVariables = getAvailableVariables(variables, metric);

  // Variables comunes para el menú contextual
  const commonVariables = availableVariables.filter((v) =>
    ["indicator", "saleType", "scope", "timeframe"].includes(v.key)
  );

  // Variables filtradas para autocompletado
  const filteredVariables = filterVariables(
    availableVariables,
    autocompleteSearch
  );

  // Texto interpolado para vista previa
  const interpolatedText = interpolateText(value, variables, metric);
  const hasInterpolation = interpolatedText !== value;

  // Manejar cambios en el input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart || 0;

    onChange(newValue);

    // Verificar si se activó el autocompletado con @
    const insertPos = findInsertPosition(newValue, cursorPosition);
    if (insertPos) {
      setAutocompletePosition({
        startPos: insertPos.startPos,
        endPos: insertPos.endPos,
      });
      setAutocompleteSearch(insertPos.searchText);
      setShowAutocomplete(true);
    } else {
      setShowAutocomplete(false);
      setAutocompletePosition(null);
    }
  };

  // Manejar teclas especiales
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showAutocomplete) {
      if (e.key === "Escape") {
        setShowAutocomplete(false);
        setAutocompletePosition(null);
        return;
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        // TODO: Implementar navegación por las opciones
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        if (filteredVariables.length > 0) {
          insertVariable(filteredVariables[0].key, true);
        }
        return;
      }
    }

    onKeyDown?.(e);
  };

  // Insertar variable desde menú contextual o autocompletado
  const insertVariable = (variableKey: string, fromAutocomplete = false) => {
    if (!inputRef.current) return;

    let newText: string;
    let newPosition: number;

    if (fromAutocomplete && autocompletePosition) {
      // Reemplazar el texto del autocompletado
      const before = value.substring(0, autocompletePosition.startPos);
      const after = value.substring(autocompletePosition.endPos);
      const variableText = `@${variableKey}`;
      newText = before + variableText + after;
      newPosition = autocompletePosition.startPos + variableText.length;
    } else {
      // Insertar en la posición actual del cursor
      const cursorPosition = inputRef.current.selectionStart || 0;
      const result = insertVariableAtPosition(
        value,
        variableKey,
        cursorPosition
      );
      newText = result.newText;
      newPosition = result.newPosition;
    }

    onChange(newText);
    setShowAutocomplete(false);
    setAutocompletePosition(null);

    // Restaurar el foco y posición del cursor
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  // Controlar el dropdown de autocompletado
  useEffect(() => {
    if (autocompleteDropdownRef.current) {
      autocompleteDropdownRef.current(showAutocomplete);
    }
  }, [showAutocomplete]);

  // Auto-focus si se especifica
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [autoFocus]);

  return (
    <>
      <div className="text-interpolation-input">
        <div className="text-interpolation-input__container">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={onBlur}
            className={`text-interpolation-input__field ${className}`}
            placeholder={placeholder}
          />

          {/* Dropdown de variables */}
          <ConfigDropdown
            className="variables-dropdown"
            placement="bottom-end"
            offsetDistance={8}
            triggerElement={({ ref, onClick, referenceProps }) => (
              <button
                ref={ref}
                onClick={onClick}
                className="text-interpolation-input__menu-button"
                data-tooltip-id="variables-tooltip"
                {...referenceProps}
              >
                <Icon name="zap" size={14} />
              </button>
            )}
          >
            <div className="text-interpolation-input__menu">
              <div className="text-interpolation-input__menu-header">
                Variables dinámicas
              </div>
              {commonVariables.length > 0 ? (
                commonVariables.map((variable) => (
                  <button
                    key={variable.key}
                    className="text-interpolation-input__menu-item"
                    onClick={() => insertVariable(variable.key)}
                  >
                    <span className="text-interpolation-input__menu-item-label">
                      {variable.label}
                    </span>
                    {variable.description && (
                      <span className="text-interpolation-input__menu-item-description">
                        {variable.description}
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <div className="text-interpolation-input__menu-empty">
                  No hay variables dinámicas disponibles
                </div>
              )}
              <div className="text-interpolation-input__menu-footer">
                Escribe @ seguido del nombre para más opciones
              </div>
            </div>
          </ConfigDropdown>

          {/* Autocompletado como Dropdown */}
          <ConfigDropdown
            className="autocomplete-dropdown"
            placement="bottom"
            offsetDistance={4}
            setIsOpenRef={autocompleteDropdownRef}
            usePortal={true}
            triggerElement={({ ref }) => (
              <div
                ref={ref}
                style={{
                  position: "absolute",
                  left: autocompletePosition
                    ? `${autocompletePosition.startPos * 8}px`
                    : 0,
                  top: "100%",
                  width: 1,
                  height: 1,
                  visibility: "hidden",
                }}
              />
            )}
          >
            <div className="text-interpolation-input__autocomplete">
              {filteredVariables.length > 0 ? (
                filteredVariables.slice(0, 8).map((variable) => (
                  <button
                    key={variable.key}
                    className="text-interpolation-input__autocomplete-item"
                    onMouseDown={() => insertVariable(variable.key, true)}
                  >
                    <span className="text-interpolation-input__autocomplete-label">
                      {variable.label}
                    </span>
                    {variable.description && (
                      <span className="text-interpolation-input__autocomplete-description">
                        {variable.description}
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <div className="text-interpolation-input__autocomplete-empty">
                  No se encontraron variables que coincidan con "
                  {autocompleteSearch}"
                </div>
              )}
            </div>
          </ConfigDropdown>
        </div>

        {/* Vista previa de interpolación */}
        {hasInterpolation && (
          <div className="text-interpolation-input__preview">
            <div className="text-interpolation-input__preview-label">
              Vista previa:
            </div>
            <div className="text-interpolation-input__preview-text">
              {interpolatedText}
            </div>
          </div>
        )}
      </div>

      {/* Tooltip */}
      <Tooltip
        id="variables-tooltip"
        content="Variables dinámicas (@)"
        place="left"
        positionStrategy="fixed"
        globalCloseEvents={{
          escape: true,
          scroll: true,
          resize: true,
          clickOutsideAnchor: true,
        }}
        style={{
          zIndex: 9999,
        }}
      />
    </>
  );
};
