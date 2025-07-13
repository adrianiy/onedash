import React, { useState, useEffect } from "react";
import { Icon } from "@/common/Icon";
import { useGridStore } from "@/store/gridStore";
import { useVariableStore } from "@/store/variableStore";
import type { MetricWidget, WidgetEvent } from "@/types/widget";
import type { MetricDefinition } from "@/types/metricConfig";
import { ModifiersMetadata } from "@/types/metricConfig";

interface EventsConfigProps {
  widget: MetricWidget;
}

interface VariableMapping {
  id: string;
  label: string;
  value: unknown;
  variableId: string;
  isSelected: boolean;
}

export const EventsConfig: React.FC<EventsConfigProps> = ({ widget }) => {
  const updateWidget = useGridStore((state) => state.updateWidget);

  const [isClickEventEnabled, setIsClickEventEnabled] = useState(false);
  const [variableMappings, setVariableMappings] = useState<VariableMapping[]>(
    []
  );
  const [isInitialized, setIsInitialized] = useState(false);

  // Helper function to check if a value is dynamic (variable binding)
  const isDynamicValue = (value: unknown): boolean => {
    return (
      typeof value === "object" &&
      value !== null &&
      "type" in value &&
      (value as { type: string }).type === "variable"
    );
  };

  // Helper function to get static mappings from metric
  const getStaticMappings = (metric: MetricDefinition): VariableMapping[] => {
    const mappings: VariableMapping[] = [];

    // Check indicator - only add if it's static
    if (!isDynamicValue(metric.indicator)) {
      mappings.push({
        id: "primary_indicator",
        label: "Indicador Principal",
        value: metric.indicator,
        variableId: "indicator",
        isSelected: false,
      });
    }

    // Check each modifier - only add if it's static and not a data transformation
    Object.entries(metric.modifiers).forEach(([key, value]) => {
      if (
        value &&
        !isDynamicValue(value) &&
        key !== "calculation" &&
        key !== "comparison"
      ) {
        // Get label from metadata or use key as fallback
        const label = ModifiersMetadata[key]?.name || key;

        mappings.push({
          id: `primary_${key}`,
          label: label,
          value: value,
          variableId: key,
          isSelected: false,
        });
      }
    });

    return mappings;
  };

  // Extract available static variables from widget metrics (only when primary metric changes)
  useEffect(() => {
    let mappings: VariableMapping[] = [];

    // Primary metric variables - only static ones
    if (widget.config.primaryMetric) {
      mappings = getStaticMappings(widget.config.primaryMetric);
    }

    setVariableMappings(mappings);
    setIsInitialized(false);
  }, [widget.config.primaryMetric]);

  // Initialize click event state (separate effect to avoid circular dependency)
  useEffect(() => {
    if (variableMappings.length > 0 && !isInitialized) {
      const clickEvent = widget.events?.find((e) => e.trigger === "click");
      if (clickEvent) {
        setIsClickEventEnabled(true);
        // Mark variables as selected if they exist in the event
        const keys = clickEvent.setVariables
          ? Object.keys(clickEvent.setVariables)
          : [];
        setVariableMappings((prev) =>
          prev.map((mapping) => ({
            ...mapping,
            isSelected: keys.includes(mapping.variableId),
          }))
        );
      }
      setIsInitialized(true);
    }
  }, [variableMappings, widget.events, isInitialized]);

  const handleToggleClickEvent = (enabled: boolean) => {
    setIsClickEventEnabled(enabled);

    if (!enabled) {
      // Remove click event
      const updatedEvents = (widget.events || []).filter(
        (e) => e.trigger !== "click"
      );
      updateWidget(widget._id, { events: updatedEvents });
    }
  };

  const handleToggleVariable = (mappingId: string) => {
    setVariableMappings((prev) =>
      prev.map((mapping) => {
        if (mapping.id === mappingId) {
          const newMapping = { ...mapping, isSelected: !mapping.isSelected };

          console.log("newMapping", newMapping);

          // **NUEVA LÓGICA: Establecer defaults cuando se selecciona una variable**
          if (newMapping.isSelected) {
            const { getVariable } = useVariableStore.getState();
            const { updateDashboard } = useGridStore.getState();
            const currentValue = getVariable(mapping.variableId);

            // Si no hay valor actual en el store, establecer como default del dashboard
            if (currentValue === null || currentValue === undefined) {
              updateDashboard({ [mapping.variableId]: mapping.value });
            }
          }

          return newMapping;
        }
        return mapping;
      })
    );
  };

  const handleSaveEvent = React.useCallback(() => {
    if (!isClickEventEnabled) return;

    const selectedMappings = variableMappings.filter((m) => m.isSelected);
    const setVariables: Record<string, unknown> = {};

    selectedMappings.forEach((mapping) => {
      setVariables[mapping.variableId] = mapping.value;
    });

    const clickEvent: WidgetEvent = {
      trigger: "click",
      setVariables,
    };

    const updatedEvents = (widget.events || []).filter(
      (e) => e.trigger !== "click"
    );
    updatedEvents.push(clickEvent);

    updateWidget(widget._id, { events: updatedEvents });
  }, [isClickEventEnabled, variableMappings, updateWidget, widget._id]);

  // Auto-save when variables change
  useEffect(() => {
    if (isClickEventEnabled) {
      handleSaveEvent();
    }
  }, [isClickEventEnabled, handleSaveEvent]);

  const getVariableDisplayName = (variableId: string) => {
    // Mapear IDs técnicos a nombres de negocio
    const businessNames: Record<string, string> = {
      indicator: "Indicador Seleccionado",
      saleType: "Filtro de Tipo de Venta",
      scope: "Filtro de Alcance",
      timeframe: "Filtro de Período",
    };

    return businessNames[variableId] || variableId;
  };

  const getValueLabel = (value: unknown) => {
    if (typeof value === "string") {
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
    return String(value);
  };

  return (
    <div className="viz-config">
      {/* Sección de eventos con toggle principal */}
      <div
        className="viz-section-header"
        onClick={() => setIsClickEventEnabled(!isClickEventEnabled)}
      >
        <div className="viz-control-with-label">
          <Icon name="zap" size={16} />
          <h4 className="viz-section-title">Filtrar al hacer clic</h4>
        </div>
        <input
          type="checkbox"
          checked={isClickEventEnabled}
          onChange={(e) => handleToggleClickEvent(e.target.checked)}
          className="viz-control-checkbox"
        />
      </div>

      {isClickEventEnabled && variableMappings.length > 0 && (
        <div className="viz-events-variables">
          <div className="viz-events-info">
            <Icon name="info" size={14} />
            <span>
              Selecciona las métricas que aplicarán cambios en el dashboard
            </span>
          </div>

          <div className="viz-events-badges">
            {variableMappings.map((mapping) => (
              <span
                key={mapping.id}
                className={`metric-selector__chip-tag metric-selector__chip-tag--indicator viz-events-badge ${
                  mapping.isSelected ? "viz-events-badge--selected" : ""
                }`}
                onClick={() => handleToggleVariable(mapping.id)}
                title={mapping.isSelected ? "Desactivar" : "Activar"}
              >
                <span className="viz-events-badge-header">{mapping.label}</span>
                <span className="viz-events-badge-value">
                  {getValueLabel(mapping.value)}
                </span>
              </span>
            ))}
          </div>

          {variableMappings.some((m) => m.isSelected) && (
            <div className="viz-events-preview">
              <h4 className="viz-section-title">Vista previa</h4>
              <div className="viz-events-preview-list">
                {variableMappings
                  .filter((m) => m.isSelected)
                  .map((mapping) => (
                    <div key={mapping.id} className="viz-events-preview-item">
                      <code className="viz-events-preview-variable">
                        {getVariableDisplayName(mapping.variableId)}
                      </code>
                      <span className="viz-events-preview-arrow">→</span>
                      <span className="viz-events-preview-value">
                        {String(mapping.value).charAt(0).toUpperCase() +
                          String(mapping.value).slice(1)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!isClickEventEnabled && variableMappings.length === 0 && (
        <div className="viz-empty-formats">
          <Icon name="info" size={16} />
          Configura métricas primero para habilitar eventos
        </div>
      )}
    </div>
  );
};
