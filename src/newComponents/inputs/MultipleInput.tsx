import type { CSSProperties, KeyboardEvent, MouseEvent } from "react";
import { useEffect, useId, useRef, useState } from "react";
import DateInput from "./DateInput";
import NumberInput from "./NumberInput";
import NumberSelectInput from "./NumberSelectInput";
import { useSelectContext } from "./SelectContext";
import TextInput from "./TextInput";

type OptionValue = string | number;

type InputOption = {
  value: OptionValue;
  label: string;
};

type FieldType = "text" | "number" | "date" | "select" | "numberSelect";

type MultipleInputProps = {
  label?: string;
  value?: OptionValue[];
  onChange: (values: OptionValue[]) => void;
  fieldType?: FieldType;
  placeholder?: string;
  defaultValue?: OptionValue[];
  options?: InputOption[];
  required?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  width?: string;
  min?: number;
  max?: number;
  step?: number;
};

type FilterableSelectInputProps = {
  value: OptionValue;
  onChange: (value: OptionValue) => void;
  options: InputOption[];
  placeholder?: string;
  index: number;
  currentValues: OptionValue[];
};

/**
 * MultipleInput - A simple input component that opens a modal to collect multiple values of one type
 *
 * @example
 * <MultipleInput
 *    label="Favorite Months"
 *    value={favoriteMonths}
 *    onChange={(months) => setFavoriteMonths(months)}
 *    fieldType="select"
 *    placeholder="Select months"
 *    options={[
 *       { value: "january", label: "January" },
 *       { value: "february", label: "February" },
 *       // ... more options
 *    ]}
 * />
 */

const MultipleInput = ({
  label,
  value = [],
  onChange,
  fieldType = "text",
  placeholder = "Click to add items",
  defaultValue = [],
  options = [],
  required = false,
  error = "",
  helperText = "",
  className = "",
  width = "w-full",
  min,
  max,
  step,
}: MultipleInputProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentValues, setCurrentValues] = useState<OptionValue[]>([]);
  const [focused, setFocused] = useState(false);

  // Use value if provided, otherwise use defaultValue
  const displayValue =
    value && value.length > 0
      ? value
      : defaultValue && defaultValue.length > 0
        ? defaultValue
        : [];

  const handleOpenModal = () => {
    const safeValue = displayValue || [];
    setCurrentValues(safeValue.length > 0 ? [...safeValue] : [""]);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const filteredValues = currentValues.filter((v) => v && v !== "");
    onChange(filteredValues);
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setCurrentValues([]);
    setIsModalOpen(false);
  };

  const addNewValue = () => {
    setCurrentValues((prev) => [...prev, ""]);
  };

  const removeValue = (index: number) => {
    if (currentValues.length > 1) {
      setCurrentValues((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const updateValue = (index: number, newValue: OptionValue) => {
    setCurrentValues((prev) => {
      const updated = [...prev];
      updated[index] = newValue;
      return updated;
    });
  };

  const handleSelectAll = () => {
    // Only works for select and numberSelect field types
    if (fieldType === "select" || fieldType === "numberSelect") {
      // Get all option values that aren't already selected
      const allValues = options.map((opt) => opt.value);
      setCurrentValues(allValues);
    }
  };

  const handleClearAll = () => {
    setCurrentValues([""]);
  };

  const handleToggleSelectAll = () => {
    // Check if all options are selected
    const allSelected =
      options.length > 0 &&
      currentValues.filter((v) => v && v !== "").length === options.length;

    if (allSelected) {
      handleClearAll();
    } else {
      handleSelectAll();
    }
  };

  // Custom FilterableSelectInput for select fields with typing/filtering
  const FilterableSelectInput = ({
    value,
    onChange,
    options,
    placeholder,
    index,
    currentValues,
  }: FilterableSelectInputProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [dropdownStyle, setDropdownStyle] = useState<CSSProperties | null>(
      null,
    );
    const containerRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const selectId = useId();
    const { registerCloseCallback, closeAllExcept } = useSelectContext();

    // Register close callback for coordinating with other selects
    useEffect(() => {
      const unregister = registerCloseCallback((exceptId) => {
        if (exceptId !== selectId && isOpen) {
          setIsOpen(false);
          if (!options.find((opt) => opt.value === value)) {
            setSearchQuery("");
          }
          setHighlightedIndex(-1);
        }
      });
      return unregister;
    }, [registerCloseCallback, selectId, isOpen, value, options]);

    // Update dropdown position when opened
    useEffect(() => {
      if (isOpen && containerRef.current) {
        const updatePosition = () => {
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setDropdownStyle({
              width: `${rect.width}px`,
              top: `${rect.bottom + 4}px`,
              left: `${rect.left}px`,
            });
          }
        };

        updatePosition();
        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition, true);

        return () => {
          window.removeEventListener("resize", updatePosition);
          window.removeEventListener("scroll", updatePosition, true);
        };
      } else {
        setDropdownStyle(null);
      }
    }, [isOpen]);

    // Filter out already selected values (except the current one)
    const availableOptions = options.filter((option) => {
      const isAlreadySelected = currentValues.some(
        (val, idx) => idx !== index && val === option.value,
      );
      return !isAlreadySelected;
    });

    const filteredOptions = availableOptions.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const selectedOption = options.find((opt) => opt.value === value);

    // Reset highlighted index when filtered options change
    useEffect(() => {
      if (filteredOptions.length > 0) {
        const selectedIdx = filteredOptions.findIndex(
          (opt) => opt.value === value,
        );
        setHighlightedIndex(selectedIdx >= 0 ? selectedIdx : 0);
      } else {
        setHighlightedIndex(-1);
      }
    }, [searchQuery, filteredOptions.length, value, filteredOptions]);

    // Scroll highlighted option into view
    useEffect(() => {
      if (highlightedIndex >= 0 && optionRefs.current[highlightedIndex]) {
        optionRefs.current[highlightedIndex].scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }, [highlightedIndex]);

    const handleSelect = (option: InputOption) => {
      onChange(option.value);
      setIsOpen(false);
      setSearchQuery("");
      setHighlightedIndex(-1);
    };

    const handleInputChange = (val: string) => {
      setSearchQuery(val);
      if (!isOpen && containerRef.current) {
        // Calculate position before opening to prevent flash at 0,0
        const rect = containerRef.current.getBoundingClientRect();
        setDropdownStyle({
          width: `${rect.width}px`,
          top: `${rect.bottom + 4}px`,
          left: `${rect.left}px`,
        });
        closeAllExcept(selectId);
        setIsOpen(true);
      }
    };

    const handleInputFocus = () => {
      if (containerRef.current) {
        // Calculate position before opening to prevent flash at 0,0
        const rect = containerRef.current.getBoundingClientRect();
        setDropdownStyle({
          width: `${rect.width}px`,
          top: `${rect.bottom + 4}px`,
          left: `${rect.left}px`,
        });
        closeAllExcept(selectId);
        setIsOpen(true);
      }
    };

    const handleClose = () => {
      setIsOpen(false);
      if (!selectedOption) {
        setSearchQuery("");
      }
      setHighlightedIndex(-1);
    };

    const handleClearSelection = (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onChange("");
      setSearchQuery("");
      setIsOpen(false);
      setHighlightedIndex(-1);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen) {
        if (e.key === "ArrowDown" || e.key === "Enter") {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1,
          );
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
            handleSelect(filteredOptions[highlightedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          handleClose();
          break;
        case "Tab":
          handleClose();
          break;
        default:
          break;
      }
    };

    const displayValue =
      searchQuery || (selectedOption ? selectedOption.label : "");

    return (
      <div className="relative" ref={containerRef}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={displayValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full px-3 py-2 pr-16 theme-input border-2 theme-border rounded-lg theme-text-primary text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all duration-300"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {selectedOption && (
              <button
                type="button"
                onClick={handleClearSelection}
                className="theme-text-muted hover:text-red-400 transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
            <svg
              className={`w-4 h-4 theme-text-muted transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* Dropdown Options */}
        {isOpen && dropdownStyle && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-50" onClick={handleClose} />
            <div
              style={dropdownStyle}
              className="fixed z-60 theme-bg-surface border theme-border rounded-lg shadow-2xl overflow-hidden"
            >
              <div className="max-h-40 overflow-y-auto custom-scrollbar">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option, optIndex) => (
                    <button
                      key={option.value}
                      ref={(el) => {
                        optionRefs.current[optIndex] = el;
                      }}
                      type="button"
                      onClick={() => handleSelect(option)}
                      onMouseEnter={() => setHighlightedIndex(optIndex)}
                      className={`w-full px-3 py-2 text-sm text-left transition-colors duration-150 cursor-pointer ${
                        optIndex === 0 ? "rounded-t-lg" : ""
                      } ${
                        optIndex === filteredOptions.length - 1
                          ? "rounded-b-lg"
                          : ""
                      } ${
                        highlightedIndex === optIndex ? "theme-bg-hover" : ""
                      } ${
                        value === option.value
                          ? "bg-blue-600/20 text-blue-300"
                          : "theme-text-primary"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm theme-text-muted text-center">
                    {searchQuery
                      ? `No options found for "${searchQuery}"`
                      : "No options available"}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const getDisplayValue = (val: OptionValue) => {
    if (fieldType === "select" || fieldType === "numberSelect") {
      const option = options.find((opt) => opt.value === val);
      return option ? option.label : val;
    }
    if (fieldType === "date" && val) {
      return new Date(val).toLocaleDateString();
    }
    return val;
  };

  const renderInput = (val: OptionValue, index: number) => {
    const props = {
      value: val,
      onChange: (newVal: OptionValue) => updateValue(index, newVal),
      placeholder: placeholder,
    };

    switch (fieldType) {
      case "text":
        return <TextInput {...props} />;
      case "number":
        return <NumberInput {...props} min={min} max={max} step={step} />;
      case "date":
        return (
          <DateInput
            value={typeof val === "string" ? val : String(val ?? "")}
            onChange={(newVal) => updateValue(index, newVal)}
          />
        );
      case "select":
        return (
          <FilterableSelectInput
            {...props}
            options={options}
            index={index}
            currentValues={currentValues}
          />
        );
      case "numberSelect":
        return <NumberSelectInput {...props} options={options} />;
      default:
        return <TextInput {...props} />;
    }
  };

  const renderChipsDisplay = () => {
    const safeValue = displayValue || [];
    if (safeValue.length === 0) {
      return <span className="text-muted">{placeholder}</span>;
    }

    return (
      <div className="flex flex-nowrap overflow-x-auto custom-scrollbar gap-1 -my-1">
        {safeValue.map(
          (val, index) =>
            val && (
              <div
                key={index}
                className="inline-flex text-nowrap items-center px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded-md border border-blue-500/30"
              >
                {getDisplayValue(val)}
              </div>
            ),
        )}
      </div>
    );
  };

  return (
    <div className={`relative ${width} ${className}`}>
      {label && (
        <label className="block text-sm font-medium theme-text-secondary mb-1">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={handleOpenModal}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full px-4 py-3 pr-10 theme-input border-2 rounded-xl text-left cursor-pointer transition-all duration-300 focus:outline-none theme-text-primary ${
            error
              ? "border-red-500 focus:border-red-400"
              : focused
                ? "border-blue-500 focus:border-blue-400"
                : "border-border hover:border-hover"
          } hover:theme-bg-hover cursor-pointer`}
        >
          {renderChipsDisplay()}

          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg
              className="w-5 h-5 text-muted"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </button>

        {focused && !error && (
          <div className="absolute inset-0 rounded-xl pointer-events-none bg-black/10"></div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-400 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="mt-1 text-sm theme-text-muted">{helperText}</p>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCancel}
          />

          {/* Modal */}
          <div className="relative theme-bg-surface rounded-2xl shadow-2xl border theme-border w-full max-w-lg mx-4 min-h-[70vh] max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b theme-border shrink-0">
              <h3 className="text-lg font-semibold theme-text-primary">
                {label || "Add Multiple Items"}
              </h3>
              <div className="flex items-center gap-2">
                {/* Compact Toggle button - only show for select types */}
                {(fieldType === "select" || fieldType === "numberSelect") &&
                  (() => {
                    const allSelected =
                      options.length > 0 &&
                      currentValues.filter((v) => v && v !== "").length ===
                        options.length;

                    return (
                      <button
                        type="button"
                        onClick={handleToggleSelectAll}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer border ${
                          allSelected
                            ? "bg-red-600/20 text-red-400 border-red-500/30 hover:bg-red-600/30"
                            : "bg-green-600/20 text-green-400 border-green-500/30 hover:bg-green-600/30"
                        }`}
                        title={
                          allSelected
                            ? "Clear all selections"
                            : "Select all options"
                        }
                      >
                        {allSelected ? "Clear All" : "Select All"}
                      </button>
                    );
                  })()}
                <button
                  onClick={handleCancel}
                  className="text-muted hover:text-fg cursor-pointer transition-colors p-1"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="p-4 overflow-y-auto custom-scrollbar flex-1 min-h-0">
              {/* Display saved values as chips */}
              {currentValues.filter((v) => v && v !== "").length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3 p-2 theme-bg-elevated rounded-lg border theme-border-light max-h-32 overflow-y-auto custom-scrollbar">
                  {currentValues.map(
                    (val, index) =>
                      val && (
                        <div
                          key={`chip-${index}`}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-600/20 text-blue-300 text-xs rounded-md border border-blue-500/30"
                        >
                          <span className="text-xs">
                            {getDisplayValue(val)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeValue(index)}
                            className="ml-0.5 text-blue-400 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      ),
                  )}
                </div>
              )}

              {/* Input fields */}
              <div className="space-y-2">
                {currentValues.map((val, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1">{renderInput(val, index)}</div>
                    {currentValues.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeValue(index)}
                        className="p-1.5 text-red-400 hover:text-red-300 transition-colors cursor-pointer shrink-0"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addNewValue}
                className="flex items-center gap-1.5 px-2 py-1.5 mt-3 text-xs text-blue-400 cursor-pointer hover:text-blue-300 transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Add another {label?.toLowerCase() || "item"}
              </button>

              {helperText && (
                <p className="mt-2 text-xs theme-text-muted">{helperText}</p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-4 py-2.5 border-t theme-border shrink-0">
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 text-sm theme-text-muted hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-1.5 text-sm theme-bg-elevated theme-text-primary rounded-lg theme-bg-hover cursor-pointer transition-all duration-300 font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultipleInput;
