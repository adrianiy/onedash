import React from "react";
import type { MetricSelectorProps } from "./types";
import { useMetricSelector } from "./hooks";

// Importar componentes
import { SearchBar } from "./components/SearchBar";
import { TabsList } from "./components/TabsList";
import { Icon } from "../../../common/Icon";
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
  selectedMetrics = [],
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
    isModifierRequired,
    hasDefaultValue,
    getDefaultValue,
    isStrictlyRequired,
    willApplyDefaultValue,
    getDefaultValueLabel,
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
  } = useMetricSelector(mode, initialTab);

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
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

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
          />
        )}
      </div>

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
    </div>
  );
};

export default MetricSelector;
