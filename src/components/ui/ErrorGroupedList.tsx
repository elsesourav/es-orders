import { useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiChevronDown,
  FiChevronRight,
  FiClipboard,
  FiX,
} from "react-icons/fi";

type FailedProduct = {
  errorMessage?: string;
  errorCode?: string;
  targetESP?: string | number;
  lastESP?: string | number;
  mrp?: string | number;
  name?: string;
  [key: string]: unknown;
};

type ErrorObject = {
  errorMessage: string;
  errorCode: string;
  listingIds: Array<string | number>;
  productIds: Array<string | number>;
  count: number;
};

type ErrorGroup = {
  key: string;
  displayName: string;
  severity: "error" | "warning" | "info";
  products: FailedProduct[];
  sampleError: string;
  errorObjects: Record<string, ErrorObject>;
};

type ErrorGroupedListProps = {
  failedProducts?: FailedProduct[];
  onClearAll?: () => void;
  productIdField?: string;
  showListingIds?: boolean;
  listingIdField?: string;
  className?: string;
};

/**
 * ErrorGroupedList Component
 * Groups failed products by error types and provides copy functionality for listing IDs
 */
export default function ErrorGroupedList({
  failedProducts = [],
  onClearAll,
  productIdField = "sku_id", // Field to use as product identifier
  showListingIds = false, // Whether to show/copy listing IDs instead
  listingIdField = "id", // Field to use for listing IDs
  className = "",
}: ErrorGroupedListProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [copiedGroup, setCopiedGroup] = useState<string | null>(null);
  const toDisplayText = (value: unknown) =>
    value === undefined || value === null ? "" : String(value);

  // Group products by error description
  const groupedErrors = useMemo(() => {
    const groups: Record<string, ErrorGroup> = {};
    const errorObjects: Record<string, ErrorObject> = {}; // Object to store error descriptions with listing IDs

    failedProducts.forEach((product: FailedProduct) => {
      // Use the exact error description as the key for grouping
      const errorDescription = product.errorMessage || "Unknown Error";
      const errorCode = product.errorCode || "UNKNOWN";

      // Create a simple key based on error description (first 100 chars for grouping)
      const errorKey = errorDescription
        .substring(0, 100)
        .replace(/[^a-zA-Z0-9]/g, "_")
        .toUpperCase();

      // Determine severity based on error code only
      let severity: "error" | "warning" | "info" = "error";
      if (errorCode === "STUCK_PRODUCT") {
        severity = "warning";
      } else if (
        errorCode === "NETWORK_ERROR" ||
        errorDescription.toLowerCase().includes("timeout")
      ) {
        severity = "warning";
      } else if (errorDescription.toLowerCase().includes("not found")) {
        severity = "info";
      }

      // Create error object with listing IDs for each unique error description
      if (!errorObjects[errorDescription]) {
        errorObjects[errorDescription] = {
          errorMessage: errorDescription,
          errorCode: errorCode,
          listingIds: [],
          productIds: [],
          count: 0,
        };
      }

      // Add listing ID and product ID to the error object
      const listingId = product[listingIdField] as string | number | undefined;
      const productId = product[productIdField] as string | number | undefined;

      if (
        listingId &&
        !errorObjects[errorDescription].listingIds.includes(listingId)
      ) {
        errorObjects[errorDescription].listingIds.push(listingId);
      }
      if (
        productId &&
        !errorObjects[errorDescription].productIds.includes(productId)
      ) {
        errorObjects[errorDescription].productIds.push(productId);
      }
      errorObjects[errorDescription].count++;

      // Create or update the group based on exact error description
      if (!groups[errorKey]) {
        groups[errorKey] = {
          key: errorKey,
          displayName:
            errorDescription.length > 60
              ? errorDescription.substring(0, 60) + "..."
              : errorDescription,
          severity,
          products: [],
          sampleError: errorDescription,
          errorObjects: {}, // Store error objects within each group
        };
      }

      groups[errorKey].products.push(product);

      // Add error object to the group
      if (!groups[errorKey].errorObjects[errorDescription]) {
        groups[errorKey].errorObjects[errorDescription] =
          errorObjects[errorDescription];
      }
    });

    // Sort groups by severity and count
    const severityOrder = { error: 0, warning: 1, info: 2 };
    return Object.values(groups).sort((a, b) => {
      const severityDiff =
        severityOrder[a.severity] - severityOrder[b.severity];
      return severityDiff !== 0
        ? severityDiff
        : b.products.length - a.products.length;
    });
  }, [failedProducts, listingIdField, productIdField]);

  // Toggle group expansion
  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  // Copy product/listing IDs to clipboard
  const copyToClipboard = async (
    products: FailedProduct[],
    groupName: string,
  ) => {
    let idsToCopy;

    if (showListingIds) {
      // Copy listing IDs
      idsToCopy = products
        .map((p) => p[listingIdField])
        .filter(Boolean)
        .join("\n");
    } else {
      // Copy product IDs (SKUs)
      idsToCopy = products
        .map((p) => p[productIdField])
        .filter(Boolean)
        .join("\n");
    }

    try {
      await navigator.clipboard.writeText(idsToCopy);
      setCopiedGroup(groupName);
      setTimeout(() => setCopiedGroup(null), 2000);
    } catch (error) {
      console.log("Failed to copy to clipboard:", error);
      // Fallback: create a temporary textarea
      const textarea = document.createElement("textarea");
      textarea.value = idsToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedGroup(groupName);
      setTimeout(() => setCopiedGroup(null), 2000);
    }
  };

  // Copy all IDs
  const copyAllIds = async () => {
    await copyToClipboard(failedProducts, "ALL");
  };

  // Copy error object (for specific error description)
  const copyErrorObject = async (
    errorObj: ErrorObject,
    errorDescription: string,
  ) => {
    const textToCopy = `Error: ${errorObj.errorMessage}\nCode: ${
      errorObj.errorCode
    }\nCount: ${errorObj.count}\nListing IDs: ${errorObj.listingIds.join(
      ", ",
    )}\nProduct IDs: ${errorObj.productIds.join(", ")}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedGroup(`ERROR_OBJ_${errorDescription}`);
      setTimeout(() => setCopiedGroup(null), 2000);
    } catch (error) {
      console.log("Failed to copy error object:", error);
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = textToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedGroup(`ERROR_OBJ_${errorDescription}`);
      setTimeout(() => setCopiedGroup(null), 2000);
    }
  };

  // Copy only listing IDs for a specific error section
  const copyErrorSectionListingIds = async (
    errorObj: ErrorObject,
    errorDescription: string,
  ) => {
    const idsToCopy = errorObj.listingIds.join("\n");

    try {
      await navigator.clipboard.writeText(idsToCopy);
      setCopiedGroup(`LISTING_${errorDescription}`);
      setTimeout(() => setCopiedGroup(null), 2000);
    } catch (error) {
      console.log("Failed to copy listing IDs:", error);
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = idsToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedGroup(`LISTING_${errorDescription}`);
      setTimeout(() => setCopiedGroup(null), 2000);
    }
  };

  // Copy only product IDs for a specific error section
  const copyErrorSectionProductIds = async (
    errorObj: ErrorObject,
    errorDescription: string,
  ) => {
    const idsToCopy = errorObj.productIds.join("\n");

    try {
      await navigator.clipboard.writeText(idsToCopy);
      setCopiedGroup(`PRODUCT_${errorDescription}`);
      setTimeout(() => setCopiedGroup(null), 2000);
    } catch (error) {
      console.log("Failed to copy product IDs:", error);
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = idsToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedGroup(`PRODUCT_${errorDescription}`);
      setTimeout(() => setCopiedGroup(null), 2000);
    }
  };

  // Get severity styles
  const getSeverityStyles = (
    severity: "error" | "warning" | "info" | string,
  ) => {
    switch (severity) {
      case "error":
        return {
          border: "border-red-600/50",
          bg: "bg-red-900/20",
          text: "text-red-300",
          icon: "text-red-400",
          badge: "bg-red-700/50 text-red-200",
        };
      case "warning":
        return {
          border: "border-yellow-600/50",
          bg: "bg-yellow-900/20",
          text: "text-yellow-300",
          icon: "text-yellow-400",
          badge: "bg-yellow-700/50 text-yellow-200",
        };
      case "info":
        return {
          border: "border-blue-600/50",
          bg: "bg-blue-900/20",
          text: "text-blue-300",
          icon: "text-blue-400",
          badge: "bg-blue-700/50 text-blue-200",
        };
      default:
        return {
          border: "border-border",
          bg: "theme-bg-elevated",
          text: "text-fg-secondary",
          icon: "text-muted",
          badge: "theme-section theme-text-secondary",
        };
    }
  };

  if (failedProducts.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with summary */}
      <div className="theme-bg-elevated rounded-lg p-4 border theme-border">
        <div className="flex justify-between items-center mb-3">
          <h4 className="theme-text-primary font-medium flex items-center gap-2">
            <FiAlertCircle className="text-red-400" />
            Failed Products Summary ({failedProducts.length} total)
          </h4>
          <div className="flex gap-2">
            <button
              onClick={copyAllIds}
              className={`btn-secondary text-xs flex items-center gap-1 ${
                copiedGroup === "ALL" ? "bg-green-600 text-white" : ""
              }`}
              title={`Copy all ${
                showListingIds ? "listing IDs" : "product IDs"
              }`}
            >
              <FiClipboard size={12} />
              {copiedGroup === "ALL"
                ? "Copied!"
                : `Copy All ${showListingIds ? "Listing IDs" : "Product IDs"}`}
            </button>
            {onClearAll && (
              <button
                onClick={onClearAll}
                className="btn-danger text-xs flex items-center gap-1"
                title="Clear all failed products"
              >
                <FiX size={12} />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-red-400 font-bold text-lg">
              {groupedErrors
                .filter((g) => g.severity === "error")
                .reduce((sum, g) => sum + g.products.length, 0)}
            </div>
            <div className="theme-text-muted">Errors</div>
          </div>
          <div className="text-center">
            <div className="text-yellow-400 font-bold text-lg">
              {groupedErrors
                .filter((g) => g.severity === "warning")
                .reduce((sum, g) => sum + g.products.length, 0)}
            </div>
            <div className="theme-text-muted">Warnings</div>
          </div>
          <div className="text-center">
            <div className="text-blue-400 font-bold text-lg">
              {groupedErrors
                .filter((g) => g.severity === "info")
                .reduce((sum, g) => sum + g.products.length, 0)}
            </div>
            <div className="theme-text-muted">Info</div>
          </div>
          <div className="text-center">
            <div className="text-purple-400 font-bold text-lg">
              {groupedErrors.length}
            </div>
            <div className="theme-text-muted">Groups</div>
          </div>
        </div>
      </div>

      {/* Error groups */}
      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        {groupedErrors.map((group) => {
          const isExpanded = expandedGroups.has(group.key);
          const styles = getSeverityStyles(group.severity);

          return (
            <div
              key={group.key}
              className={`rounded-lg border ${styles.border} ${styles.bg}`}
            >
              {/* Group header */}
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => toggleGroup(group.key)}
                    className="flex items-center gap-2 text-left flex-1 hover:opacity-80 transition-opacity"
                  >
                    {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                    <span className={`font-medium ${styles.text}`}>
                      {group.displayName}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs ${styles.badge}`}
                    >
                      {group.products.length}
                    </span>
                  </button>
                  <button
                    onClick={() => copyToClipboard(group.products, group.key)}
                    className={`btn-secondary text-xs flex items-center gap-1 ml-2 ${
                      copiedGroup === group.key ? "bg-green-600 text-white" : ""
                    }`}
                    title={`Copy ${
                      showListingIds ? "listing IDs" : "product IDs"
                    } for this group`}
                  >
                    <FiClipboard size={12} />
                    {copiedGroup === group.key ? "Copied!" : "Copy"}
                  </button>
                </div>

                {/* Sample error message (always visible) */}
                <div className="mt-2">
                  <p className={`text-xs ${styles.text} opacity-75`}>
                    Sample: {group.sampleError}
                  </p>
                </div>
              </div>

              {/* Expanded product list */}
              {isExpanded && (
                <div className="border-t theme-border-light p-3 space-y-4">
                  {/* Error Objects Section */}
                  {Object.keys(group.errorObjects).length > 1 && (
                    <div className="mb-4">
                      <h5 className={`text-sm font-medium ${styles.text} mb-2`}>
                        Specific Error Descriptions (
                        {Object.keys(group.errorObjects).length}):
                      </h5>
                      <div className="space-y-2">
                        {Object.entries(group.errorObjects).map(
                          ([errorDesc, errorObj]) => (
                            <div
                              key={errorDesc}
                              className="theme-bg-surface/30 rounded p-2 border theme-border-light"
                            >
                              <div className="flex justify-between items-start gap-2 mb-2">
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`text-xs ${styles.text} font-medium truncate`}
                                  >
                                    {errorDesc}
                                  </p>
                                  <p
                                    className={`text-xs ${styles.text} opacity-60 mt-1`}
                                  >
                                    Count: {errorObj.count} | Listing IDs:{" "}
                                    {errorObj.listingIds.length} | Product IDs:{" "}
                                    {errorObj.productIds.length}
                                  </p>
                                </div>
                                <button
                                  onClick={() =>
                                    copyErrorObject(errorObj, errorDesc)
                                  }
                                  className={`btn-secondary text-xs flex items-center gap-1 shrink-0 ${
                                    copiedGroup === `ERROR_OBJ_${errorDesc}`
                                      ? "bg-green-600 text-white"
                                      : ""
                                  }`}
                                  title="Copy error object with IDs"
                                >
                                  <FiClipboard size={10} />
                                  {copiedGroup === `ERROR_OBJ_${errorDesc}`
                                    ? "Copied!"
                                    : "Copy All"}
                                </button>
                              </div>

                              {/* Individual copy buttons for this error section */}
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() =>
                                    copyErrorSectionListingIds(
                                      errorObj,
                                      errorDesc,
                                    )
                                  }
                                  className={`btn-secondary text-xs flex items-center gap-1 ${
                                    copiedGroup === `LISTING_${errorDesc}`
                                      ? "bg-green-600 text-white"
                                      : ""
                                  }`}
                                  title="Copy only listing IDs for this error"
                                  disabled={errorObj.listingIds.length === 0}
                                >
                                  <FiClipboard size={8} />
                                  {copiedGroup === `LISTING_${errorDesc}`
                                    ? "Copied!"
                                    : `Listing IDs (${errorObj.listingIds.length})`}
                                </button>
                                <button
                                  onClick={() =>
                                    copyErrorSectionProductIds(
                                      errorObj,
                                      errorDesc,
                                    )
                                  }
                                  className={`btn-secondary text-xs flex items-center gap-1 ${
                                    copiedGroup === `PRODUCT_${errorDesc}`
                                      ? "bg-green-600 text-white"
                                      : ""
                                  }`}
                                  title="Copy only product IDs for this error"
                                  disabled={errorObj.productIds.length === 0}
                                >
                                  <FiClipboard size={8} />
                                  {copiedGroup === `PRODUCT_${errorDesc}`
                                    ? "Copied!"
                                    : `Product IDs (${errorObj.productIds.length})`}
                                </button>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {/* Products Grid */}
                  <div>
                    <h5 className={`text-sm font-medium ${styles.text} mb-2`}>
                      Products ({group.products.length}):
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto custom-scrollbar">
                      {group.products.map((product, index) => (
                        <div
                          key={index}
                          className="theme-bg-elevated rounded p-2 border theme-border-light"
                        >
                          <div
                            className={`text-xs font-mono ${styles.text} truncate font-semibold`}
                          >
                            {toDisplayText(product[productIdField])}
                          </div>
                          {showListingIds &&
                            toDisplayText(product[listingIdField]) !== "" && (
                              <div
                                className={`text-xs ${styles.text} opacity-75 truncate`}
                              >
                                ID: {toDisplayText(product[listingIdField])}
                              </div>
                            )}
                          {/* Target and Last ESP display */}
                          {(product.targetESP || product.lastESP) && (
                            <div className="flex gap-2 mt-1 text-xs">
                              {product.targetESP && (
                                <span className="text-green-400">
                                  Target: ₹{product.targetESP}
                                </span>
                              )}
                              {product.lastESP && (
                                <span className="text-yellow-400">
                                  Last: ₹{product.lastESP}
                                </span>
                              )}
                            </div>
                          )}
                          {/* MRP display */}
                          {product.mrp && (
                            <div
                              className={`text-xs ${styles.text} opacity-60`}
                            >
                              MRP: ₹{product.mrp}
                            </div>
                          )}
                          {product.name && (
                            <div
                              className={`text-xs ${styles.text} opacity-60 truncate`}
                            >
                              {product.name}
                            </div>
                          )}
                          {product.errorMessage &&
                            product.errorMessage !== group.sampleError && (
                              <div
                                className={`text-xs ${styles.text} opacity-50 mt-1 p-1 theme-bg-elevated rounded`}
                              >
                                {product.errorMessage.substring(0, 80)}
                                {product.errorMessage.length > 80 ? "..." : ""}
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
