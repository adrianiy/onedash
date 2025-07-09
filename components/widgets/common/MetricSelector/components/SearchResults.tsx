import React from "react";
import { Icon } from "../../../../common/Icon";

interface SearchResultsProps {
  searchQuery: string;
  onSelectResult: (
    resultType: string,
    options?: Record<string, unknown>
  ) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  searchQuery,
  onSelectResult,
}) => {
  if (!searchQuery) return null;

  return (
    <div className="metric-selector__search-results">
      <div className="metric-selector__search-results-warning">
        <Icon name="warning" size={16} />
        <span>
          Funcionalidad en construcción. Los resultados mostrados son solo
          ejemplos de prueba.
        </span>
      </div>
      <div className="metric-selector__search-results-content">
        {/* Tarjeta para Importe Neto */}
        <div
          className="metric-selector__search-result-card"
          onClick={() => onSelectResult("importeNeto")}
        >
          <div className="metric-selector__search-result-card-content">
            <h5 className="metric-selector__search-result-card-title">
              Importe Neto
            </h5>
            <p className="metric-selector__search-result-card-description">
              Añadir columna de importe neto
            </p>
          </div>
        </div>

        {/* Tarjeta para Importe Neto (Crecimiento) */}
        <div
          className="metric-selector__search-result-card"
          onClick={() => onSelectResult("importeNetoCrecimiento")}
        >
          <div className="metric-selector__search-result-card-content">
            <h5 className="metric-selector__search-result-card-title">
              Importe Neto (Crecimiento)
            </h5>
            <p className="metric-selector__search-result-card-description">
              Añadir columna de crecimiento en importe neto
            </p>
          </div>
        </div>

        {/* Tarjeta avanzada para Análisis MMTT y TTTT */}
        <div
          className="metric-selector__search-result-card metric-selector__search-result-card--advanced"
          onClick={() => onSelectResult("analisisMmttTttt")}
        >
          <div className="metric-selector__search-result-card-content">
            <h5 className="metric-selector__search-result-card-title">
              Análisis MMTT y TTTT
            </h5>
            <p className="metric-selector__search-result-card-description">
              Añadir columnas de importe y unidades por total tiendas y mismas
              tiendas
            </p>
            <div className="metric-selector__search-result-card-tag">
              Avanzado
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
