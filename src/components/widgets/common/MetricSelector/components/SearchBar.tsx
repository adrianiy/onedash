import React from "react";
import { Icon } from "../../../../common/Icon";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  placeholder = "Usa la IA para elegir tus métricas",
}) => {
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
      </div>
    </div>
  );
};

export default SearchBar;
