import type {
  ChangeEvent,
  CSSProperties,
  KeyboardEvent,
  MouseEvent,
} from "react";
import { useEffect, useId, useRef, useState } from "react";
import { useSelectContext } from "./SelectContext";

type SelectOption = {
  value: string | number;
  label: string;
};

type SelectInputProps = {
  label?: string;
  value?: string | number;
  onChange: (value: string | number) => void;
  options?: SelectOption[];
  placeholder?: string;
  defaultValue?: string | number;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  width?: string;
};

const SelectInput = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  defaultValue = "",
  required = false,
  disabled = false,
  error = "",
  helperText = "",
  className = "",
  width = "w-full",
}: SelectInputProps) => {
  const [focused, setFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties | null>(
    null,
  );
  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectId = useId();
  const { registerCloseCallback, closeAllExcept } = useSelectContext();

  // Register close callback for coordinating with other selects
  useEffect(() => {
    const unregister = registerCloseCallback((exceptId) => {
      if (exceptId !== selectId && isOpen) {
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
      }
    });
    return unregister;
  }, [registerCloseCallback, selectId, isOpen]);

  // Use value if provided, otherwise use defaultValue
  const displayValue =
    value !== undefined && value !== null ? value : defaultValue;

  // Filter options based on search term
  const filteredOptions = searchTerm
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : options;

  const handleSelect = (option: SelectOption) => {
    onChange(option.value);
    setIsOpen(false);
    setFocused(false);
    setSearchTerm("");
    setHighlightedIndex(-1);
  };

  const handleButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!disabled && containerRef.current) {
      if (!isOpen) {
        // Calculate position before opening to prevent flash at 0,0
        const rect = containerRef.current.getBoundingClientRect();
        setDropdownStyle({
          width: `${rect.width}px`,
          top: `${rect.bottom + 4}px`,
          left: `${rect.left}px`,
        });
        closeAllExcept(selectId);
      }
      setIsOpen(!isOpen);
      if (!isOpen) {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLButtonElement | HTMLInputElement>,
  ) => {
    if (!isOpen) return;

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
        } else if (filteredOptions.length > 0) {
          // Always select first option if no specific option is highlighted
          handleSelect(filteredOptions[0]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setHighlightedIndex(-1); // Reset highlight when searching
  };

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
  }, [searchTerm, filteredOptions.length, displayValue]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && optionRefs.current[highlightedIndex]) {
      optionRefs.current[highlightedIndex].scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [highlightedIndex]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: globalThis.MouseEvent) => {
      const target = e.target;
      if (
        !(target instanceof Element) ||
        !target.closest(".select-input-container")
      ) {
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === displayValue);

  return (
    <div className={`relative ${width} ${className} select-input-container`}>
      {label && (
        <label className="block text-sm font-medium theme-text-secondary mb-1">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <div className="relative" ref={containerRef}>
        {isOpen ? (
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            placeholder="Search options..."
            className={`w-full px-4 py-3 pr-10 theme-input border-2 rounded-xl transition-all duration-300 focus:outline-none ${
              error
                ? "border-red-500 focus:border-red-400"
                : "border-blue-500 focus:border-blue-400"
            }`}
          />
        ) : (
          <button
            type="button"
            onClick={handleButtonClick}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className={`w-full px-4 py-3 pr-10 theme-input border-2 rounded-xl text-nowrap overflow-hidden text-ellipsis text-left transition-all duration-300 focus:outline-none cursor-pointer ${
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
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </button>
        )}

        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
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

        {(focused || isOpen) && !error && (
          <div className="absolute inset-0 rounded-xl pointer-events-none bg-black/5"></div>
        )}

        {/* Dropdown Options */}
        {isOpen && !disabled && dropdownStyle && (
          <div
            style={dropdownStyle}
            className="fixed z-50 theme-card rounded-xl shadow-2xl max-h-60 overflow-y-auto cursor-pointer custom-scrollbar overflow-x-hidden"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <button
                  key={option.value}
                  ref={(el) => {
                    optionRefs.current[index] = el;
                  }}
                  type="button"
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`w-full px-4 py-3 text-left transition-colors duration-150 cursor-pointer ${
                    index === 0 ? "rounded-t-xl" : ""
                  } ${
                    index === filteredOptions.length - 1 ? "rounded-b-xl" : ""
                  } ${highlightedIndex === index ? "theme-bg-hover" : ""} ${
                    option.value === displayValue
                      ? "bg-blue-600/20 text-blue-300"
                      : "theme-text-primary"
                  }`}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 theme-text-muted text-center">
                {searchTerm ? "No options found" : "No options available"}
              </div>
            )}
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
    </div>
  );
};

export default SelectInput;
