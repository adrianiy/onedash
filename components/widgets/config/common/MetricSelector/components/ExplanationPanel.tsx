import React from "react";
import { Icon } from "@/common/Icon";

interface ExplanationPanelProps {
  explanation: string;
}

const ExplanationPanel: React.FC<ExplanationPanelProps> = ({ explanation }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleExpand = (event: React.MouseEvent) => {
    event.preventDefault();
    setIsExpanded(!isExpanded);
  };

  if (!explanation) return null;

  return (
    <div
      className={`metric-selector__search-results-explanation ${
        isExpanded
          ? "metric-selector__search-results-explanation--expanded"
          : ""
      }`}
    >
      <div
        className="metric-selector__search-results-explanation-header"
        onClick={handleExpand}
      >
        <Icon name="info" size={16} />
        <div className="metric-selector__search-results-explanation-title">
          Explicación de la IA
        </div>
        <Icon name={isExpanded ? "chevron-up" : "chevron-down"} size={16} />
      </div>

      {isExpanded && (
        <div className="metric-selector__search-results-explanation-content">
          <p>{explanation}</p>
        </div>
      )}
    </div>
  );
};

export default ExplanationPanel;
