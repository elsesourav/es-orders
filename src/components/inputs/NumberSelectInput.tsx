import type { CSSProperties, KeyboardEvent } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useSelectContext } from "./SelectContext";

type NumberSelectOption = {
  value: number | string;
  label: string;
};

type NumberSelectInputProps = {
  label?: string;
  value?: number | string;
  onChange: (value: number) => void;
  options?: NumberSelectOption[];
  placeholder?: string;
  defaultValue?: number | string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  width?: string;
};

const NumberSelectInput = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select a number",
  defaultValue = "",
  required = false,
  disabled = false,
  error = "",
  helperText = "",
  className = "",
  width = "w-full",
}: NumberSelectInputProps) => {
  const [focused, setFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties | null>(
    null,
  );
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectId = useId();
  const { registerCloseCallback, closeAllExcept } = useSelectContext();

  // Register close callback for coordinating with other selects
  useEffect(() => {
    const unregister = registerCloseCallback((exceptId) => {
      if (exceptId !== selectId && isOpen) {
        setIsOpen(false);
        setSearchQuery("");
        setHighlightedIndex(-1);
      }
    });
    return unregister;
  }, [registerCloseCallback, selectId, isOpen]);

  // Use value if provided, otherwise use defaultValue
  const displayValue =
    value !== undefined && value !== null ? value : defaultValue;

  const selectedOption = options.find((opt) => opt.value === displayValue);

  // Filter options based on search query
  const filteredOptions = options.filter((option) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      option.label.toLowerCase().includes(query) ||
      String(option.value).includes(query)
    );
  });

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
    }

    setDropdownStyle(null);
    return undefined;
  }, [isOpen]);

  // Reset highlighted index when filtered options change
  useEffect(() => {
    if (filteredOptions.length > 0) {
      // Try to highlight the currently selected option
      const selectedIdx = filteredOptions.findIndex(
        (opt) => opt.value === displayValue,
      );
      setHighlightedIndex(selectedIdx >= 0 ? selectedIdx : 0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [searchQuery, filteredOptions.length, displayValue]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && optionRefs.current[highlightedIndex]) {
      optionRefs.current[highlightedIndex].scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [highlightedIndex]);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = useCallback(
    (optionValue: number | string) => {
      onChange(Number(optionValue));
      setIsOpen(false);
      setSearchQuery("");
      setHighlightedIndex(-1);
    },
    [onChange],
  );

  const handleOpen = () => {
    if (!disabled && containerRef.current) {
      // Calculate position before opening to prevent flash at 0,0
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownStyle({
        width: `${rect.width}px`,
        top: `${rect.bottom + 4}px`,
        left: `${rect.left}px`,
      });
      closeAllExcept(selectId);
      setIsOpen(true);
      setSearchQuery("");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery("");
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLButtonElement | HTMLInputElement>,
  ) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        handleOpen();
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
          handleSelect(filteredOptions[highlightedIndex].value);
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

  return (
    <div className={`relative ${width} ${className}`}>
      {label && (
        <label className="block text-sm font-medium theme-text-secondary mb-1">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <div className="relative" ref={containerRef}>
        <button
          type="button"
          onClick={handleOpen}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          className={`w-full px-4 py-3 pr-10 theme-input border-2 rounded-xl text-left cursor-pointer transition-all duration-300 focus:outline-none ${
            error
              ? "border-red-500 focus:border-red-400"
              : focused || isOpen
                ? "border-blue-500 focus:border-blue-400"
                : "theme-border"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <span
            className={
              selectedOption ? "theme-text-primary" : "theme-text-muted"
            }
          >
            {selectedOption
              ? `${selectedOption.label} (${selectedOption.value})`
              : placeholder}
          </span>

          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg
              className={`w-5 h-5 theme-text-muted transition-transform duration-200 ${
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
        </button>

        {(focused || isOpen) && !error && (
          <div className="absolute inset-0 rounded-xl pointer-events-none bg-black/5"></div>
        )}

        {/* Dropdown Options */}
        {isOpen && !disabled && dropdownStyle && (
          <div
            style={dropdownStyle}
            className="fixed z-50 theme-card rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Search Input */}
            <div className="p-2 border-b theme-border">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type to search..."
                className="w-full px-3 py-2 theme-input border theme-border rounded-lg text-sm theme-text-primary focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Options List */}
            <div
              ref={listRef}
              className="max-h-52 overflow-y-auto custom-scrollbar"
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <button
                    key={option.value}
                    ref={(el) => {
                      optionRefs.current[index] = el;
                    }}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full px-4 py-3 text-left transition-colors duration-150 flex justify-between cursor-pointer items-center ${
                      highlightedIndex === index ? "theme-bg-hover" : ""
                    } ${
                      option.value === displayValue
                        ? "bg-blue-600/20 text-blue-300"
                        : "theme-text-primary"
                    }`}
                  >
                    <span>{option.label}</span>
                    <span className="theme-text-muted font-mono">
                      {option.value}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 theme-text-muted text-center">
                  No options found
                </div>
              )}
            </div>
          </div>
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

      {/* Backdrop to close dropdown */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={handleClose} />}
    </div>
  );
};

export default NumberSelectInput;
