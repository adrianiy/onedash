import React from "react";
import { Icon } from "@/common/Icon";
import { useIaColumnsMutation } from "@/hooks/queries/useIaColumnsMutation";
import type { MetricDefinition } from "@/types/metricConfig";
import ExplanationPanel from "./ExplanationPanel";

interface SearchResultsProps {
  searchQuery: string;
  onSelectResult: (
    resultType: string,
    options?: Record<string, unknown>
  ) => void;
  onSelectAllResults?: (columns: MetricDefinition[]) => void;
  mode: "single" | "multiple";
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  searchQuery,
  onSelectResult,
  onSelectAllResults,
  mode,
}) => {
  const { mutate, data, isPending, isError, error } = useIaColumnsMutation();

  // Efecto para disparar la consulta cuando cambia el query
  React.useEffect(() => {
    if (searchQuery && searchQuery.trim().length > 2) {
      const debouncedSearch = setTimeout(() => {
        mutate(searchQuery);
      }, 500);

      return () => clearTimeout(debouncedSearch);
    }
  }, [searchQuery, mutate]);

  const handleSelectAll = () => {
    if (data?.columns && onSelectAllResults) {
      onSelectAllResults(data.columns);
    }
  };

  if (!searchQuery) return null;

  if (isPending) {
    return (
      <div className="metric-selector__search-results">
        <div className="metric-selector__search-results-loading">
          <div className="metric-selector__search-results-loading-spinner"></div>
          <span>Generando columnas basadas en tu consulta...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="metric-selector__search-results">
        <div className="metric-selector__search-results-warning">
          <Icon name="alert-circle" size={16} />
          <span>Error al generar columnas: {(error as Error).message}</span>
        </div>
      </div>
    );
  }

  if (!data || !data.columns || data.columns.length === 0) {
    return null;
  }

  return (
    <div className="metric-selector__search-results">
      <ExplanationPanel explanation={data.explanation} />
      {/* Botón de "Añadir todas" solo en modo múltiple y si hay más de una columna */}

      <div className="metric-selector__search-results-content">
        {data.columns.map((column, index) => (
          <div
            key={column.id || `column-${index}`}
            className="metric-selector__search-result-card  metric-selector__search-result-card--advanced"
            onClick={() => onSelectResult("iaColumn", { column })}
          >
            <div className="metric-selector__search-result-card-content">
              <h5 className="metric-selector__search-result-card-title">
                {column.title || column.displayName || `Columna ${index + 1}`}
              </h5>
              {/* Panel de explicación expandible */}
              <p className="metric-selector__search-result-card-description">
                {getColumnDescription(column)}
              </p>
            </div>
          </div>
        ))}
      </div>
      {mode === "multiple" && data.columns.length > 1 && (
        <div className="metric-selector__search-results-actions">
          <button
            className="metric-selector__search-add-all"
            onClick={handleSelectAll}
          >
            <Icon name="plus" size={16} />
            <span>Añadir todas ({data.columns.length})</span>
          </button>
        </div>
      )}
    </div>
  );
};

// Función auxiliar para generar una descripción legible de la columna
function getColumnDescription(column: MetricDefinition): string {
  const parts = [];

  // Añadir el tipo de indicador
  if (typeof column.indicator === "string") {
    parts.push(
      column.indicator.charAt(0).toUpperCase() + column.indicator.slice(1)
    );
  }

  // Añadir modificadores clave si existen
  if (column.modifiers.saleType) {
    parts.push(
      typeof column.modifiers.saleType === "string"
        ? column.modifiers.saleType
        : "personalizado"
    );
  }

  if (column.modifiers.timeframe) {
    parts.push(
      typeof column.modifiers.timeframe === "string"
        ? column.modifiers.timeframe
        : "período personalizado"
    );
  }

  if (column.modifiers.calculation) {
    parts.push(
      typeof column.modifiers.calculation === "string"
        ? column.modifiers.calculation
        : "cálculo personalizado"
    );
  }

  return parts.join(" · ");
}

export default SearchResults;
