import { Icon } from "@/common/Icon";
import { CustomSelect } from "@/common/CustomSelect";
import { WidgetFiltersConfig } from "@/components/widgets/config/common/controls/WidgetFiltersConfig";
import MetricSelector from "@/components/widgets/config/common/MetricSelector/MetricSelector";
import { ConfigDropdown } from "@/components/widgets/config/common/ui/ConfigDropdown";
import { EmptyPlaceholder } from "@/components/widgets/config/common/ui/EmptyPlaceholder";
import { useGridStore } from "@/store/gridStore";
import type { ComparisonWidget, ComparisonWidgetConfig } from "@/types/widget";
import type { MetricDefinition } from "@/types/metricConfig";
import React, { useRef, useState, useMemo } from "react";
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
import { MetricItem } from "@/components/widgets/config/MetricConfig/data/MetricItem";

// Opciones para el selector de dimensión
const DIMENSION_OPTIONS = [
  { value: "time", label: "Tiempo" },
  { value: "product", label: "Producto" },
  { value: "section", label: "Sección" },
  { value: "category", label: "Categoría" },
  { value: "custom", label: "Personalizado" },
];

interface DataConfigProps {
  widget: ComparisonWidget;
}

export const DataConfig: React.FC<DataConfigProps> = ({ widget }) => {
  const { updateWidget } = useGridStore();
  const setDropdownOpenRef = useRef<((isOpen: boolean) => void) | null>(null);
  const [editingMetric, setEditingMetric] = useState<
    "primary" | "secondary" | null
  >(null);

  // Obtener valores actuales o valores por defecto
  const dimension = widget.config.dimension || "time";
  const primaryMetric = widget.config.primaryMetric;
  const secondaryMetric = widget.config.secondaryMetric;

  // Configuración de sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Manejador para cambiar la dimensión
  const handleDimensionChange = (value: string) => {
    updateWidget(widget._id, {
      config: {
        ...widget.config,
        dimension: value as ComparisonWidgetConfig["dimension"],
      },
    });
  };

  // Manejador para seleccionar métrica desde el selector
  const handleMetricSelect = (metric: MetricDefinition) => {
    if (editingMetric) {
      // Actualizando una métrica existente
      updateWidget(widget._id, {
        config: {
          ...widget.config,
          [`${editingMetric}Metric`]: metric,
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
    setEditingMetric(null);
    if (setDropdownOpenRef.current) {
      setDropdownOpenRef.current(false);
    }
  };

  // Manejador para eliminar métrica
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

  // Manejador para cambiar una métrica existente
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

  // Manejador para abrir el selector
  const handleOpenSelector = () => {
    setEditingMetric(null);
    if (setDropdownOpenRef.current) {
      setDropdownOpenRef.current(true);
    }
  };

  // Manejador para drag and drop
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

  // Renderizar elementos de métrica
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

  // Determinar si hay métricas configuradas
  const metricsCount = useMemo(() => {
    return (primaryMetric ? 1 : 0) + (secondaryMetric ? 1 : 0);
  }, [primaryMetric, secondaryMetric]);

  const hasMaxMetrics = metricsCount >= 2;

  return (
    <div className="comparison-data-config">
      {/* Selector de dimensión */}
      <div className="config-section">
        <h3 className="config-section__title">Dimensión</h3>
        <CustomSelect
          options={DIMENSION_OPTIONS}
          value={dimension}
          onChange={handleDimensionChange}
          placeholder="Seleccionar dimensión"
          className="dimension-selector"
        />
      </div>

      {/* Configuración de métricas según dimensión */}
      {dimension !== "custom" ? (
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
                editingMetric === "primary"
                  ? primaryMetric
                  : editingMetric === "secondary"
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
      ) : (
        <ComparisonGroupsConfig widget={widget} />
      )}

      {/* Filtros del widget */}
      <WidgetFiltersConfig widget={widget} />
    </div>
  );
};

// Componente para grupos de comparación cuando dimension es "custom"
interface ComparisonGroupsConfigProps {
  widget: ComparisonWidget;
}

const ComparisonGroupsConfig: React.FC<ComparisonGroupsConfigProps> = ({
  widget,
}) => {
  const { updateWidget } = useGridStore();
  const comparisonMetrics = widget.config.comparisonMetrics || [];

  // Manejador para añadir un nuevo grupo
  const handleAddGroup = () => {
    const newGroup = {
      id: `group_${Date.now()}`,
      group: `Grupo ${(comparisonMetrics?.length || 0) + 1}`,
      primaryMetric: undefined,
      secondaryMetric: undefined,
    };

    updateWidget(widget._id, {
      config: {
        ...widget.config,
        comparisonMetrics: [...(comparisonMetrics || []), newGroup],
      },
    });
  };

  // Manejador para eliminar un grupo
  const handleRemoveGroup = (groupId: string) => {
    const updatedGroups = (comparisonMetrics || []).filter(
      (group) => group.id !== groupId
    );

    updateWidget(widget._id, {
      config: {
        ...widget.config,
        comparisonMetrics: updatedGroups,
      },
    });
  };

  // Manejador para actualizar el nombre de un grupo
  const handleUpdateGroupName = (groupId: string, newName: string) => {
    const updatedGroups = (comparisonMetrics || []).map((group) => {
      if (group.id === groupId) {
        return { ...group, group: newName };
      }
      return group;
    });

    updateWidget(widget._id, {
      config: {
        ...widget.config,
        comparisonMetrics: updatedGroups,
      },
    });
  };

  return (
    <div className="comparison-groups-container">
      {/* Encabezado y botón para añadir grupo */}
      <div className="comparison-groups__header">
        <h3 className="config-section__title">Grupos de comparación</h3>
        <button
          className="comparison-groups__add-button config-panel__add-button"
          onClick={handleAddGroup}
        >
          <Icon name="plus" size={12} /> Añadir grupo
        </button>
      </div>

      {/* Lista de grupos */}
      {comparisonMetrics && comparisonMetrics.length > 0 ? (
        <div className="comparison-groups__list">
          {comparisonMetrics.map((group) => (
            <ComparisonGroup
              key={group.id}
              group={group}
              widget={widget}
              onUpdateName={(newName) =>
                handleUpdateGroupName(group.id, newName)
              }
              onRemove={() => handleRemoveGroup(group.id)}
            />
          ))}
        </div>
      ) : (
        <div className="comparison-groups__empty-state">
          <p>No hay grupos de comparación configurados</p>
          <button
            className="comparison-groups__add-first-button"
            onClick={handleAddGroup}
          >
            <Icon name="plus" size={16} />
            Añadir primer grupo
          </button>
        </div>
      )}
    </div>
  );
};

// Componente para un grupo de comparación individual
interface ComparisonGroupProps {
  group: {
    id: string;
    group: string;
    primaryMetric?: MetricDefinition;
    secondaryMetric?: MetricDefinition;
  };
  widget: ComparisonWidget;
  onUpdateName: (newName: string) => void;
  onRemove: () => void;
}

const ComparisonGroup: React.FC<ComparisonGroupProps> = ({
  group,
  widget,
  onUpdateName,
  onRemove,
}) => {
  const { updateWidget } = useGridStore();
  const setDropdownOpenRef = useRef<((isOpen: boolean) => void) | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [groupName, setGroupName] = useState(group.group);
  const [editingMetric, setEditingMetric] = useState<
    "primary" | "secondary" | null
  >(null);

  // Sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Manejar selección de métrica desde el selector
  const handleMetricSelect = (metric: MetricDefinition) => {
    if (editingMetric) {
      // Actualizar la métrica en el grupo específico
      const updatedGroups = (widget.config.comparisonMetrics || []).map((g) => {
        if (g.id === group.id) {
          return {
            ...g,
            [`${editingMetric}Metric`]: metric,
          };
        }
        return g;
      });

      updateWidget(widget._id, {
        config: {
          ...widget.config,
          comparisonMetrics: updatedGroups,
        },
      });
    } else {
      // Si no estamos editando, determinar si añadir primaria o secundaria
      if (!group.primaryMetric) {
        const updatedGroups = (widget.config.comparisonMetrics || []).map(
          (g) => {
            if (g.id === group.id) {
              return {
                ...g,
                primaryMetric: metric,
              };
            }
            return g;
          }
        );

        updateWidget(widget._id, {
          config: {
            ...widget.config,
            comparisonMetrics: updatedGroups,
          },
        });
      } else if (!group.secondaryMetric) {
        const updatedGroups = (widget.config.comparisonMetrics || []).map(
          (g) => {
            if (g.id === group.id) {
              return {
                ...g,
                secondaryMetric: metric,
              };
            }
            return g;
          }
        );

        updateWidget(widget._id, {
          config: {
            ...widget.config,
            comparisonMetrics: updatedGroups,
          },
        });
      }
    }

    // Cerrar dropdown y limpiar estado
    setEditingMetric(null);
    if (setDropdownOpenRef.current) {
      setDropdownOpenRef.current(false);
    }
  };

  // Manejar eliminación de métrica
  const handleRemoveMetric = (type: "primary" | "secondary") => {
    const updatedGroups = (widget.config.comparisonMetrics || []).map((g) => {
      if (g.id === group.id) {
        if (type === "primary") {
          // Si eliminamos primaria y hay secundaria, promover secundaria a primaria
          return {
            ...g,
            primaryMetric: g.secondaryMetric,
            secondaryMetric: undefined,
          };
        } else {
          // Eliminar secundaria
          return {
            ...g,
            secondaryMetric: undefined,
          };
        }
      }
      return g;
    });

    updateWidget(widget._id, {
      config: {
        ...widget.config,
        comparisonMetrics: updatedGroups,
      },
    });
  };

  // Manejar cambio de métrica
  const handleMetricChange = (
    type: "primary" | "secondary",
    metric: MetricDefinition
  ) => {
    const updatedGroups = (widget.config.comparisonMetrics || []).map((g) => {
      if (g.id === group.id) {
        return {
          ...g,
          [`${type}Metric`]: metric,
        };
      }
      return g;
    });

    updateWidget(widget._id, {
      config: {
        ...widget.config,
        comparisonMetrics: updatedGroups,
      },
    });
  };

  // Manejar apertura del selector
  const handleOpenSelector = () => {
    setEditingMetric(null);
    if (setDropdownOpenRef.current) {
      setDropdownOpenRef.current(true);
    }
  };

  // Manejar drag and drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Solo intercambiar si ambas métricas existen
      if (group.primaryMetric && group.secondaryMetric) {
        const updatedGroups = (widget.config.comparisonMetrics || []).map(
          (g) => {
            if (g.id === group.id) {
              return {
                ...g,
                primaryMetric: g.secondaryMetric,
                secondaryMetric: g.primaryMetric,
              };
            }
            return g;
          }
        );

        updateWidget(widget._id, {
          config: {
            ...widget.config,
            comparisonMetrics: updatedGroups,
          },
        });
      }
    }
  };

  // Manejar edición de nombre
  const handleStartEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleFinishEditing = () => {
    if (groupName.trim() !== "") {
      onUpdateName(groupName);
    } else {
      setGroupName(group.group); // Restaurar valor original si está vacío
    }
    setIsEditing(false);
  };

  // Renderizar elementos de métrica
  const renderMetricItems = () => {
    const items = [];
    const itemIds = [];

    if (group.primaryMetric) {
      items.push(
        <MetricItem
          key="primary"
          id="primary"
          metric={group.primaryMetric}
          type="primary"
          onRemove={handleRemoveMetric}
          onChange={handleMetricChange}
        />
      );
      itemIds.push("primary");
    }

    if (group.secondaryMetric) {
      items.push(
        <MetricItem
          key="secondary"
          id="secondary"
          metric={group.secondaryMetric}
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

  // Determinar si hay métricas configuradas
  const metricsCount = useMemo(() => {
    return (group.primaryMetric ? 1 : 0) + (group.secondaryMetric ? 1 : 0);
  }, [group.primaryMetric, group.secondaryMetric]);

  const hasMaxMetrics = metricsCount >= 2;

  return (
    <div className="comparison-group">
      {/* Encabezado del grupo con nombre editable */}
      <div className="comparison-group__header">
        {isEditing ? (
          <input
            type="text"
            className="comparison-group__name-input"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            onBlur={handleFinishEditing}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleFinishEditing();
              if (e.key === "Escape") {
                setGroupName(group.group);
                setIsEditing(false);
              }
            }}
            autoFocus
          />
        ) : (
          <div className="comparison-group__name" onClick={handleStartEditing}>
            {group.group}
          </div>
        )}

        <button
          className="comparison-group__remove-button"
          onClick={onRemove}
          title="Eliminar grupo"
        >
          <Icon name="trash" size={14} />
        </button>
      </div>

      {/* Configuración de métricas - usando mismo patrón que el modo normal */}
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
              editingMetric === "primary"
                ? group.primaryMetric
                : editingMetric === "secondary"
                ? group.secondaryMetric
                : undefined
            }
            onSelectMetric={handleMetricSelect}
            onClose={() =>
              setDropdownOpenRef.current && setDropdownOpenRef.current(false)
            }
          />
        </ConfigDropdown>
      </div>
    </div>
  );
};
