import React, { useState } from "react";
import { useDashboardStore } from "../../store/dashboardStore";
import { useWidgetStore } from "../../store/widgetStore";
import { Icon } from "../common/Icon";
import { ReadonlyConfirmModal } from "../common/ReadonlyConfirmModal";
import type { Dashboard } from "../../types/dashboard";
import type { Widget } from "../../types/widget";

const ConfigButton: React.FC = () => {
  const { selectedWidgetId, openConfigSidebar } = useDashboardStore();
  const { getWidget } = useWidgetStore();

  // Solo mostrar el botón si hay un widget seleccionado
  if (!selectedWidgetId) {
    return null;
  }

  const widget = getWidget(selectedWidgetId);
  if (!widget) {
    return null;
  }

  const getWidgetTypeName = (type: string) => {
    switch (type) {
      case "table":
        return "Tabla";
      case "chart":
        return "Gráfico";
      case "metric":
        return "Métrica";
      case "text":
        return "Texto";
      default:
        return "Widget";
    }
  };

  const getWidgetIcon = (type: string) => {
    switch (type) {
      case "table":
        return "table";
      case "chart":
        return "bar-chart";
      case "metric":
        return "target";
      case "text":
        return "edit";
      default:
        return "settings";
    }
  };

  const handleConfigClick = () => {
    openConfigSidebar();
  };

  return (
    <button
      className="edit-toolbar__button edit-toolbar__button--config"
      onClick={handleConfigClick}
      title={`Configurar ${getWidgetTypeName(widget.type)}`}
    >
      <Icon name={getWidgetIcon(widget.type)} size={20} />
      <span>Configurar {getWidgetTypeName(widget.type)}</span>
    </button>
  );
};

export const EditToolbar: React.FC = () => {
  const {
    isEditing,
    toggleEditing,
    hasUnsavedChanges,
    saveChanges,
    discardChanges,
    createDashboard,
  } = useDashboardStore();
  const [isSaving, setIsSaving] = useState(false);
  const [showReadonlyModal, setShowReadonlyModal] = useState(false);
  const [readonlyDashboard, setReadonlyDashboard] = useState<Dashboard | null>(
    null
  );

  if (!isEditing) return null;

  const handleSave = async () => {
    if (!isSaving) {
      setIsSaving(true);

      try {
        const result = await saveChanges();

        if (result.needsConfirmation && result.dashboard) {
          // Mostrar modal de confirmación para dashboard readonly
          setReadonlyDashboard(result.dashboard);
          setShowReadonlyModal(true);
          setIsSaving(false);
          return;
        }

        // Mostrar estado de guardado brevemente
        setTimeout(() => {
          setIsSaving(false);
        }, 800);
      } catch (error) {
        console.error("Error saving dashboard:", error);
        setIsSaving(false);
      }
    }
  };

  const handleCloseEditing = () => {
    if (hasUnsavedChanges) {
      // TODO: Mostrar confirmación antes de perder cambios
      const confirmDiscard = window.confirm(
        "Tienes cambios sin guardar. ¿Estás seguro de que quieres cerrar la edición?"
      );

      if (confirmDiscard) {
        discardChanges();
      }
    } else {
      toggleEditing();
    }
  };

  // Función auxiliar para añadir cualquier tipo de widget
  const addWidgetToBoard = (
    widget: Widget,
    layout: { w: number; h: number; minW: number; minH: number }
  ) => {
    const {
      currentDashboard,
      tempDashboard,
      updateTempDashboard,
      updateDashboard,
      selectWidget,
      openConfigSidebar,
    } = useDashboardStore.getState();

    // Add widget to current dashboard
    const targetDashboard = tempDashboard || currentDashboard;
    if (targetDashboard) {
      const newLayout = {
        i: widget.id,
        x: 0,
        y: 0,
        w: layout.w,
        h: layout.h,
        minW: layout.minW,
        minH: layout.minH,
      };

      const updatedWidgets = [...targetDashboard.widgets, widget.id];
      const updatedLayout = [...targetDashboard.layout, newLayout];

      if (tempDashboard) {
        // En modo edición, actualizar dashboard temporal
        updateTempDashboard({
          widgets: updatedWidgets,
          layout: updatedLayout,
        });
      } else {
        // Fuera de modo edición, actualizar directamente
        updateDashboard(targetDashboard.id, {
          widgets: updatedWidgets,
          layout: updatedLayout,
        });
      }

      // Seleccionar el widget recién creado
      selectWidget(widget.id);

      // Abrir automáticamente el sidebar de configuración
      openConfigSidebar();
    }
  };

  const handleAddMetric = () => {
    const { addWidget } = useWidgetStore.getState();

    // Crear widget de métrica
    const newMetricWidget = addWidget({
      type: "metric",
      title: "Nueva métrica",
      config: {
        value: 0,
        unit: "",
        trend: "neutral",
        trendValue: 0,
      },
      isConfigured: false,
    });

    addWidgetToBoard(newMetricWidget, { w: 3, h: 3, minW: 2, minH: 2 });
  };

  const handleAddChart = () => {
    const { addWidget } = useWidgetStore.getState();

    // Crear widget de gráfico
    const newChartWidget = addWidget({
      type: "chart",
      title: "Nuevo gráfico",
      config: {
        chartType: "bar",
        data: [],
        options: {},
      },
      isConfigured: false,
    });

    addWidgetToBoard(newChartWidget, { w: 6, h: 4, minW: 4, minH: 3 });
  };

  const handleAddText = () => {
    const { addWidget } = useWidgetStore.getState();

    // Crear widget de texto
    const newTextWidget = addWidget({
      type: "text",
      title: "Texto",
      config: {
        content: "Haz doble click para editar este texto",
        fontSize: 16,
        textAlign: "left",
      },
      isConfigured: true,
    });

    addWidgetToBoard(newTextWidget, { w: 4, h: 3, minW: 2, minH: 2 });
  };

  const handleAddTable = () => {
    const { addWidget } = useWidgetStore.getState();

    // Create new empty table widget
    const newTableWidget = addWidget({
      type: "table",
      title: "",
      config: {
        columns: [],
        data: [],
        breakdownLevels: [],
        dataSource: undefined,
      },
      isConfigured: false,
    });

    addWidgetToBoard(newTableWidget, { w: 6, h: 6, minW: 4, minH: 5 });
  };

  const handleDragStart = (e: React.DragEvent) => {
    // Crear elemento DIV invisible para eliminar el ghost
    const div = document.createElement("div");
    div.style.width = "1px";
    div.style.height = "1px";
    div.style.backgroundColor = "transparent";
    div.style.position = "absolute";
    div.style.top = "-1000px";
    div.style.left = "-1000px";
    div.style.opacity = "0";

    // Añadir temporalmente al DOM
    document.body.appendChild(div);

    // Usar el DIV como imagen de drag
    e.dataTransfer.setDragImage(div, 0, 0);

    // Limpiar el elemento después del drag
    setTimeout(() => {
      if (document.body.contains(div)) {
        document.body.removeChild(div);
      }
    }, 100);

    // Set data for drag and drop
    const dragData = {
      type: "table",
      title: "",
      w: 6,
      h: 6,
      minW: 4,
      minH: 5,
      config: {
        columns: [],
        data: [],
        breakdownLevels: [],
        dataSource: undefined,
      },
      isConfigured: false,
    };

    e.dataTransfer.setData("application/json", JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleConfirmCopy = (newName: string) => {
    if (readonlyDashboard) {
      // Crear nueva copia del dashboard
      createDashboard({
        name: newName,
        description: readonlyDashboard.description,
        layout: readonlyDashboard.layout,
        widgets: readonlyDashboard.widgets,
        isReadonly: false, // La copia siempre es editable
      });

      // Cerrar modal y modo edición
      setShowReadonlyModal(false);
      setReadonlyDashboard(null);
      toggleEditing();

      console.log(`Dashboard copiado como: ${newName}`);
    }
  };

  const handleCancelCopy = () => {
    setShowReadonlyModal(false);
    setReadonlyDashboard(null);
  };

  return (
    <>
      <div className="edit-toolbar">
        <div className="edit-toolbar__content">
          {/* Sección Archivo */}
          <div className="edit-toolbar__section">
            <div className="edit-toolbar__section-buttons">
              <button
                className="edit-toolbar__button"
                onClick={handleSave}
                title="Guardar cambios"
                disabled={isSaving}
              >
                <Icon name={isSaving ? "check" : "save"} size={20} />
                <span>{isSaving ? "Guardado" : "Guardar"}</span>
              </button>

              <button
                className="edit-toolbar__button edit-toolbar__button--danger"
                onClick={handleCloseEditing}
                title="Cerrar modo edición"
              >
                <Icon name="close" size={20} />
                <span>Cerrar</span>
              </button>
            </div>
            <span className="edit-toolbar__section-title">Archivo</span>
          </div>

          <div className="edit-toolbar__separator" />

          {/* Sección Widgets */}
          <div className="edit-toolbar__section">
            <div className="edit-toolbar__section-buttons">
              <button
                className="edit-toolbar__button"
                onClick={handleAddMetric}
                title="Añadir widget de métrica"
              >
                <Icon name="target" size={20} />
                <span>Métrica</span>
              </button>

              <button
                className="edit-toolbar__button"
                onClick={handleAddTable}
                onDragStart={handleDragStart}
                draggable="true"
                title="Haz clic para añadir o arrastra al grid"
              >
                <Icon name="table" size={20} />
                <span>Tabla</span>
              </button>

              <button
                className="edit-toolbar__button"
                onClick={handleAddChart}
                title="Añadir widget de gráfico"
              >
                <Icon name="bar-chart" size={20} />
                <span>Gráfico</span>
              </button>

              <button
                className="edit-toolbar__button"
                onClick={handleAddText}
                title="Añadir widget de texto"
              >
                <Icon name="edit" size={20} />
                <span>Texto</span>
              </button>
            </div>
            <span className="edit-toolbar__section-title">Widgets</span>
          </div>

          <ConfigButton />
        </div>
      </div>

      {readonlyDashboard && (
        <ReadonlyConfirmModal
          isOpen={showReadonlyModal}
          dashboard={readonlyDashboard}
          onConfirm={handleConfirmCopy}
          onCancel={handleCancelCopy}
        />
      )}
    </>
  );
};
