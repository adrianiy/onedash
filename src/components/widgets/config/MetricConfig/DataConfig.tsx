import React, { useRef, useState } from "react";
import type { MetricWidget } from "../../../../types/widget";
import type { MetricDefinition } from "../../../../types/metricConfig";
import { useWidgetStore } from "../../../../store/widgetStore";
import { ConfigDropdown } from "../../common/ConfigDropdown";
import { EmptyPlaceholder } from "../../common/EmptyPlaceholder";
import { Icon } from "../../../common/Icon";
import MetricSelector from "../../common/MetricSelector/MetricSelector";
import { MetricItem } from "./components/MetricItem";
import {
  DndContext,
  closestCenter,
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface DataConfigProps {
  widget: MetricWidget;
}

export const DataConfig: React.FC<DataConfigProps> = ({ widget }) => {
  const { updateWidget } = useWidgetStore();
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
      updateWidget(widget.id, {
        config: {
          ...widget.config,
          [`${editingType}Metric`]: metric,
        },
      });
    } else {
      // Añadiendo nueva métrica
      if (!primaryMetric) {
        // Asignar como primaria si no existe
        updateWidget(widget.id, {
          config: {
            ...widget.config,
            primaryMetric: metric,
          },
        });
      } else if (!secondaryMetric) {
        // Asignar como secundaria si primaria existe
        updateWidget(widget.id, {
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
      updateWidget(widget.id, {
        config: {
          ...widget.config,
          primaryMetric: secondaryMetric,
          secondaryMetric: undefined,
        },
      });
    } else {
      // Eliminar secundaria
      updateWidget(widget.id, {
        config: {
          ...widget.config,
          secondaryMetric: undefined,
        },
      });
    }
  };

  // Manejar edición de métrica
  const handleEditMetric = (type: "primary" | "secondary") => {
    setEditingType(type);
    if (setDropdownOpenRef.current) {
      setDropdownOpenRef.current(true);
    }
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
        updateWidget(widget.id, {
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
          onEdit={handleEditMetric}
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
          onEdit={handleEditMetric}
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
  );
};
