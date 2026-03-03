import { useState } from "react";
import { FiPlay, FiRefreshCw } from "react-icons/fi";

type ProductGroup = {
  id: string;
  name: string;
  products_ids?: Array<string | number>;
};

type SelectedGroupsDisplayProps = {
  selectedGroups: string[];
  productGroups: ProductGroup[];
  getSelectedGroups: () => ProductGroup[];
  currentProducts: unknown[][] | unknown[];
  selectedState: string;
  onLoadProducts: () => Promise<void> | void;
  onClearSelection: () => void;
  theme?: "blue" | "green";
};

const SelectedGroupsDisplay = ({
  selectedGroups,
  productGroups,
  getSelectedGroups,
  currentProducts,
  selectedState,
  onLoadProducts,
  onClearSelection,
  theme = "blue", // "blue" or "green"
}: SelectedGroupsDisplayProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const getThemeClasses = () => {
    const themes = {
      blue: {
        container: "border bg-surface border-border",
        indicator: "bg-primary",
        badge: "bg-primary-glow text-primary-light",
        groupTag: "border bg-elevated border-border text-fg",
        groupTagCount: "bg-primary-glow",
        statsBox: "border bg-elevated border-border",
        statsTitle: "text-fg",
        statsLabel: "text-fg-secondary",
        loadButton: "btn-primary",
        text: "text-fg",
        progressText: "text-fg-secondary",
        progressIndicator: "bg-primary",
      },
      green: {
        container: "border bg-surface border-border",
        indicator: "bg-success",
        badge: "bg-success/20 text-success-light",
        groupTag: "border bg-elevated border-border text-fg",
        groupTagCount: "bg-success/20",
        statsBox: "border bg-elevated border-border",
        statsTitle: "text-fg",
        statsLabel: "text-fg-secondary",
        loadButton: "btn-success",
        text: "text-fg",
        progressText: "text-fg-secondary",
        progressIndicator: "bg-success",
      },
    };
    return themes[theme] || themes.blue;
  };

  const themeClasses = getThemeClasses();

  const handleLoadProducts = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await onLoadProducts();
    } finally {
      setIsLoading(false);
    }
  };

  const loadedProductsCount = (() => {
    if (!Array.isArray(currentProducts)) return 0;
    let count = 0;
    for (const group of currentProducts as unknown[]) {
      count += Array.isArray(group) ? group.length : 1;
    }
    return count;
  })();

  return (
    <div className={`${themeClasses.container} rounded-xl p-4 shadow-lg`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <div
              className={`w-2 h-2 ${themeClasses.indicator} rounded-full animate-pulse`}
            ></div>
            <h4 className={`text-sm font-semibold ${themeClasses.text}`}>
              Selected Groups
            </h4>
            <div
              className={`px-2 py-1 ${themeClasses.badge} rounded-full text-xs font-medium`}
            >
              {selectedGroups.length} of {productGroups.length}
            </div>
          </div>

          {/* Show All Group Names with Tags */}
          <div className="flex flex-wrap gap-2 mb-3 max-h-32 overflow-y-auto custom-scrollbar">
            {getSelectedGroups().map((group) => (
              <div
                key={group.id}
                className={`flex items-center gap-2 px-3 py-1.5 ${themeClasses.groupTag} rounded-lg text-xs`}
              >
                <span
                  className="font-medium truncate max-w-37.5"
                  title={group.name}
                >
                  {group.name}
                </span>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className={`${themeClasses.statsBox} rounded-lg p-2`}>
              <div className={`text-sm font-bold ${themeClasses.statsTitle}`}>
                {getSelectedGroups().reduce(
                  (total, group) => total + (group.products_ids?.length || 0),
                  0,
                )}
              </div>
              <div className={`text-xs ${themeClasses.statsLabel}`}>
                Total Products
              </div>
            </div>
            <div className={`${themeClasses.statsBox} rounded-lg p-2`}>
              <div className={`text-sm font-bold ${themeClasses.statsTitle}`}>
                {loadedProductsCount}
              </div>
              <div className={`text-xs ${themeClasses.statsLabel}`}>Loaded</div>
            </div>
            <div className={`${themeClasses.statsBox} rounded-lg p-2`}>
              <div className={`text-sm font-bold ${themeClasses.statsTitle}`}>
                {selectedState}
              </div>
              <div className={`text-xs ${themeClasses.statsLabel}`}>
                State Filter
              </div>
            </div>
          </div>
        </div>

        {/* Load Products Button */}
        <div className="ml-4 flex flex-col gap-2">
          <button
            onClick={handleLoadProducts}
            disabled={isLoading}
            className={`${themeClasses.loadButton} flex items-center gap-2 ${
              isLoading ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <>
                <FiRefreshCw className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <FiPlay className="w-4 h-4" />
                Load Products
              </>
            )}
          </button>

          {/* Clear Selection Button */}
          <button
            onClick={onClearSelection}
            disabled={isLoading}
            className={`btn-neutral py-1.5! text-xs ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mt-3 pt-3 border-t border-border">
        <div
          className={`flex items-center justify-between text-xs ${themeClasses.progressText}`}
        >
          <span>
            {isLoading ? "Loading products..." : "Ready to load products"}
          </span>
          <div className="flex items-center gap-1">
            <div
              className={`w-1.5 h-1.5 ${
                themeClasses.progressIndicator
              } rounded-full ${isLoading ? "animate-spin" : "animate-pulse"}`}
            ></div>
            <span>{isLoading ? "Processing" : "Active selection"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedGroupsDisplay;
