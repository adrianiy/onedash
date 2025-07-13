import { Icon } from "@/common/Icon";
import { WidgetFiltersConfig } from "@/config/common/controls/WidgetFiltersConfig";
import MetricSelector from "@/config/common/MetricSelector/MetricSelector";
import { ConfigDropdown } from "@/config/common/ui/ConfigDropdown";
import { EmptyPlaceholder } from "@/config/common/ui/EmptyPlaceholder";
import { useGridStore } from "@/store/gridStore";
import type { MetricDefinition } from "@/types/metricConfig";
import type { MetricWidget } from "@/types/widget";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import React, { useRef, useState } from "react";
import { MetricItem } from "./data/MetricItem";

interface DataConfigProps {
  widget: MetricWidget;
}

export const DataConfig: React.FC<DataConfigProps> = ({ widget }) => {
  const { updateWidget } = useGridStore();
  const setDropdownOpenRef = useRef<((isOpen: boolean) => void) | null>(null);
  const [editingType, setEditingType] = useState<
    "primary" | "secondary" | null
  >(null);

  // Obtener métricas del widget
  const primaryMetric = widget.config.primaryMetric;
  const secondaryMetric = widget.config.secondaryMetric;
  const metricsCount = (primaryMetric ? 1 : 0) + (secondaryMetric ? 1 : 0);
  const hasMaxMetrics = metricsCount >= 2;

  // Configuración de sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Manejar selección de métrica desde el selector
  const handleMetricSelect = (metric: MetricDefinition) => {
    if (editingType) {
      // Editando una métrica existente
      updateWidget(widget._id, {
        config: {
          ...widget.config,
          [`${editingType}Metric`]: metric,
        },
      });
    } else {
      // Añadiendo nueva métrica
      if (!primaryMetric) {
        // Asignar como primaria si no existe
        updateWidget(widget._id, {
          config: {
            ...widget.config,
            primaryMetric: metric,
          },
        });
      } else if (!secondaryMetric) {
        // Asignar como secundaria si primaria existe
        updateWidget(widget._id, {
          config: {
            ...widget.config,
            secondaryMetric: metric,
          },
        });
      }
    }

    // Cerrar dropdown y limpiar estado
    setEditingType(null);
    if (setDropdownOpenRef.current) {
      setDropdownOpenRef.current(false);
    }
  };

  // Manejar eliminación de métrica
  const handleRemoveMetric = (type: "primary" | "secondary") => {
    if (type === "primary") {
      // Si eliminamos primaria y hay secundaria, promover secundaria a primaria
      updateWidget(widget._id, {
        config: {
          ...widget.config,
          primaryMetric: secondaryMetric,
          secondaryMetric: undefined,
        },
      });
    } else {
      // Eliminar secundaria
      updateWidget(widget._id, {
        config: {
          ...widget.config,
          secondaryMetric: undefined,
        },
      });
    }
  };

  // Manejar cambio de métrica desde MetricItem
  const handleMetricChange = (
    type: "primary" | "secondary",
    metric: MetricDefinition
  ) => {
    updateWidget(widget._id, {
      config: {
        ...widget.config,
        [`${type}Metric`]: metric,
      },
    });
  };

  // Manejar apertura del selector para añadir
  const handleOpenSelector = () => {
    setEditingType(null);
    if (setDropdownOpenRef.current) {
      setDropdownOpenRef.current(true);
    }
  };

  // Manejar drag and drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Solo intercambiar si ambas métricas existen
      if (primaryMetric && secondaryMetric) {
        updateWidget(widget._id, {
          config: {
            ...widget.config,
            primaryMetric: secondaryMetric,
            secondaryMetric: primaryMetric,
          },
        });
      }
    }
  };

  // Renderizar lista de métricas con drag and drop
  const renderMetricItems = () => {
    const items = [];
    const itemIds = [];

    if (primaryMetric) {
      items.push(
        <MetricItem
          key="primary"
          id="primary"
          metric={primaryMetric}
          type="primary"
          onRemove={handleRemoveMetric}
          onChange={handleMetricChange}
        />
      );
      itemIds.push("primary");
    }

    if (secondaryMetric) {
      items.push(
        <MetricItem
          key="secondary"
          id="secondary"
          metric={secondaryMetric}
          type="secondary"
          onRemove={handleRemoveMetric}
          onChange={handleMetricChange}
        />
      );
      itemIds.push("secondary");
    }

    return items.length > 0 ? (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <div className="metrics-list config-panel__items-list">{items}</div>
        </SortableContext>
      </DndContext>
    ) : null;
  };

  return (
    <div className="data-config">
      <div className="metrics-config config-panel">
        <ConfigDropdown
          className="metrics-dropdown"
          setIsOpenRef={setDropdownOpenRef}
          offsetDistance={20}
          triggerElement={({ ref, onClick, referenceProps }) =>
            metricsCount > 0 ? (
              <>
                <div className="metrics-config__header config-panel__header">
                  <span className="metrics-config__title config-panel__title">
                    MÉTRICAS ({metricsCount}/2)
                  </span>
                  {!hasMaxMetrics && (
                    <button
                      ref={ref}
                      className="metrics-config__add-button config-panel__add-button"
                      onClick={() => {
                        handleOpenSelector();
                        onClick();
                      }}
                      {...referenceProps}
                    >
                      <Icon name="plus" size={12} /> Añadir
                    </button>
                  )}
                </div>
                {renderMetricItems()}
              </>
            ) : (
              <EmptyPlaceholder
                iconName="plus"
                text="Añadir métricas"
                onClick={() => {
                  handleOpenSelector();
                  onClick();
                }}
                referenceProps={referenceProps}
                forwardedRef={ref}
                className="metrics-config__placeholder config-panel__placeholder"
              />
            )
          }
        >
          <MetricSelector
            mode="single"
            selectedMetric={
              editingType === "primary"
                ? primaryMetric
                : editingType === "secondary"
                ? secondaryMetric
                : undefined
            }
            onSelectMetric={handleMetricSelect}
            onClose={() =>
              setDropdownOpenRef.current && setDropdownOpenRef.current(false)
            }
          />
        </ConfigDropdown>
      </div>
      <WidgetFiltersConfig widget={widget} />
    </div>
  );
};
