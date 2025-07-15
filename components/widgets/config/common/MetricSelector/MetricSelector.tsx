import React from "react";
import { Tooltip } from "react-tooltip";
import type { MetricSelectorProps } from "./types";
import type { MetricDefinition } from "@/types/metricConfig";
import { useMetricSelector } from "./hooks";

// Importar componentes
import { SearchBar } from "./components/SearchBar";
import { TabsList } from "./components/TabsList";
import { Icon } from "@/common/Icon";
import { MetricFooter } from "./components/MetricFooter";
import { IndicatorsTab } from "./tabs/IndicatorsTab";
import { TimerangeTab } from "./tabs/TimerangeTab";
import { CalculationsTab } from "./tabs/CalculationsTab";
import { ModifiersPanel } from "./components/ModifiersPanel";
import { MetricSidebar } from "./components/MetricSidebar";

/**
 * Componente principal del selector de métricas
 */
const MetricSelector: React.FC<MetricSelectorProps> = ({
  mode = "multiple",
  selectedMetric,
  onSelectMetric,
  onSelectMetrics,
  initialTab = "indicators",
  onClose,
}) => {
  // Usar el hook personalizado
  const {
    // Estados
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    showSidebar,
    toggleSidebar,
    selectedIndicators,
    selectedModifiers,
    customValues,
    // Métricas generadas
    generatedMetrics,
    // Contadores
    indicatorsCount,
    timerangeCount,
    calculationsCount,
    // Funciones de utilidad
    isTabRequired,
    isTabComplete,
    getDefaultValue,
    isStrictlyRequired,
    willApplyDefaultValue,
    getMissingRequiredModifiers,
    isButtonEnabled,
    generateButtonHelpMessage,
    // Handlers
    handleIndicatorSelect,
    handleModifierSelect,
    handleCustomValueChange,
    // Estado del panel
    isPanelVisible,
    isCompatibleModifier,
    getModifierLabel,
    // Variables dinámicas
    getDynamicLabel,
    shouldShowDynamicOption,
    shouldShowDynamicOptionForSelector,
    // Tip dinámico
    showDynamicTip,
    hideDynamicTip,
  } = useMetricSelector(mode, initialTab, selectedMetric);

  // Función para manejar la selección según el modo
  const handleSelect = () => {
    if (mode === "single" && onSelectMetric && generatedMetrics.length > 0) {
      // En modo single, seleccionamos la primera métrica generada
      onSelectMetric(generatedMetrics[0]);
    } else if (mode === "multiple" && onSelectMetrics) {
      // En modo multiple, enviamos todas las métricas generadas
      onSelectMetrics(generatedMetrics);
    }
  };

  // Función para manejar los resultados de búsqueda
  const handleSearchResultSelect = (
    resultType: string,
    options?: Record<string, unknown>
  ) => {
    // Limpiar la búsqueda después de seleccionar un resultado
    setSearchQuery("");

    // Manejar resultados de IA
    if (resultType === "iaColumn" && options?.column) {
      const column = options.column as MetricDefinition;

      if (mode === "single" && onSelectMetric) {
        // En modo single, seleccionamos directamente la métrica
        onSelectMetric(column);
        if (onClose) onClose();
      } else if (mode === "multiple" && onSelectMetrics) {
        // En modo multiple, añadimos la columna a las seleccionadas
        onSelectMetrics([column]);
      }
      return;
    }

    // Lógica para manejar tipos anteriores (para compatibilidad)
    switch (resultType) {
      case "importeNeto":
        // Añadir métrica de importe neto
        console.log("Seleccionado Importe Neto");
        break;
      case "importeNetoCrecimiento":
        // Añadir métrica de importe neto (crecimiento)
        console.log("Seleccionado Importe Neto (Crecimiento)");
        break;
      case "analisisMmttTttt":
        // Añadir métricas de análisis MMTT y TTTT
        console.log("Seleccionado Análisis MMTT y TTTT");
        break;
      default:
        break;
    }
  };

  // Función para manejar la selección de todas las columnas generadas por IA
  const handleSelectAllResults = (columns: MetricDefinition[]) => {
    // Limpiar la búsqueda
    setSearchQuery("");

    if (mode === "multiple" && onSelectMetrics) {
      // Añadir todas las columnas generadas
      onSelectMetrics(columns);

      // Opcional: cerrar el selector si corresponde
      if (onClose) onClose();
    }
  };

  // Renderizar el componente según la pestaña activa
  const renderActiveTab = () => {
    switch (activeTab) {
      case "indicators":
        return (
          <IndicatorsTab
            searchQuery={searchQuery}
            selectedIndicators={selectedIndicators}
            selectedModifiers={selectedModifiers}
            mode={mode}
            handleIndicatorSelect={handleIndicatorSelect}
            shouldShowDynamicOptionForSelector={
              shouldShowDynamicOptionForSelector
            }
            getDynamicLabel={getDynamicLabel}
          />
        );
      case "timerange":
        return (
          <TimerangeTab
            searchQuery={searchQuery}
            selectedIndicators={selectedIndicators}
            selectedModifiers={selectedModifiers}
            mode={mode}
            handleModifierSelect={handleModifierSelect}
          />
        );
      case "calculations":
        return (
          <CalculationsTab
            searchQuery={searchQuery}
            selectedIndicators={selectedIndicators}
            selectedModifiers={selectedModifiers}
            mode={mode}
            handleModifierSelect={handleModifierSelect}
            willApplyDefaultValue={willApplyDefaultValue}
            getDefaultValue={getDefaultValue}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`metric-selector metric-selector--${mode} ${
        isPanelVisible ? "with-modifiers-panel" : ""
      }`}
    >
      <div className="metric-selector__header">
        {/* Barra de búsqueda */}
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSelectSearchResult={handleSearchResultSelect}
          onSelectAllResults={handleSelectAllResults}
          mode={mode}
        />

        {/* Botón de cerrar */}
        {onClose && (
          <button
            className="metric-selector__close-button"
            onClick={onClose}
            title="Cerrar configurador de columnas"
          >
            <Icon name="close" size={16} />
          </button>
        )}
      </div>

      {/* Barra de pestañas */}
      <TabsList
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        indicatorsCount={indicatorsCount}
        timerangeCount={timerangeCount}
        calculationsCount={calculationsCount}
        isTabRequired={isTabRequired}
        isTabComplete={isTabComplete}
      />

      {/* Contenido de la pestaña activa */}
      <div
        className={`metric-selector__content ${
          showSidebar ? "metric-selector__content--with-sidebar" : ""
        }`}
      >
        {renderActiveTab()}

        {/* Panel de modificadores que aparece cuando es necesario */}
        {isPanelVisible && (
          <ModifiersPanel
            isPanelVisible={isPanelVisible}
            activeTab={activeTab}
            selectedIndicators={selectedIndicators}
            selectedModifiers={selectedModifiers}
            isCompatibleModifier={isCompatibleModifier}
            isStrictlyRequired={isStrictlyRequired}
            handleModifierSelect={handleModifierSelect}
            mode={mode}
            customValues={customValues}
            handleCustomValueChange={handleCustomValueChange}
            willApplyDefaultValue={willApplyDefaultValue}
            getDefaultValue={getDefaultValue}
            shouldShowDynamicOption={shouldShowDynamicOption}
            getDynamicLabel={getDynamicLabel}
          />
        )}
      </div>

      {/* Nota informativa sobre campos dinámicos */}
      {showDynamicTip &&
        (shouldShowDynamicOptionForSelector("indicators") ||
          shouldShowDynamicOptionForSelector("timerange") ||
          shouldShowDynamicOption("saleType") ||
          shouldShowDynamicOption("scope") ||
          shouldShowDynamicOption("comparison")) && (
          <div className="metric-selector__dynamic-info">
            <Icon name="zap" size={14} />
            <span>
              Los campos dinámicos reaccionan a los filtros del dashboard
            </span>
            <button
              className="metric-selector__dynamic-info-close"
              onClick={hideDynamicTip}
              data-tooltip-id="dynamic-tip-close-tooltip"
            >
              <Icon name="close" size={12} />
            </button>
          </div>
        )}

      {/* Footer con botones */}
      <MetricFooter
        showSidebar={showSidebar}
        toggleSidebar={toggleSidebar}
        generatedMetricsCount={generatedMetrics.length}
        isButtonEnabled={isButtonEnabled}
        handleSelect={handleSelect}
        mode={mode}
        generateButtonHelpMessage={generateButtonHelpMessage}
      />

      {/* Sidebar con resumen (se muestra/oculta) */}
      {showSidebar && (
        <MetricSidebar
          showSidebar={showSidebar}
          toggleSidebar={toggleSidebar}
          generatedMetrics={generatedMetrics}
          selectedIndicators={selectedIndicators}
          getMissingRequiredModifiers={getMissingRequiredModifiers}
          getModifierLabel={getModifierLabel}
        />
      )}

      {/* Tooltips */}
      <Tooltip
        id="dynamic-tip-close-tooltip"
        content="Ocultar este mensaje permanentemente"
        place="top"
      />
    </div>
  );
};

export default MetricSelector;
