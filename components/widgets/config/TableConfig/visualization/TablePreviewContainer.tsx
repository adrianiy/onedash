import React from "react";

interface TablePreviewContainerProps {
  isCompact: boolean;
  showBorders: boolean;
  alternateRows: boolean;
  textAlign: "left" | "center" | "right";
  showHeaderBackground: boolean;
}

export const TablePreviewContainer: React.FC<TablePreviewContainerProps> = ({
  isCompact,
  showBorders,
  alternateRows,
  textAlign,
  showHeaderBackground,
}) => {
  return (
    <div className="viz-table-preview">
      <table
        className={`viz-table-sample ${
          isCompact ? "viz-table-sample--compact" : ""
        } ${showBorders ? "viz-table-sample--bordered" : ""} ${
          alternateRows ? "viz-table-sample--alternating" : ""
        } ${
          !showHeaderBackground ? "viz-table-sample--no-header-bg" : ""
        } viz-table-sample--${textAlign}`}
      >
        <thead>
          <tr>
            <th>
              <div className="viz-table-placeholder viz-table-placeholder--header viz-table-placeholder--medium"></div>
            </th>
            <th>
              <div className="viz-table-placeholder viz-table-placeholder--header viz-table-placeholder--short"></div>
            </th>
            <th>
              <div className="viz-table-placeholder viz-table-placeholder--header viz-table-placeholder--short"></div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div className="viz-table-placeholder viz-table-placeholder--long"></div>
            </td>
            <td>
              <div className="viz-table-placeholder viz-table-placeholder--medium"></div>
            </td>
            <td>
              <div className="viz-table-placeholder viz-table-placeholder--short"></div>
            </td>
          </tr>
          <tr>
            <td>
              <div className="viz-table-placeholder viz-table-placeholder--medium"></div>
            </td>
            <td>
              <div className="viz-table-placeholder viz-table-placeholder--short"></div>
            </td>
            <td>
              <div className="viz-table-placeholder viz-table-placeholder--short"></div>
            </td>
          </tr>
          <tr>
            <td>
              <div className="viz-table-placeholder viz-table-placeholder--long"></div>
            </td>
            <td>
              <div className="viz-table-placeholder viz-table-placeholder--medium"></div>
            </td>
            <td>
              <div className="viz-table-placeholder viz-table-placeholder--short"></div>
            </td>
          </tr>
          <tr>
            <td>
              <div className="viz-table-placeholder viz-table-placeholder--medium"></div>
            </td>
            <td>
              <div className="viz-table-placeholder viz-table-placeholder--short"></div>
            </td>
            <td>
              <div className="viz-table-placeholder viz-table-placeholder--medium"></div>
            </td>
          </tr>
          <tr>
            <td>
              <div className="viz-table-placeholder viz-table-placeholder--short"></div>
            </td>
            <td>
              <div className="viz-table-placeholder viz-table-placeholder--long"></div>
            </td>
            <td>
              <div className="viz-table-placeholder viz-table-placeholder--short"></div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
