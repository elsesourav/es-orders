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
}) => {
  if (loading) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
        <p className="mt-2">Loading...</p>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full bg-white dark:bg-gray-800/70 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}
    >
      {/* Table Header */}
      <div
        className={`flex gap-2 bg-gray-50 dark:bg-gray-900/80 text-gray-700 dark:text-gray-200 px-4 font-semibold text-sm ${
          compact ? "py-1" : "py-2"
        }`}
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
        {showActions && <p className="w-20 text-center">Actions</p>}
      </div>

      {/* Table Body */}
      <div className="custom-scrollbar overflow-y-auto max-h-96">
        {data.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8 bg-gray-50 dark:bg-gray-900/60">
            {noDataMessage}
          </div>
        ) : (
          data.map((row, rowIndex) => (
            <div
              key={row.id || rowIndex}
              className={`flex items-center gap-2 border-t border-gray-200 dark:border-gray-700 ${
                hover ? "hover:bg-gray-100 dark:hover:bg-gray-700/40" : ""
              } ${
                striped && rowIndex % 2 === 0
                  ? "bg-gray-50/50 dark:bg-black/10"
                  : ""
              } transition-colors duration-150 group px-4 ${
                compact ? "py-1.5" : "py-3"
              } ${onRowClick ? "cursor-pointer" : ""}`}
              onClick={() => onRowClick && onRowClick(row, rowIndex)}
            >
              {renderRowPrefix && (
                <div className="w-8">{renderRowPrefix(row, rowIndex)}</div>
              )}
              {headers.map((header, colIndex) => (
                <div
                  key={colIndex}
                  className={`${
                    header.className || ""
                  } text-left text-gray-700 dark:text-gray-200 ${
                    colIndex === 0
                      ? "font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400"
                      : ""
                  }`}
                  style={{ width: header.width }}
                >
                  {header.render
                    ? header.render(row, rowIndex)
                    : row[header.key] || "-"}
                </div>
              ))}
              {showActions && (
                <div className="w-20 flex gap-2 justify-center">
                  {onRowAction && row.showAction !== false && (
                    <button
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer transition-colors p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowAction(row, rowIndex);
                      }}
                      title={actionLabel}
                    >
                      {ActionIcon && <ActionIcon size={16} />}
                    </button>
                  )}
                  {onSecondaryAction && row.showAction !== false && (
                    <button
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1 cursor-pointer transition-colors p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSecondaryAction(row, rowIndex);
                      }}
                      title={secondaryActionLabel}
                    >
                      {SecondaryActionIcon && <SecondaryActionIcon size={16} />}
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
