import React, { useRef, useState, useEffect, useMemo } from "react";
import type { Widget, ChartWidgetConfig } from "../../../../types/widget";
import type { MetricDefinition } from "../../../../types/metricConfig";
import { getDisplayTitle } from "../../../../types/metricConfig";
import { ConfigDropdown } from "../../common/ConfigDropdown";
import { EmptyPlaceholder } from "../../common/EmptyPlaceholder";
import { Icon } from "../../../common/Icon";
import { MetricSelector } from "../../common/MetricSelector";
import { useWidgetStore } from "../../../../store/widgetStore";
import { SeriesItem } from "./components/SeriesItem";
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
  arrayMove,
} from "@dnd-kit/sortable";

// Extendemos MetricDefinition para incluir propiedades de visualización
interface SeriesConfig extends MetricDefinition {
  visible?: boolean;
  selected?: boolean;
}

interface ChartSeriesConfigProps {
  widget: Widget;
}

export const ChartSeriesConfig: React.FC<ChartSeriesConfigProps> = ({
  widget,
}) => {
  const chartConfig = widget.type === "chart" ? widget.config : { series: [] };
  // Convertimos las series base a SeriesConfig y memorizamos el resultado
  const seriesFromConfig: SeriesConfig[] = useMemo(() => {
    return ((chartConfig as ChartWidgetConfig).series || []).map((serie) => {
      // Usar el valor visible existente o establecer true por defecto
      const seriesWithVisibility = serie as SeriesConfig;
      return {
        ...serie,
        visible:
          seriesWithVisibility.visible !== undefined
            ? seriesWithVisibility.visible
            : true,
        selected: false,
      };
    });
  }, [chartConfig.series]);

  // Estado para controlar qué series están seleccionadas
  const [selectedSeries, setSelectedSeries] = useState<string[]>([]);

  // Estado para controlar la serie en edición
  const [editingSeriesId, setEditingSeriesId] = useState<string | null>(null);

  // Estado para almacenar la serie que se está editando
  const [editingSeries, setEditingSeries] = useState<MetricDefinition | null>(
    null
  );

  // Referencia para controlar el estado del dropdown
  const setDropdownOpenRef = useRef<((isOpen: boolean) => void) | null>(null);

  // Configuración de sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Efecto para establecer la serie en edición cuando cambia el ID
  useEffect(() => {
    if (editingSeriesId && widget.type === "chart") {
      const serie = seriesFromConfig.find((s) => s.id === editingSeriesId);
      if (serie) {
        setEditingSeries(serie);
      }
    } else {
      setEditingSeries(null);
    }
  }, [editingSeriesId, widget.type, seriesFromConfig]);

  // Función para actualizar el widget con las nuevas series
  const handleAddSeries = (newMetrics: MetricDefinition[]) => {
    if (widget.type === "chart") {
      // Obtener el store para actualizar el widget
      const { updateWidget } = useWidgetStore.getState();

      // Añadir la propiedad visible por defecto a true para las nuevas series
      const newSeriesWithVisibility: SeriesConfig[] = newMetrics.map(
        (serie) => ({
          ...serie,
          visible: true,
          selected: false,
        })
      );

      // Crear un nuevo array con todas las series
      const updatedSeries = [...seriesFromConfig, ...newSeriesWithVisibility];

      // Actualizar el widget con las nuevas series
      updateWidget(widget._id, {
        config: {
          ...widget.config,
          series: updatedSeries,
        },
      });
    }

    // Cerrar el dropdown después de seleccionar
    if (setDropdownOpenRef.current) {
      setDropdownOpenRef.current(false);
    }

    // Resetear el modo de edición
    setEditingSeriesId(null);
  };

  // Función para editar una serie existente
  const handleEditSeries = (updatedMetric: MetricDefinition) => {
    if (widget.type === "chart" && editingSeriesId) {
      // Obtener el store para actualizar el widget
      const { updateWidget } = useWidgetStore.getState();

      // Crear una copia de las series actuales
      const updatedSeries = seriesFromConfig.map((serie) => {
        if (serie.id === editingSeriesId) {
          // Mantener el id, visible y selected de la serie original
          return {
            ...updatedMetric,
            id: editingSeriesId,
            visible: serie.visible,
            selected: serie.selected,
          };
        }
        return serie;
      });

      // Actualizar el widget
      updateWidget(widget._id, {
        config: {
          ...widget.config,
          series: updatedSeries,
        },
      });

      // Resetear el modo de edición
      setEditingSeriesId(null);

      // Cerrar el dropdown
      if (setDropdownOpenRef.current) {
        setDropdownOpenRef.current(false);
      }
    }
  };

  // Función para copiar una serie
  const handleCopySeries = (seriesId: string) => {
    if (widget.type === "chart") {
      // Obtener el store para actualizar el widget
      const { updateWidget } = useWidgetStore.getState();

      // Encontrar la serie a copiar
      const seriesToCopy = seriesFromConfig.find(
        (serie) => serie.id === seriesId
      );

      if (seriesToCopy) {
        // Crear una copia de la serie con un nuevo ID único
        const newId = `${seriesToCopy.id}_copy_${Date.now()}`;
        const copiedSeries: SeriesConfig = {
          ...JSON.parse(JSON.stringify(seriesToCopy)), // Deep copy para evitar problemas de referencia
          id: newId,
          displayName: `${
            seriesToCopy.displayName || getDisplayTitle(seriesToCopy, {})
          } (Copia)`,
        };

        // Encontrar el índice de la serie original para insertar la copia justo después
        const originalIndex = seriesFromConfig.findIndex(
          (serie) => serie.id === seriesId
        );

        // Crear un nuevo array con todas las series, insertando la copia después de la original
        const updatedSeries = [...seriesFromConfig];
        updatedSeries.splice(originalIndex + 1, 0, copiedSeries);

        // Actualizar el widget
        updateWidget(widget._id, {
          config: {
            ...widget.config,
            series: updatedSeries,
          },
        });
      }
    }
  };

  // Función para eliminar una serie
  const handleRemoveSeries = (seriesId: string) => {
    if (widget.type === "chart") {
      // Obtener el store para actualizar el widget
      const { updateWidget } = useWidgetStore.getState();

      // Filtrar la serie a eliminar
      const updatedSeries: SeriesConfig[] = seriesFromConfig.filter(
        (serie) => serie.id !== seriesId
      );

      // Actualizar el widget
      updateWidget(widget._id, {
        config: {
          ...widget.config,
          series: updatedSeries,
        },
      });

      // Actualizar estados locales si es necesario
      if (selectedSeries.includes(seriesId)) {
        setSelectedSeries(selectedSeries.filter((id) => id !== seriesId));
      }
    }
  };

  // Función para cambiar la visibilidad de una serie
  const handleToggleVisibility = (seriesId: string) => {
    if (widget.type === "chart") {
      // Obtener el store para actualizar el widget
      const { updateWidget } = useWidgetStore.getState();

      // Obtener las series directamente del widget actual
      const currentSeries = [...(widget.config.series || [])];

      // Crear una copia de las series y actualizar la visibilidad de la serie específica
      const updatedSeries = currentSeries.map((serie) => {
        if (serie.id === seriesId) {
          const currentVisibility = "visible" in serie ? serie.visible : true;
          return { ...serie, visible: !currentVisibility };
        }
        return serie;
      });

      // Actualizar el widget con las series actualizadas
      updateWidget(widget._id, {
        config: {
          ...widget.config,
          series: updatedSeries,
        },
      });
    }
  };

  // Función para seleccionar/deseleccionar una serie
  const handleToggleSelect = (seriesId: string) => {
    if (selectedSeries.includes(seriesId)) {
      setSelectedSeries(selectedSeries.filter((id) => id !== seriesId));
    } else {
      setSelectedSeries([...selectedSeries, seriesId]);
    }
  };

  // Seleccionar todas las series
  const handleSelectAll = () => {
    setSelectedSeries(seriesFromConfig.map((serie) => serie.id));
  };

  // Borrar selección
  const handleClearSelection = () => {
    setSelectedSeries([]);
  };

  // Borrar series seleccionadas
  const handleRemoveSelected = () => {
    if (widget.type === "chart") {
      const { updateWidget } = useWidgetStore.getState();
      const updatedSeries = seriesFromConfig.filter(
        (serie) => !selectedSeries.includes(serie.id)
      );
      updateWidget(widget._id, {
        config: { ...widget.config, series: updatedSeries },
      });
      setSelectedSeries([]);
    }
  };

  // Renombrar una serie
  const handleRenameSeries = (seriesId: string, newTitle: string) => {
    if (widget.type === "chart") {
      const { updateWidget } = useWidgetStore.getState();
      const updatedSeries = seriesFromConfig.map((serie) => {
        if (serie.id === seriesId) {
          return { ...serie, displayName: newTitle };
        }
        return serie;
      });
      updateWidget(widget._id, {
        config: { ...widget.config, series: updatedSeries },
      });
    }
  };

  // Manejador para cuando termina el arrastre
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const { updateWidget } = useWidgetStore.getState();
      const oldIndex = seriesFromConfig.findIndex((s) => s.id === active.id);
      const newIndex = seriesFromConfig.findIndex((s) => s.id === over.id);
      const newOrderSeries = arrayMove(seriesFromConfig, oldIndex, newIndex);
      if (widget.type === "chart") {
        updateWidget(widget._id, {
          config: { ...widget.config, series: newOrderSeries },
        });
      }
    }
  };

  // Renderizar los elementos de las series
  const renderSeriesItems = () => {
    if (seriesFromConfig.length === 0) return null;

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={seriesFromConfig.map((serie) => serie.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="series-list config-panel__items-list">
            {seriesFromConfig.map((serie, index) => {
              const isVisible = serie.visible ?? true;
              const isSelected = selectedSeries.includes(serie.id);

              return (
                <SeriesItem
                  key={serie.id}
                  id={serie.id}
                  index={index}
                  series={serie}
                  isVisible={isVisible}
                  isSelected={isSelected}
                  onRemove={handleRemoveSeries}
                  onToggleVisibility={handleToggleVisibility}
                  onToggleSelect={handleToggleSelect}
                  onRename={handleRenameSeries}
                  onCopy={handleCopySeries}
                  onEdit={(id) => {
                    setEditingSeriesId(id);
                    if (setDropdownOpenRef.current) {
                      setDropdownOpenRef.current(true);
                    }
                  }}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    );
  };

  return (
    <div
      className={`series-config config-panel ${
        seriesFromConfig.length > 0 ? "config-panel--resizable" : ""
      }`}
    >
      <ConfigDropdown
        className="metrics-dropdown"
        setIsOpenRef={setDropdownOpenRef}
        offsetDistance={20}
        triggerElement={({ ref, onClick, referenceProps }) =>
          seriesFromConfig.length > 0 ? (
            <>
              <div className="series-config__header config-panel__header">
                <span className="series-config__title config-panel__title">
                  SERIES (EJE Y)
                  {selectedSeries.length > 0 && (
                    <span className="series-config__counter config-panel__counter">
                      ({selectedSeries.length})
                    </span>
                  )}
                </span>
                {selectedSeries.length > 0 ? (
                  <div className="series-config__actions config-panel__actions">
                    <button
                      className="series-config__action-button config-panel__action-button"
                      onClick={handleSelectAll}
                      title="Seleccionar todo"
                    >
                      Todo
                    </button>
                    <button
                      className="series-config__action-button config-panel__action-button"
                      onClick={handleClearSelection}
                      title="Quitar selección"
                    >
                      Ninguno
                    </button>
                    <button
                      className="series-config__action-button--danger config-panel__action-button--danger"
                      onClick={handleRemoveSelected}
                      title="Eliminar series seleccionadas"
                    >
                      Borrar
                    </button>
                  </div>
                ) : (
                  <button
                    ref={ref}
                    className="series-config__add-button config-panel__add-button"
                    onClick={onClick}
                    {...referenceProps}
                  >
                    <Icon name="plus" size={12} /> Añadir
                  </button>
                )}
              </div>
              {renderSeriesItems()}
            </>
          ) : (
            <EmptyPlaceholder
              iconName="plus"
              text="Añadir series"
              onClick={onClick}
              referenceProps={referenceProps}
              forwardedRef={ref}
              className="series-config__placeholder config-panel__placeholder"
            />
          )
        }
      >
        {editingSeriesId ? (
          <MetricSelector
            mode="single"
            selectedMetric={editingSeries || undefined}
            onSelectMetric={handleEditSeries}
            onClose={() => {
              setEditingSeriesId(null);
              if (setDropdownOpenRef.current) {
                setDropdownOpenRef.current(false);
              }
            }}
          />
        ) : (
          <MetricSelector
            mode="multiple"
            onSelectMetrics={handleAddSeries}
            onClose={() =>
              setDropdownOpenRef.current && setDropdownOpenRef.current(false)
            }
          />
        )}
      </ConfigDropdown>
    </div>
  );
};
