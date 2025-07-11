import React, { useRef, useState } from "react";
import type {
  MetricDefinition,
  MetricModifiers,
} from "@/types/metricConfig";
import { ModifiersMetadata } from "@/types/metricConfig";
import { Icon } from "@/common/Icon";
import { useSortable } from "@dnd-kit/sortable";
import { ConfigDropdown } from "@/components/widgets/config/common/ui/ConfigDropdown";
import MetricSelector from "@/components/widgets/config/common/MetricSelector/MetricSelector";
import { useVariableStore } from "@/store/variableStore";
import { Tooltip } from "react-tooltip";

interface MetricItemProps {
  id: string;
  metric: MetricDefinition;
  type: "primary" | "secondary";
  onRemove: (type: "primary" | "secondary") => void;
  onChange: (type: "primary" | "secondary", metric: MetricDefinition) => void;
}

export const MetricItem: React.FC<MetricItemProps> = ({
  id,
  metric,
  type,
  onRemove,
  onChange,
}) => {
  // Estado para expansión
  const [isExpanded, setIsExpanded] = useState(false);

  // Obtener variables actuales del store
  const { variables } = useVariableStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: id,
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  // Función para obtener la etiqueta de un modificador para mostrar en los chips
  const getModifierLabel = (
    modKey: string,
    modValue: string | number | boolean | MetricModifiers[keyof MetricModifiers]
  ): React.ReactNode => {
    if (!modValue) return "";

    const metadata =
      ModifiersMetadata[modKey as keyof typeof ModifiersMetadata];

    // Verificar si es un valor dinámico (variable binding)
    if (
      typeof modValue === "object" &&
      modValue !== null &&
      "type" in modValue &&
      (modValue as { type: string }).type === "variable"
    ) {
      const variableBinding = modValue as { type: "variable"; key: string };
      const resolvedValue = variables[variableBinding.key];

      let text = "Dinámico";
      if (resolvedValue !== undefined && resolvedValue !== null) {
        // Si tenemos metadatos, buscar la etiqueta correspondiente
        if (metadata) {
          const option = metadata.options.find(
            (opt) => opt.value === resolvedValue
          );
          text = option ? option.label : String(resolvedValue);
        } else {
          text = String(resolvedValue);
        }
      }

      return (
        <>
          <Icon name="zap" size={12} />
          {text}
        </>
      );
    }

    if (!metadata) return String(modValue);

    if (
      typeof modValue === "object" &&
      modValue !== null &&
      "type" in modValue &&
      "value" in modValue
    ) {
      // Caso especial para comparison con type a-n
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((modValue as any).type === "a-n") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return `Hace ${(modValue as any).value} años`;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return String((modValue as any).value);
    }

    // Buscar la opción correspondiente
    const option = metadata.options.find((opt) => opt.value === modValue);
    return option ? option.label : String(modValue);
  };

  // Función para obtener la etiqueta del indicador para mostrar en los chips
  const getIndicatorLabel = (): React.ReactNode => {
    // Si es dinámico, resolver con las variables actuales
    const isDynamic =
      typeof metric.indicator === "object" &&
      metric.indicator !== null &&
      "type" in metric.indicator &&
      metric.indicator.type === "variable";

    if (isDynamic) {
      const variableBinding = metric.indicator as {
        type: "variable";
        key: string;
      };
      const resolvedIndicator = variables[variableBinding.key];
      const text = resolvedIndicator ? String(resolvedIndicator) : "Dinámico";

      return (
        <>
          <Icon name="zap" size={12} />
          {text}
        </>
      );
    }

    // Si es estático, buscar en los metadatos de indicadores
    const text =
      typeof metric.indicator === "string"
        ? metric.indicator
        : String(metric.indicator);

    return text;
  };

  // Función para verificar si el indicador es dinámico
  const isIndicatorDynamic = (): boolean => {
    return (
      typeof metric.indicator === "object" &&
      metric.indicator !== null &&
      "type" in metric.indicator &&
      metric.indicator.type === "variable"
    );
  };

  // Manejar clic en el botón de expandir/contraer
  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(type);
  };

  // Dropdown reference for external control
  const dropdownRef = useRef<((isOpen: boolean) => void) | null>(null);

  // Function to close dropdown
  const handleCloseDropdown = () => {
    dropdownRef.current?.(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`metric-item column-item config-item ${
        isDragging ? "column-item--dragging config-item--dragging" : ""
      }`}
    >
      <div className="metric-item__content column-item__content config-item__content">
        {/* Drag handle reutilizando clases existentes */}
        <div
          {...attributes}
          {...listeners}
          className="column-item__grip-container config-item__grip-container"
        >
          <Icon
            name="grip-vertical"
            size={14}
            className="column-item__grip config-item__grip"
          />
        </div>

        {/* Contenido principal */}
        <div className="column-item__main config-item__main">
          <div className="metric-item__info-container">
            <div className="column-item__name config-item__name">
              {metric.title}
            </div>
            {/* Badge específico para métricas debajo del título */}
            <div className="metric-item__badge-container">
              <span
                className={`metric-item__badge metric-item__badge--${type}`}
              >
                {type === "primary" ? "PRIMARIA" : "SECUNDARIA"}
              </span>
            </div>
          </div>
        </div>

        {/* Acciones reutilizando clases existentes */}
        <button
          onClick={handleToggleExpand}
          className="column-item__expand"
          data-tooltip-id={`metric-expand-tooltip-${id}`}
          data-tooltip-content={
            isExpanded ? "Contraer detalles" : "Expandir detalles"
          }
        >
          <Icon
            name={isExpanded ? "chevrons-down-up" : "chevrons-up-down"}
            size={14}
          />
        </button>

        <ConfigDropdown
          className="metrics-dropdown"
          setIsOpenRef={dropdownRef}
          offsetDistance={8}
          triggerElement={({ ref, onClick, referenceProps }) => (
            <button
              ref={ref}
              onClick={onClick}
              className="column-item__visibility"
              data-tooltip-id={`metric-edit-tooltip-${id}`}
              data-tooltip-content="Editar métrica"
              {...referenceProps}
            >
              <Icon name="edit" size={14} />
            </button>
          )}
        >
          <MetricSelector
            mode="single"
            selectedMetric={metric}
            onSelectMetric={(selectedMetric) => {
              onChange(type, selectedMetric);
              handleCloseDropdown();
            }}
            onClose={handleCloseDropdown}
          />
        </ConfigDropdown>

        <button
          onClick={handleRemove}
          className="column-item__remove config-item__remove"
          data-tooltip-id={`metric-remove-tooltip-${id}`}
          data-tooltip-content="Eliminar métrica"
        >
          <Icon name="trash" size={14} />
        </button>

        {/* Tooltips */}
        <Tooltip id={`metric-expand-tooltip-${id}`} place="top" />
        <Tooltip id={`metric-edit-tooltip-${id}`} place="top" />
        <Tooltip id={`metric-remove-tooltip-${id}`} place="top" />
      </div>

      {/* Contenedor de chips expandible */}
      <div
        className={`column-item__chips-container ${
          isExpanded ? "column-item__chips-container--expanded" : ""
        }`}
      >
        <div className="column-item__chips-content">
          <div className="metric-selector__chip-modifiers">
            {/* Chip del indicador (siempre visible) */}
            <span
              className={`metric-selector__chip-tag metric-selector__chip-tag--indicator ${
                isIndicatorDynamic() ? "metric-selector__chip-tag--dynamic" : ""
              }`}
              key={`${metric.id}-indicator`}
            >
              {getIndicatorLabel()}
            </span>

            {/* Chips de modificadores */}
            {Object.entries(metric.modifiers).map(([modKey, modValue]) =>
              modValue ? (
                <span
                  className={`metric-selector__chip-tag metric-selector__chip-tag--${modKey} ${
                    typeof modValue === "object" &&
                    modValue !== null &&
                    "type" in modValue &&
                    (modValue as { type: string }).type === "variable"
                      ? "metric-selector__chip-tag--dynamic"
                      : ""
                  }`}
                  key={`${metric.id}-${modKey}`}
                >
                  {getModifierLabel(modKey, modValue)}
                </span>
              ) : null
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
