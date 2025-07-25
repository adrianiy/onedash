import { Icon } from "@/common/Icon";
import { useConditionalFormatting } from "@/hooks";
import { useTableDataQuery } from "@/hooks/queries";
import { useVariableStore } from "@/store/variableStore";
import type { IndicatorType, MetricDefinition } from "@/types/metricConfig";
import { getDisplayTitle } from "@/types/metricConfig";
import type { TableWidget as TableWidgetType } from "@/types/widget";
import { formatValue } from "@/utils/format";
import { calculateTotals } from "@/utils/generateTableData";
import { resolveMetricDefinition } from "@/utils/variableResolver";
import React, { useEffect, useMemo, useState } from "react";
import { WidgetPlaceholder } from "../config/common";
import { WidgetSkeleton } from "./skeletons/WidgetSkeleton";

// Tipo ampliado para incluir "desglose"
type ExtendedIndicatorType = IndicatorType | "desglose";

// Interfaz extendida para las columnas de tabla
interface ExtendedColumnDefinition extends Omit<MetricDefinition, "indicator"> {
  visible?: boolean;
  key?: string;
  isBreakdown?: boolean;
  indicator: ExtendedIndicatorType;
}

// Interfaz para datos jerárquicos
interface HierarchicalData {
  id: string;
  value: string;
  level: number;
  path: string[];
  metrics: Record<string, unknown>;
  children?: HierarchicalData[];
  isExpanded?: boolean;
  parent?: string;
}

// Tipo de ordenación
type SortDirection = "asc" | "desc" | null;

interface TableWidgetProps {
  widget: TableWidgetType;
}

export const TableWidget: React.FC<TableWidgetProps> = ({ widget }) => {
  // Obtener variables para actualizar títulos dinámicos
  const { variables } = useVariableStore();
  // Preparar filtros para la consulta
  const widgetFilters = {
    products: widget.config.widgetFilters?.products,
    sections: widget.config.widgetFilters?.sections,
    dateRange: widget.config.widgetFilters?.dateRange,
  };
  // Use common conditional formatting hook
  const conditionalFormats =
    widget.config.visualization?.conditionalFormats || [];
  const { getConditionalStyle } = useConditionalFormatting(conditionalFormats);

  // Estado inicial
  const [totals, setTotals] = useState<Record<string, unknown>>({});

  // Estado para ordenación (por defecto ordenado por la primera métrica)
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: SortDirection;
  }>({ key: "", direction: null });

  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);

  // Estado para filas seleccionadas (usando IDs de nodos para jerarquía)
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Estado para filas expandidas (por id de la fila)
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Determine current configuration step
  const hasBreakdownLevels =
    widget.config.breakdownLevels && widget.config.breakdownLevels.length > 0;
  const hasColumns = widget.config.columns && widget.config.columns.length > 0;

  // Resolver variables en las columnas
  const resolvedColumns = useMemo(() => {
    if (!widget.config.columns || !widget.config.columns.length) return [];

    return widget.config.columns.map((col) =>
      resolveMetricDefinition(col, variables)
    );
  }, [widget.config.columns, variables]);

  // Obtener datos de la tabla usando React Query
  const {
    data: tableData = [],
    isLoading,
    isError,
    error,
  } = useTableDataQuery(
    resolvedColumns,
    widget.config.breakdownLevels || [],
    widgetFilters
  );

  // Calcular totales cuando llegan los datos
  useMemo(() => {
    if (tableData && tableData.length > 0 && resolvedColumns.length > 0) {
      const calculatedTotals = calculateTotals(tableData, resolvedColumns);
      setTotals(calculatedTotals);
    }
  }, [tableData, resolvedColumns]);

  // Transformar los datos planos en estructura jerárquica y calcular valores acumulados para nodos intermedios
  const transformDataToHierarchical = useMemo(() => {
    if (!hasBreakdownLevels || !hasColumns || !tableData.length) return [];

    const breakdownLevels = widget.config.breakdownLevels as string[];
    if (breakdownLevels.length === 0) return [];

    // El resultado final: una estructura jerárquica
    const result: HierarchicalData[] = [];
    // Mapa para llevar un seguimiento de los elementos por path
    const nodesMap: Record<string, HierarchicalData> = {};

    // Procesar cada fila de datos
    tableData.forEach((row, rowIndex) => {
      // Recorrer cada nivel de desglose
      let currentPath: string[] = [];
      let parentPath: string = "";

      breakdownLevels.forEach((levelId, levelIndex) => {
        const value = String(row[levelId] || "");
        currentPath = [...currentPath, `${levelId}:${value}`];
        const pathKey = currentPath.join("|");

        // Si este nodo ya existe, lo usamos
        if (nodesMap[pathKey]) {
          if (levelIndex === breakdownLevels.length - 1) {
            // En el último nivel, actualizar las métricas
            nodesMap[pathKey].metrics = { ...row };
          }

          // Movernos al siguiente nivel
          parentPath = pathKey;
          return;
        }

        // Crear un nuevo nodo para este nivel
        const newNode: HierarchicalData = {
          id: `${rowIndex}-${levelId}-${value}`,
          value,
          level: levelIndex,
          path: [...currentPath],
          metrics: levelIndex === breakdownLevels.length - 1 ? { ...row } : {},
          children: [],
          isExpanded: false,
          parent: parentPath,
        };

        // Añadir al mapa para referencias futuras
        nodesMap[pathKey] = newNode;

        // Añadir al nivel correcto
        if (parentPath) {
          nodesMap[parentPath].children = nodesMap[parentPath].children || [];
          nodesMap[parentPath].children!.push(newNode);
        } else {
          result.push(newNode);
        }

        // Movernos al siguiente nivel
        parentPath = pathKey;
      });
    });

    // Acumular valores de hijos a padres para todos los nodos
    function accumulateChildrenValues(node: HierarchicalData) {
      if (!node.children || node.children.length === 0) {
        return node.metrics; // Devolver las métricas directamente para nodos hoja
      }

      // Procesar los hijos primero (bottom-up)
      const childrenMetrics = node.children.map(accumulateChildrenValues);

      // Acumular métricas de los hijos
      const accumulatedMetrics: Record<string, unknown> = {};

      // Iterar sobre las columnas para acumular valores
      widget.config.columns.forEach((col) => {
        const columnId = col.id;

        // Solo acumular valores numéricos
        const values = childrenMetrics
          .map((metrics) => metrics[columnId])
          .filter((value): value is number => typeof value === "number");

        if (values.length > 0) {
          // Si es una columna de bruto, asegurar que no sea negativa
          if (col.modifiers.saleType === "bruto") {
            accumulatedMetrics[columnId] = Math.max(
              0,
              values.reduce((sum, val) => sum + val, 0)
            );
          } else {
            accumulatedMetrics[columnId] = values.reduce(
              (sum, val) => sum + val,
              0
            );
          }
        }
      });

      // Actualizar las métricas del nodo con los valores acumulados
      node.metrics = accumulatedMetrics;

      return accumulatedMetrics;
    }

    // Aplicar la acumulación a todos los nodos de primer nivel
    result.forEach(accumulateChildrenValues);

    // Ordenar los datos jerárquicos si hay una clave de ordenación
    if (sortConfig.key && sortConfig.direction) {
      // Función recursiva para ordenar los nodos y sus hijos
      const sortHierarchicalNodes = (nodes: HierarchicalData[]) => {
        // Ordenar los nodos actuales
        nodes.sort((a, b) => {
          const aValue = a.metrics[sortConfig.key];
          const bValue = b.metrics[sortConfig.key];

          if (aValue === bValue) return 0;

          // Manejar diferentes tipos de datos
          if (typeof aValue === "number" && typeof bValue === "number") {
            return sortConfig.direction === "asc"
              ? aValue - bValue
              : bValue - aValue;
          }

          // Ordenación por cadena para otros tipos
          const aString = String(aValue || "");
          const bString = String(bValue || "");

          return sortConfig.direction === "asc"
            ? aString.localeCompare(bString)
            : bString.localeCompare(aString);
        });

        // Ordenar los hijos de cada nodo recursivamente
        for (const node of nodes) {
          if (node.children && node.children.length > 0) {
            sortHierarchicalNodes(node.children);
          }
        }

        return nodes;
      };

      // Aplicar la ordenación a todos los nodos
      sortHierarchicalNodes(result);
    }

    return result;
  }, [
    tableData,
    widget.config.breakdownLevels,
    widget.config.columns,
    hasBreakdownLevels,
    hasColumns,
    sortConfig, // Añadir sortConfig a las dependencias para que se recalcule al cambiar la ordenación
  ]);

  // Función para expandir/contraer filas
  const toggleRowExpansion = (rowId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  // Organizar columnas: la primera siempre debe ser la columna de desglose
  const organizedColumns = useMemo(() => {
    if (!hasColumns || !hasBreakdownLevels) return [];

    const breakdownLevels = widget.config.breakdownLevels as string[];
    if (!breakdownLevels.length) return [];

    // Primera columna: la de desglose (usamos el primer nivel)
    const mainBreakdownId = breakdownLevels[0];

    // Filtrar columnas visibles
    const columns = (resolvedColumns as ExtendedColumnDefinition[]).filter(
      (col) => col.visible !== false
    );

    // La columna de desglose
    const breakdownColumn: ExtendedColumnDefinition = {
      id: mainBreakdownId,
      title: "Desglose", // Podemos buscar un título más descriptivo si es necesario
      visible: true,
      isBreakdown: true,
      modifiers: { calculation: "valor" }, // Dummy para cumplir con la interfaz
      indicator: "desglose",
    };

    // Las columnas métricas con títulos actualizados
    const metricColumns = columns
      .filter((col) => !breakdownLevels.includes(col.id))
      .map((col) => ({
        ...col,
        // Usar la nueva función getDisplayTitle que maneja la prioridad correctamente
        // Solo aplicar a columnas que no sean de desglose
        title:
          col.indicator !== "desglose"
            ? getDisplayTitle(col as MetricDefinition, variables)
            : col.title,
      }));

    return [breakdownColumn, ...metricColumns];
  }, [
    resolvedColumns,
    widget.config.breakdownLevels,
    hasColumns,
    hasBreakdownLevels,
    variables, // Añadir variables como dependencia
  ]);

  // Función para ordenar datos (independientemente de si hay datos)
  const sortedData = useMemo(() => {
    if (!tableData) return [];

    const dataToSort = [...tableData];

    if (sortConfig.key && sortConfig.direction) {
      return dataToSort.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === bValue) return 0;

        // Manejar diferentes tipos de datos
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc"
            ? aValue - bValue
            : bValue - aValue;
        }

        // Ordenación por cadena para otros tipos
        const aString = String(aValue || "");
        const bString = String(bValue || "");

        return sortConfig.direction === "asc"
          ? aString.localeCompare(bString)
          : bString.localeCompare(aString);
      });
    }

    return dataToSort;
  }, [tableData, sortConfig]);

  // Calcular paginación en base a datos ordenados
  const { currentRows, totalPages, indexOfFirstRow } = useMemo(() => {
    const indexOfLastRow = currentPage * rowsPerPage;
    const firstRowIndex = indexOfLastRow - rowsPerPage;

    return {
      currentRows: sortedData.slice(firstRowIndex, indexOfLastRow),
      totalPages: Math.ceil(sortedData.length / rowsPerPage),
      indexOfFirstRow: firstRowIndex,
    };
  }, [sortedData, currentPage, rowsPerPage]);

  // Establecer ordenación inicial por la primera métrica cuando las columnas estén disponibles
  useEffect(() => {
    if (hasColumns && organizedColumns.length > 1) {
      // La primera columna después del desglose (índice 1) es la primera métrica
      const firstMetricColumn = organizedColumns[1];
      if (firstMetricColumn && !sortConfig.key) {
        setSortConfig({
          key: firstMetricColumn.key || firstMetricColumn.id,
          direction: "desc",
        });
      }
    }
  }, [hasColumns, organizedColumns, sortConfig.key]);

  // Show placeholder if table is not fully configured
  if (!hasBreakdownLevels || !hasColumns) {
    return (
      <WidgetPlaceholder
        icon="table"
        title="Tabla sin configurar"
        description="Configura desgloses y columnas o carga un preset"
      />
    );
  }

  // Show skeleton while loading
  if (isLoading) {
    return <WidgetSkeleton className="table-widget-skeleton" />;
  }

  // Show error placeholder if there was an error
  if (isError || !tableData) {
    return (
      <WidgetPlaceholder
        icon="alert-circle"
        title="Error al cargar datos"
        description={
          error?.message || "No se pudieron obtener los datos de la tabla"
        }
      />
    );
  }

  // Función para manejar la ordenación de columnas
  const handleSort = (key: string) => {
    let direction: SortDirection = "asc";

    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    } else if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = null;
    }

    setSortConfig({ key, direction });
  };

  // Navegación de páginas
  const nextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  // Toggle selección de fila (con manejo de jerarquía)
  const toggleRowSelection = (nodeId: string) => {
    setSelectedRows((prev) => {
      if (prev.includes(nodeId)) {
        return prev.filter((id) => id !== nodeId);
      } else {
        return [...prev, nodeId];
      }
    });
  };

  // Icono para indicar la dirección de ordenación
  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null;

    if (sortConfig.direction === "asc") {
      return (
        <Icon name="chevron-up" size={14} className="table-widget__sort-icon" />
      );
    }

    if (sortConfig.direction === "desc") {
      return (
        <Icon
          name="chevron-down"
          size={14}
          className="table-widget__sort-icon"
        />
      );
    }

    return null;
  };

  // Renderizar el formato de valores según tipo
  const renderCellValue = (
    value: unknown,
    column: ExtendedColumnDefinition
  ) => {
    if (value === null || value === undefined) return "";

    // Si es un número, formatear según tipo
    if (typeof value === "number") {
      // Para métricas de crecimiento, mostrar clase de color según signo
      if (column.modifiers.calculation === "crecimiento") {
        return <span>{formatValue(value, "crecimiento")}</span>;
      }

      // Para otros tipos numéricos, usar formatValue según el tipo de cálculo
      return formatValue(
        value,
        (column.modifiers.calculation || "default") as string
      );
    }

    return String(value);
  };

  // Obtener opciones de visualización
  const visualization = widget.config.visualization || {};
  const isCompact = visualization.compact === true;
  const showBorders = visualization.showBorders !== false;
  const alternateRowColors = visualization.alternateRowColors === true;
  const showHeaderBackground = visualization.showHeaderBackground !== false;
  const textAlign = visualization.textAlign || "left";
  const showPagination = visualization.showPagination !== false;
  const totalRow = visualization.totalRow || "top";

  // Renderizar una fila jerárquica con sus hijos (recursiva)
  const renderHierarchicalRow = (
    node: HierarchicalData,
    index: number,
    level: number = 0
  ): React.ReactNode[] => {
    const isExpanded = expandedRows[node.id] || false;
    const hasChildren = node.children && node.children.length > 0;

    // Clase para el sangrado según nivel
    const indentClass = level > 0 ? `table-widget__tr--indent-${level}` : "";

    // Aplicar clase para filas alternas si está habilitado
    const alternateClass =
      alternateRowColors && index % 2 !== 0
        ? "table-widget__tr--alternate"
        : "";

    // Fila principal
    const mainRow = (
      <tr
        key={node.id}
        className={`table-widget__tr ${indentClass} ${alternateClass} ${
          selectedRows.includes(node.id) ? "table-widget__tr--selected" : ""
        }`}
        onClick={() => toggleRowSelection(node.id)}
      >
        {organizedColumns.map((col) => {
          const cellValue = node.metrics[col.id];
          const cellStyle = getConditionalStyle(col.id, cellValue);
          return (
            <td
              key={col.key || col.id}
              className="table-widget__td"
              style={cellStyle}
            >
              {col.isBreakdown ? (
                <div className="table-widget__breakdown-cell">
                  <div
                    className="table-widget__breakdown-content"
                    style={{ paddingLeft: `${level * 8}px` }}
                  >
                    {hasChildren && (
                      <button
                        className="table-widget__expand-btn"
                        onClick={(e) => {
                          e.stopPropagation(); // Evitar propagar al onClick del tr
                          toggleRowExpansion(node.id);
                        }}
                      >
                        <Icon
                          name={isExpanded ? "chevron-down" : "chevron-right"} // Usar chevron-down/right
                          size={14}
                        />
                      </button>
                    )}
                    {!hasChildren && level > 0 && (
                      <span className="table-widget__level-spacer"></span>
                    )}
                    <span className="table-widget__breakdown-value">
                      {node.value}
                    </span>
                  </div>
                </div>
              ) : (
                renderCellValue(cellValue, col)
              )}
            </td>
          );
        })}
      </tr>
    );

    // Si tiene hijos y está expandido, renderizar también los hijos
    if (hasChildren && isExpanded) {
      return [
        mainRow,
        ...node.children!.flatMap((child, childIndex) =>
          renderHierarchicalRow(child, index + childIndex + 1, level + 1)
        ),
      ];
    }

    return [mainRow];
  };

  // Función para renderizar filas jerárquicas
  const renderHierarchicalRows = () => {
    // Usar la estructura jerárquica
    const hierarchicalData = transformDataToHierarchical;

    // Si no hay datos jerárquicos, mostrar los datos planos
    if (!hierarchicalData.length) {
      return currentRows.map((row, index) => {
        const flatRowId = `flat-${indexOfFirstRow + index}`;
        return (
          <tr
            key={flatRowId}
            className={`table-widget__tr ${
              selectedRows.includes(flatRowId)
                ? "table-widget__tr--selected"
                : ""
            }`}
            onClick={() => toggleRowSelection(flatRowId)}
          >
            {organizedColumns.map((col) => {
              const cellValue = row[col.key || col.id];
              const cellStyle = getConditionalStyle(col.id, cellValue);
              return (
                <td
                  key={col.key || col.id}
                  className="table-widget__td"
                  style={cellStyle}
                >
                  {col.isBreakdown ? (
                    <div className="table-widget__breakdown-cell">
                      <span className="table-widget__breakdown-value">
                        {renderCellValue(row[col.id], col)}
                      </span>
                    </div>
                  ) : (
                    renderCellValue(cellValue, col)
                  )}
                </td>
              );
            })}
          </tr>
        );
      });
    }

    // Renderizar las filas jerárquicas
    return hierarchicalData.flatMap((node, index) =>
      renderHierarchicalRow(node, index)
    );
  };

  return (
    <div className="table-widget">
      <div className="table-container">
        <table
          className={`table-widget__table ${
            isCompact ? "table-widget__table--compact" : ""
          } ${
            showBorders
              ? "table-widget__table--bordered"
              : "table-widget__table--borderless"
          } ${!showHeaderBackground ? "table-widget__table--no-header-bg" : ""}
          ${textAlign !== "left" ? `table-widget__table--${textAlign}` : ""}`}
        >
          <thead className="table-widget__header">
            <tr>
              {organizedColumns.map((col) => (
                <th
                  key={col.key || col.id}
                  className={`table-widget__th table-widget__th--sortable ${
                    col.isBreakdown ? "table-widget__th--breakdown" : ""
                  }`}
                  onClick={() => handleSort(col.key || col.id)}
                >
                  {col.title}
                  {getSortIcon(col.key || col.id)}
                </th>
              ))}
            </tr>
            {/* Fila de total arriba */}
            {totalRow === "top" && (
              <tr className="table-widget__total-row table-widget__total-row--top">
                {organizedColumns.map((col, index) => {
                  const cellValue = totals[col.id];
                  const cellStyle =
                    index > 0 ? getConditionalStyle(col.id, cellValue) : {};
                  return (
                    <th
                      key={col.key || col.id}
                      className="table-widget__total-cell table-widget__total-cell--header"
                      style={cellStyle}
                    >
                      {index === 0 ? (
                        <span className="table-widget__total-label">Total</span>
                      ) : (
                        renderCellValue(cellValue, col)
                      )}
                    </th>
                  );
                })}
              </tr>
            )}
          </thead>

          <tbody>{renderHierarchicalRows()}</tbody>

          {/* Fila de total abajo */}
          {totalRow === "bottom" && (
            <tfoot className="table-widget__footer">
              <tr className="table-widget__total-row table-widget__total-row--bottom">
                {organizedColumns.map((col, index) => (
                  <td
                    key={col.key || col.id}
                    className="table-widget__total-cell"
                  >
                    {index === 0 ? (
                      <span className="table-widget__total-label">Total</span>
                    ) : (
                      renderCellValue(totals[col.id], col)
                    )}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && showPagination && (
        <div className="table-widget__pagination">
          <div className="table-widget__page-info">
            Página {currentPage} de {totalPages} ({tableData.length} filas)
          </div>
          <div className="table-widget__pagination-controls">
            <button
              className="table-widget__page-btn"
              onClick={prevPage}
              disabled={currentPage === 1}
            >
              <Icon name="chevron-up" size={14} />
            </button>
            <button
              className="table-widget__page-btn"
              onClick={nextPage}
              disabled={currentPage === totalPages}
            >
              <Icon name="chevron-down" size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
