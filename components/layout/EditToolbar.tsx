import React, { useState } from "react";
import { Tooltip } from "react-tooltip";
import { useDashboardStore } from "../../store/dashboardStore";
import { useWidgetStore } from "../../store/widgetStore";
import { useAuthStore } from "../../store/authStore";
import { Icon } from "../common/Icon";
import { ReadonlyConfirmModal } from "../common/ReadonlyConfirmModal";
import type { Dashboard } from "../../types/dashboard";
import type { Widget } from "../../types/widget";

type SaveState = "idle" | "saving" | "success" | "error";

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
      data-tooltip-id="config-tooltip"
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
    isDiscarding,
  } = useDashboardStore();
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [showReadonlyModal, setShowReadonlyModal] = useState(false);
  const [readonlyDashboard, setReadonlyDashboard] = useState<Dashboard | null>(
    null
  );

  if (!isEditing) return null;

  const handleSave = async () => {
    if (saveState === "saving") return;

    setSaveState("saving");

    try {
      const result = await saveChanges();

      if (result.needsConfirmation && result.dashboard) {
        // Mostrar modal de confirmación para dashboard readonly
        setReadonlyDashboard(result.dashboard);
        setShowReadonlyModal(true);
        setSaveState("idle");
        return;
      }

      if (result.error) {
        console.error("Error al guardar:", result.error);
        setSaveState("error");
        // Volver al estado idle después de 3 segundos
        setTimeout(() => {
          setSaveState("idle");
        }, 3000);
        return;
      }

      // Mostrar estado de éxito
      setSaveState("success");
      setTimeout(() => {
        setSaveState("idle");
      }, 2000);
    } catch (error) {
      console.error("Error saving dashboard:", error);
      setSaveState("error");
      // Volver al estado idle después de 3 segundos
      setTimeout(() => {
        setSaveState("idle");
      }, 3000);
    }
  };

  const getSaveButtonContent = () => {
    switch (saveState) {
      case "saving":
        return {
          icon: "loader" as const,
          text: "Guardando...",
          className: "edit-toolbar__button--saving",
        };
      case "success":
        return {
          icon: "check" as const,
          text: "Guardado",
          className: "edit-toolbar__button--success",
        };
      case "error":
        return {
          icon: "alert-circle" as const,
          text: "Error",
          className: "edit-toolbar__button--error",
        };
      default:
        return {
          icon: "save" as const,
          text: "Guardar",
          className: "",
        };
    }
  };

  const saveButtonContent = getSaveButtonContent();

  const handleCloseEditing = async () => {
    if (hasUnsavedChanges) {
      // Mostrar confirmación antes de perder cambios
      const confirmDiscard = window.confirm(
        "Tienes cambios sin guardar. ¿Estás seguro de que quieres cerrar la edición?"
      );

      if (confirmDiscard) {
        await discardChanges();
      }
    } else {
      toggleEditing();
    }
  };

  // Función auxiliar para añadir cualquier tipo de widget
  const addWidgetToBoard = (
    widget: Widget,
    layout: { w: number; h: number }
  ) => {
    const {
      currentDashboard,
      isEditing,
      updateDashboard,
      updateCurrentDashboard,
      selectWidget,
      openConfigSidebar,
    } = useDashboardStore.getState();

    // Add widget to current dashboard
    if (currentDashboard) {
      const newLayout = {
        i: widget._id,
        x: 0,
        y: 0,
        w: layout.w,
        h: layout.h,
      };

      const updatedWidgets = [...currentDashboard.widgets, widget._id];
      const updatedLayout = [...currentDashboard.layout, newLayout];

      if (isEditing) {
        // En modo edición, actualizar dashboard directamente
        updateCurrentDashboard({
          widgets: updatedWidgets,
          layout: updatedLayout,
        });
      } else {
        // Fuera de modo edición, actualizar directamente
        updateDashboard(currentDashboard._id, {
          widgets: updatedWidgets,
          layout: updatedLayout,
        });
      }

      // Seleccionar el widget recién creado
      selectWidget(widget._id);

      if (widget.type === "text") return;

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
      config: {},
      isConfigured: false,
    });

    addWidgetToBoard(newMetricWidget, { w: 4, h: 4 });
  };

  // Drag handler para métricas
  const handleMetricDragStart = (e: React.DragEvent) => {
    const { setDroppingItemSize } = useDashboardStore.getState();

    // Establecer el tamaño del droppingItem para métricas
    setDroppingItemSize({ w: 4, h: 4 });

    const div = document.createElement("div");
    div.style.width = "1px";
    div.style.height = "1px";
    div.style.backgroundColor = "transparent";
    div.style.position = "absolute";
    div.style.top = "-1000px";
    div.style.left = "-1000px";
    div.style.opacity = "0";
    document.body.appendChild(div);
    e.dataTransfer.setDragImage(div, 0, 0);
    setTimeout(() => {
      if (document.body.contains(div)) {
        document.body.removeChild(div);
      }
    }, 100);

    const dragData = {
      type: "metric",
      title: "Nueva métrica",
      w: 4,
      h: 4,
      config: {},
      isConfigured: false,
    };

    e.dataTransfer.setData("application/json", JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = "copy";
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

    addWidgetToBoard(newChartWidget, { w: 6, h: 4 });
  };

  // Drag handler para gráficos
  const handleChartDragStart = (e: React.DragEvent) => {
    const { setDroppingItemSize } = useDashboardStore.getState();

    // Establecer el tamaño del droppingItem para gráficos
    setDroppingItemSize({ w: 6, h: 4 });

    // Crear elemento DIV invisible para eliminar el ghost
    const div = document.createElement("div");
    div.style.width = "1px";
    div.style.height = "1px";
    div.style.backgroundColor = "transparent";
    div.style.position = "absolute";
    div.style.top = "-1000px";
    div.style.left = "-1000px";
    div.style.opacity = "0";
    document.body.appendChild(div);
    e.dataTransfer.setDragImage(div, 0, 0);
    setTimeout(() => {
      if (document.body.contains(div)) {
        document.body.removeChild(div);
      }
    }, 100);

    const dragData = {
      type: "chart",
      title: "Nuevo gráfico",
      w: 6,
      h: 4,
      config: {},
      isConfigured: false,
    };

    e.dataTransfer.setData("application/json", JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleAddText = () => {
    const { addWidget } = useWidgetStore.getState();

    // Crear widget de texto
    const newTextWidget = addWidget({
      type: "text",
      title: "",
      config: {},
      isConfigured: true,
    });

    addWidgetToBoard(newTextWidget, { w: 4, h: 3 });
  };

  // Drag handler para texto
  const handleTextDragStart = (e: React.DragEvent) => {
    const { setDroppingItemSize } = useDashboardStore.getState();

    // Establecer el tamaño del droppingItem para texto
    setDroppingItemSize({ w: 4, h: 3 });

    // Crear elemento DIV invisible para eliminar el ghost
    const div = document.createElement("div");
    div.style.width = "1px";
    div.style.height = "1px";
    div.style.backgroundColor = "transparent";
    div.style.position = "absolute";
    div.style.top = "-1000px";
    div.style.left = "-1000px";
    div.style.opacity = "0";
    document.body.appendChild(div);
    e.dataTransfer.setDragImage(div, 0, 0);
    setTimeout(() => {
      if (document.body.contains(div)) {
        document.body.removeChild(div);
      }
    }, 100);

    const dragData = {
      type: "text",
      title: "",
      w: 4,
      h: 3,
      config: {},
      isConfigured: true,
    };

    e.dataTransfer.setData("application/json", JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleAddTable = () => {
    const { addWidget } = useWidgetStore.getState();

    // Create new empty table widget
    const newTableWidget = addWidget({
      type: "table",
      title: "Nueva tabla",
      config: {},
      isConfigured: false,
    });

    addWidgetToBoard(newTableWidget, { w: 6, h: 6 });
  };

  const handleDragStart = (e: React.DragEvent) => {
    const { setDroppingItemSize } = useDashboardStore.getState();

    // Establecer el tamaño del droppingItem para tablas
    setDroppingItemSize({ w: 6, h: 6 });

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
      title: "Nueva tabla",
      w: 6,
      h: 6,
      config: {},
      isConfigured: false,
    };

    e.dataTransfer.setData("application/json", JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleConfirmCopy = (newName: string) => {
    if (readonlyDashboard) {
      // Crear nueva copia del dashboard con todas las propiedades necesarias
      createDashboard({
        name: newName,
        description: readonlyDashboard.description,
        layout: readonlyDashboard.layout,
        widgets: readonlyDashboard.widgets,
        variables: readonlyDashboard.variables,
        visibility: "private", // Por defecto privado
        collaborators: readonlyDashboard.collaborators,
        userId: useAuthStore.getState().user?._id || "", // Usuario actual como propietario
        originalId: readonlyDashboard._id, // Referencia al dashboard original
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
                className={`edit-toolbar__button ${saveButtonContent.className}`}
                onClick={handleSave}
                data-tooltip-id="save-tooltip"
                disabled={saveState === "saving"}
              >
                <Icon name={saveButtonContent.icon} size={20} />
                <span>{saveButtonContent.text}</span>
              </button>

              <button
                className={`edit-toolbar__button edit-toolbar__button--danger ${
                  isDiscarding ? "edit-toolbar__button--saving" : ""
                }`}
                onClick={handleCloseEditing}
                data-tooltip-id="close-tooltip"
                disabled={isDiscarding}
              >
                <Icon name={isDiscarding ? "loader" : "close"} size={20} />
                <span>{isDiscarding ? "Restaurando..." : "Cerrar"}</span>
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
                onDragStart={handleMetricDragStart}
                draggable="true"
                data-tooltip-id="metric-tooltip"
              >
                <Icon name="target" size={20} />
                <span>Métrica</span>
              </button>

              <button
                className="edit-toolbar__button"
                onClick={handleAddTable}
                onDragStart={handleDragStart}
                draggable="true"
                data-tooltip-id="table-tooltip"
              >
                <Icon name="table" size={20} />
                <span>Tabla</span>
              </button>

              <button
                className="edit-toolbar__button"
                onClick={handleAddChart}
                onDragStart={handleChartDragStart}
                draggable="true"
                data-tooltip-id="chart-tooltip"
              >
                <Icon name="bar-chart" size={20} />
                <span>Gráfico</span>
              </button>

              <button
                className="edit-toolbar__button"
                onClick={handleAddText}
                onDragStart={handleTextDragStart}
                draggable="true"
                data-tooltip-id="text-tooltip"
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

      {/* Tooltips */}
      <Tooltip
        id="save-tooltip"
        content={
          saveState === "saving"
            ? "Guardando..."
            : saveState === "success"
            ? "Dashboard guardado"
            : saveState === "error"
            ? "Error al guardar - Click para reintentar"
            : "Guardar cambios"
        }
        place="bottom"
      />
      <Tooltip
        id="close-tooltip"
        content={isDiscarding ? "Recargando datos..." : "Cerrar modo edición"}
        place="bottom"
      />
      <Tooltip
        id="metric-tooltip"
        content="Haz clic para añadir o arrastra al grid"
        place="bottom"
      />
      <Tooltip
        id="table-tooltip"
        content="Haz clic para añadir o arrastra al grid"
        place="bottom"
      />
      <Tooltip
        id="chart-tooltip"
        content="Haz clic para añadir o arrastra al grid"
        place="bottom"
      />
      <Tooltip
        id="text-tooltip"
        content="Haz clic para añadir o arrastra al grid"
        place="bottom"
      />
      <Tooltip
        id="config-tooltip"
        content="Configurar widget seleccionado"
        place="bottom"
      />
    </>
  );
};
