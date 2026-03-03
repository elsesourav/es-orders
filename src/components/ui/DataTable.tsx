import type { ComponentType, CSSProperties, ReactNode } from "react";

type TableRow = {
  id?: string | number;
  showAction?: boolean;
  [key: string]: unknown;
};

type TableHeader = {
  key: string;
  label: string;
  width?: CSSProperties["width"];
  className?: string;
  render?: (row: TableRow, rowIndex: number) => ReactNode;
};

type DataTableProps = {
  headers?: TableHeader[];
  data?: TableRow[];
  onRowAction?: (row: TableRow, rowIndex: number) => void;
  actionLabel?: string;
  actionIcon?: ComponentType;
  onSecondaryAction?: (row: TableRow, rowIndex: number) => void;
  secondaryActionLabel?: string;
  secondaryActionIcon?: ComponentType;
  noDataMessage?: string;
  className?: string;
  showActions?: boolean;
  loading?: boolean;
  onRowClick?: (row: TableRow, rowIndex: number) => void;
  striped?: boolean;
  hover?: boolean;
  compact?: boolean;
  renderRowPrefix?: (row: TableRow, rowIndex: number) => ReactNode;
};

const DataTable = ({
  headers = [],
  data = [],
  onRowAction,
  actionLabel = "Edit",
  actionIcon: ActionIcon,
  onSecondaryAction,
  secondaryActionLabel = "Delete",
  secondaryActionIcon: SecondaryActionIcon,
  noDataMessage = "No data available",
  className = "",
  showActions = true,
  loading = false,
  onRowClick,
  striped = true,
  hover = true,
  compact = false,
  renderRowPrefix,
}: DataTableProps) => {
  if (loading) {
    return (
      <div className="text-center py-8 text-muted">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2">Loading...</p>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border shadow-lg bg-surface border-border ${className}`}
    >
      {/* Table Header */}
      <div
        className={`flex gap-2 px-4 font-semibold text-sm rounded-t-2xl bg-elevated text-fg ${compact ? "py-1" : "py-2"}`}
      >
        {renderRowPrefix && <div className="w-8"></div>}
        {headers.map((header, index) => (
          <p
            key={index}
            className={`${header.className || ""} text-left`}
            style={{ width: header.width }}
          >
            {header.label}
          </p>
        ))}
        {showActions && <p className="w-16 text-center">Actions</p>}
      </div>

      {/* Table Body */}
      <div className="custom-scrollbar overflow-y-auto max-h-96">
        {data.length === 0 ? (
          <div className="text-center py-4 text-muted bg-deep">
            {noDataMessage}
          </div>
        ) : (
          data.map((row, rowIndex) => (
            <div
              key={row.id || rowIndex}
              className={`flex items-center gap-2 border-t border-border ${hover ? "hover:opacity-80" : ""} ${striped && rowIndex % 2 === 0 ? "bg-black/10" : ""} transition-colors duration-150 group px-4 ${compact ? "py-2" : "py-3"} ${onRowClick ? "cursor-pointer" : ""}`}
              onClick={() => onRowClick && onRowClick(row, rowIndex)}
            >
              {renderRowPrefix && (
                <div className="w-8">{renderRowPrefix(row, rowIndex)}</div>
              )}
              {headers.map((header, colIndex) => (
                <div
                  key={colIndex}
                  className={`${header.className || ""} text-left ${colIndex === 0 ? "text-fg" : "text-fg-secondary"}`}
                  style={{ width: header.width }}
                >
                  {header.render
                    ? header.render(row, rowIndex)
                    : (row[header.key] as ReactNode) || "-"}
                </div>
              ))}
              {showActions && (
                <div className="w-16 flex gap-2 justify-center">
                  {onRowAction && row.showAction !== false && (
                    <button
                      className="flex items-center gap-1 cursor-pointer transition-colors text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowAction(row, rowIndex);
                      }}
                      title={actionLabel}
                    >
                      {ActionIcon && <ActionIcon />}
                    </button>
                  )}
                  {onSecondaryAction && row.showAction !== false && (
                    <button
                      className="flex items-center gap-1 cursor-pointer transition-colors text-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSecondaryAction(row, rowIndex);
                      }}
                      title={secondaryActionLabel}
                    >
                      {SecondaryActionIcon && <SecondaryActionIcon />}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DataTable;
