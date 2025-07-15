import React from "react";
import { Icon } from "@/common/Icon";
import SearchResults from "./SearchResults";
import type { MetricDefinition } from "@/types/metricConfig";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  placeholder?: string;
  onSelectSearchResult?: (
    resultType: string,
    options?: Record<string, unknown>
  ) => void;
  onSelectAllResults?: (columns: MetricDefinition[]) => void;
  mode: "single" | "multiple";
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  placeholder = "Usa la IA para elegir tus métricas",
  onSelectSearchResult,
  onSelectAllResults,
  mode,
}) => {
  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="metric-selector__search-bar">
      <div className="metric-selector__search-container">
        <Icon name="search" size={16} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="metric-selector__search-input"
        />
        {searchQuery && (
          <button
            className="metric-selector__search-clear"
            onClick={handleClearSearch}
            aria-label="Borrar búsqueda"
          >
            BORRAR
          </button>
        )}
      </div>

      {/* Componente de resultados de búsqueda */}
      {searchQuery && onSelectSearchResult && (
        <SearchResults
          searchQuery={searchQuery}
          onSelectResult={onSelectSearchResult}
          onSelectAllResults={onSelectAllResults}
          mode={mode}
        />
      )}
    </div>
  );
};

export default SearchBar;
