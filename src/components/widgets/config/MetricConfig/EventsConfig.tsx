import React, { useState, useEffect } from "react";
import { Icon } from "../../../common/Icon";
import { useWidgetStore } from "../../../../store/widgetStore";
import { useVariableStore } from "../../../../store/variableStore";
import type { MetricWidget } from "../../../../types/widget";
import type { WidgetEvent } from "../../../../types/variables";
import { generateId } from "../../../../utils/helpers";

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
  const updateWidget = useWidgetStore((state) => state.updateWidget);
  const variableDefinitions = useVariableStore((state) => state.definitions);

  const [isClickEventEnabled, setIsClickEventEnabled] = useState(false);
  const [variableMappings, setVariableMappings] = useState<VariableMapping[]>(
    []
  );
  const [isInitialized, setIsInitialized] = useState(false);

  // Extract available variables from widget metrics (only when primary metric changes)
  useEffect(() => {
    const mappings: VariableMapping[] = [];

    // Primary metric variables
    if (widget.config.primaryMetric) {
      const metric = widget.config.primaryMetric;

      mappings.push({
        id: "primary_indicator",
        label: "Indicador Principal",
        value: metric.indicator,
        variableId: "selected_indicator",
        isSelected: false,
      });

      if (metric.modifiers.saleType) {
        mappings.push({
          id: "primary_sale_type",
          label: "Tipo de Venta",
          value: metric.modifiers.saleType,
          variableId: "sale_type_filter",
          isSelected: false,
        });
      }

      if (metric.modifiers.scope) {
        mappings.push({
          id: "primary_scope",
          label: "Alcance",
          value: metric.modifiers.scope,
          variableId: "scope_filter",
          isSelected: false,
        });
      }

      if (metric.modifiers.timeframe) {
        mappings.push({
          id: "primary_timeframe",
          label: "Período",
          value: metric.modifiers.timeframe,
          variableId: "timeframe_filter",
          isSelected: false,
        });
      }

      // Note: Only certain modifiers can be used as filterable variables
      // comparison and calculation are excluded as they are data transformations, not filterable variables
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
        setVariableMappings((prev) =>
          prev.map((mapping) => ({
            ...mapping,
            isSelected: Object.keys(clickEvent.setVariables).includes(
              mapping.variableId
            ),
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
      updateWidget(widget.id, { events: updatedEvents });
    }
  };

  const handleToggleVariable = (mappingId: string) => {
    setVariableMappings((prev) =>
      prev.map((mapping) =>
        mapping.id === mappingId
          ? { ...mapping, isSelected: !mapping.isSelected }
          : mapping
      )
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
      id: generateId(),
      trigger: "click",
      setVariables,
    };

    const updatedEvents = (widget.events || []).filter(
      (e) => e.trigger !== "click"
    );
    updatedEvents.push(clickEvent);

    updateWidget(widget.id, { events: updatedEvents });
  }, [isClickEventEnabled, variableMappings, updateWidget, widget.id]);

  // Auto-save when variables change
  useEffect(() => {
    if (isClickEventEnabled) {
      handleSaveEvent();
    }
  }, [isClickEventEnabled, handleSaveEvent]);

  const getVariableDisplayName = (variableId: string) => {
    // Mapear IDs técnicos a nombres de negocio
    const businessNames: Record<string, string> = {
      selected_indicator: "Indicador Seleccionado",
      sale_type_filter: "Filtro de Tipo de Venta",
      scope_filter: "Filtro de Alcance",
      timeframe_filter: "Filtro de Período",
      comparison_filter: "Filtro de Comparación",
    };

    return (
      businessNames[variableId] ||
      variableDefinitions[variableId]?.name ||
      variableId
    );
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
      <div className="viz-section-header">
        <div className="viz-control-with-label">
          <Icon name="zap" size={16} />
          <span className="viz-control-label">Filtrar al hacer clic</span>
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
                className={`metric-selector__chip-tag metric-selector__chip-tag--${
                  mapping.id.split("_")[1] || "default"
                } viz-events-badge ${
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
