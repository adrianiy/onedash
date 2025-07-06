import React, { useState } from "react";
import { Icon } from "../../../../common/Icon";
import type { TableWidgetConfig } from "../../../../../types/widget";

// Tipo para una columna de tabla
interface TableColumn {
  key: string;
  title: string;
  width?: number;
}

interface ColumnsConfigDropdownProps {
  config?: TableWidgetConfig; // Opcional porque se puede inicializar con un config vacío
  onAddColumns: (columns: TableColumn[]) => void;
  onClose: () => void;
}

export const ColumnsConfigDropdown: React.FC<ColumnsConfigDropdownProps> = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  config,
  onAddColumns,
  onClose,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeTab, setActiveTab] = useState<string>("indicators");
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Estado para las selecciones en cada pestaña
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedIndicators, setSelectedIndicators] = useState<TableColumn[]>(
    []
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedTimerange, setSelectedTimerange] = useState<TableColumn[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedCalculations, setSelectedCalculations] = useState<
    TableColumn[]
  >([]);

  // Total de selecciones
  const totalSelections =
    selectedIndicators.length +
    selectedTimerange.length +
    selectedCalculations.length;

  // Contadores para cada pestaña
  const indicatorsCount = selectedIndicators.length;
  const timerangeCount = selectedTimerange.length;
  const calculationsCount = selectedCalculations.length;

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const handleAddColumns = () => {
    // Combinar todas las selecciones
    const allSelectedColumns = [
      ...selectedIndicators,
      ...selectedTimerange,
      ...selectedCalculations,
    ];

    // Llamar a la función del padre con las columnas seleccionadas
    onAddColumns(allSelectedColumns);

    // Cerrar el dropdown
    onClose();
  };

  return (
    <div className="columns-config-dropdown">
      {/* 1. Barra superior con buscador */}
      <div className="columns-config-dropdown__search-bar">
        <div className="columns-config-dropdown__search-container">
          <Icon name="search" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Usa la IA para elegir tus columnas"
            className="columns-config-dropdown__search-input"
          />
        </div>
      </div>

      {/* 2. Barra de pestañas */}
      <div className="columns-config-dropdown__tabs">
        <div className="columns-config-dropdown__tab-list">
          <button
            className={`columns-config-dropdown__tab ${
              activeTab === "indicators"
                ? "columns-config-dropdown__tab--active"
                : ""
            }`}
            onClick={() => setActiveTab("indicators")}
          >
            <span className="columns-config-dropdown__tab-label">
              Indicadores
            </span>
            <span className="columns-config-dropdown__tab-counter">
              {indicatorsCount}
            </span>
          </button>
          <button
            className={`columns-config-dropdown__tab ${
              activeTab === "timerange"
                ? "columns-config-dropdown__tab--active"
                : ""
            }`}
            onClick={() => setActiveTab("timerange")}
          >
            <span className="columns-config-dropdown__tab-label">
              Rango temporal
            </span>
            <span className="columns-config-dropdown__tab-counter">
              {timerangeCount}
            </span>
          </button>
          <button
            className={`columns-config-dropdown__tab ${
              activeTab === "calculations"
                ? "columns-config-dropdown__tab--active"
                : ""
            }`}
            onClick={() => setActiveTab("calculations")}
          >
            <span className="columns-config-dropdown__tab-label">Cálculos</span>
            <span className="columns-config-dropdown__tab-counter">
              {calculationsCount}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Sección para seleccionar columnas */}
      <div
        className={`columns-config-dropdown__content ${
          showSidebar ? "columns-config-dropdown__content--with-sidebar" : ""
        }`}
      >
        {/* Contenido según la pestaña activa */}
        {activeTab === "indicators" && (
          <div className="columns-config-dropdown__tab-content">
            <p className="columns-config-dropdown__placeholder-message">
              Contenido de indicadores (por implementar)
            </p>
          </div>
        )}
        {activeTab === "timerange" && (
          <div className="columns-config-dropdown__tab-content">
            <p className="columns-config-dropdown__placeholder-message">
              Contenido de rango temporal (por implementar)
            </p>
          </div>
        )}
        {activeTab === "calculations" && (
          <div className="columns-config-dropdown__tab-content">
            <p className="columns-config-dropdown__placeholder-message">
              Contenido de cálculos (por implementar)
            </p>
          </div>
        )}
      </div>

      {/* 4. Footer con contador y botón */}
      <div className="columns-config-dropdown__footer">
        <button
          className="columns-config-dropdown__summary-button"
          onClick={toggleSidebar}
        >
          {showSidebar ? (
            <>
              <Icon name="close" size={12} />
              <span>ocultar resumen</span>
            </>
          ) : (
            <span>{totalSelections} columnas seleccionadas</span>
          )}
        </button>
        <button
          className="columns-config-dropdown__add-button"
          disabled={totalSelections === 0}
          onClick={handleAddColumns}
        >
          <Icon name="plus" size={12} />
          <span>Añadir</span>
        </button>
      </div>

      {/* Sidebar con resumen de selección (se muestra/oculta) */}
      {showSidebar && (
        <div className="columns-config-dropdown__sidebar">
          <div className="columns-config-dropdown__sidebar-header">
            <h3>Columnas seleccionadas</h3>
            <button
              className="columns-config-dropdown__close-button"
              onClick={toggleSidebar}
            >
              <Icon name="close" size={16} />
            </button>
          </div>
          <div className="columns-config-dropdown__sidebar-content">
            {totalSelections === 0 ? (
              <p className="columns-config-dropdown__no-selections">
                No hay columnas seleccionadas
              </p>
            ) : (
              <ul className="columns-config-dropdown__columns-list">
                {/* Aquí irá la lista de columnas seleccionadas */}
                <li className="columns-config-dropdown__placeholder">
                  Lista de selecciones (por implementar)
                </li>
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
