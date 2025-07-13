import { Icon } from "@/common/Icon";
import {
  FilterDisplayControl,
  TitleToggleControl,
  VisualizationToggleButton,
} from "@/config/common";
import { ConditionalFormatsControl } from "@/config/common/controls/ConditionalFormatsControl";
import { useGridStore } from "@/store/gridStore";
import type { TableWidget, Widget } from "@/types/widget";
import React from "react";
import {
  TableAlignmentSection,
  TableControlsContainer,
  TableDisplayModeSection,
  TablePreviewContainer,
  TableStyleControlsSection,
  TableTotalRowSection,
} from "./visualization";

interface VisualizationConfigProps {
  widget: Widget;
}

export const VisualizationConfig: React.FC<VisualizationConfigProps> = ({
  widget,
}) => {
  const { updateWidget } = useGridStore();

  // Type guard and early return for non-table widgets
  if (widget.type !== "table") {
    return (
      <div className="table-config__placeholder">
        <Icon name="warning" size={32} />
        <span>Tipo de widget no compatible</span>
        <p>Esta configuración solo está disponible para widgets de tabla</p>
      </div>
    );
  }

  const tableWidget = widget as TableWidget;
  const conditionalFormats =
    tableWidget.config.visualization?.conditionalFormats || [];

  // Get current configuration values with defaults
  const visualization = tableWidget.config.visualization || {};
  const showTitle = visualization.showTitle !== false;
  const isCompact = visualization.compact === true;
  const showBorders = visualization.showBorders !== false;
  const alternateRows = visualization.alternateRowColors === true;
  const showPagination = visualization.showPagination !== false;
  const showHeaderBackground = visualization.showHeaderBackground !== false;
  const textAlign = visualization.textAlign || "left";
  const totalRow = visualization.totalRow || "top";
  const filterDisplayMode = visualization.filterDisplayMode;

  // Handler for title toggle
  const handleToggleTitle = (show: boolean) => {
    updateWidget(tableWidget._id, {
      config: {
        ...tableWidget.config,
        visualization: {
          ...visualization,
          showTitle: show,
        },
      },
    });
  };

  // Handler for pagination toggle
  const handleTogglePagination = () => {
    updateWidget(tableWidget._id, {
      config: {
        ...tableWidget.config,
        visualization: {
          ...visualization,
          showPagination: !showPagination,
        },
      },
    });
  };

  // Handler for filter display mode
  const handleFilterDisplayMode = (mode: "badges" | "info") => {
    let newMode: "badges" | "info" | "hidden" | undefined;

    if (mode === filterDisplayMode) {
      newMode = "hidden"; // Hide filters if clicking active option
    } else {
      newMode = mode; // Activate clicked option
    }

    updateWidget(tableWidget._id, {
      config: {
        ...tableWidget.config,
        visualization: {
          ...visualization,
          filterDisplayMode: newMode,
        },
      },
    });
  };

  // Top controls: Title and Alignment
  const topControls = (
    <>
      <TitleToggleControl
        widget={tableWidget}
        showTitle={showTitle}
        onToggleTitle={handleToggleTitle}
      />
      <TableAlignmentSection widget={tableWidget} textAlign={textAlign} />
    </>
  );

  // Right controls: Style options
  const rightControls = (
    <TableStyleControlsSection
      widget={tableWidget}
      showHeaderBackground={showHeaderBackground}
      alternateRows={alternateRows}
      showBorders={showBorders}
    />
  );

  // Bottom controls: Pagination
  const bottomControls = (
    <div className="viz-control-with-label">
      <VisualizationToggleButton
        isActive={showPagination}
        onClick={handleTogglePagination}
        icon="list-ordered"
        tooltipId="pagination-tooltip"
        tooltipContent="Mostrar paginación"
      />
      <span className="viz-control-label">Paginación</span>
    </div>
  );

  return (
    <div className="viz-config">
      {/* Table Preview with Controls */}
      <TableControlsContainer
        topControls={topControls}
        rightControls={rightControls}
        bottomControls={bottomControls}
      >
        <TablePreviewContainer
          isCompact={isCompact}
          showBorders={showBorders}
          alternateRows={alternateRows}
          textAlign={textAlign}
          showHeaderBackground={showHeaderBackground}
        />
      </TableControlsContainer>

      {/* Configuration Sections */}
      <div className="viz-config-sections-container">
        {/* Total Row Position */}
        <TableTotalRowSection widget={tableWidget} totalRow={totalRow} />

        {/* Display Mode (Compact/Relaxed) */}
        <TableDisplayModeSection widget={tableWidget} isCompact={isCompact} />

        {/* Filter Display Mode */}
        <FilterDisplayControl
          widget={tableWidget}
          filterDisplayMode={filterDisplayMode}
          onFilterDisplayModeChange={handleFilterDisplayMode}
        />

        {/* Conditional Formats */}
        <ConditionalFormatsControl
          widget={tableWidget}
          columns={tableWidget.config.columns}
          conditionalFormats={conditionalFormats}
        />
      </div>
    </div>
  );
};
