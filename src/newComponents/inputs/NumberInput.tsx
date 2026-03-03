import type { ChangeEvent, FocusEvent } from "react";
import { useRef, useState } from "react";

type NumberInputProps = {
  label?: string;
  value?: string | number;
  onChange: (value: string, event?: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  defaultValue?: string | number;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  width?: string;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  useIndianFormat?: boolean;
};

const NumberInput = ({
  label,
  value,
  onChange,
  placeholder = "",
  defaultValue = "",
  min,
  max,
  step = 1,
  required = false,
  disabled = false,
  error = "",
  helperText = "",
  className = "",
  width = "w-full",
  onFocus,
  useIndianFormat = false, // Add a prop to control Indian formatting
}: NumberInputProps) => {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Use value if provided, otherwise use defaultValue
  const displayValue =
    value !== undefined && value !== null ? value : defaultValue;

  // Format number with commas (Indian style, controlled by prop)
  function formatNumberIndian(x: string | number | null | undefined) {
    if (x === "" || x === undefined || x === null) return "";
    const num = Number(x);
    if (isNaN(num)) return String(x);
    // Preserve decimals if present
    const [intPart, decPart] = x.toString().split(".");
    const formattedInt = useIndianFormat
      ? new Intl.NumberFormat("en-IN").format(Number(intPart))
      : new Intl.NumberFormat("en-US").format(Number(intPart));
    return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
  }

  // Remove all commas
  function unformatNumber(x: string) {
    return x.replace(/,/g, "");
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const el = e.target;
    const rawValue = el.value;
    const selectionStart = el.selectionStart ?? rawValue.length;
    const unformatted = unformatNumber(rawValue);
    if (unformatted === "") {
      onChange("", e);
      return;
    }
    // Allow only numbers, minus sign, and decimal point
    if (!/^-?\d*\.?\d*$/.test(unformatted)) {
      return;
    }
    // Always update the input value for controlled input
    onChange(unformatted, e);
    setTimeout(() => {
      if (inputRef.current) {
        let pos = selectionStart;
        // Count commas before caret in old and new
        const leftRaw = rawValue.slice(0, selectionStart);
        const leftUnformatted = unformatNumber(leftRaw);
        const leftFormatted = formatNumberIndian(leftUnformatted);
        pos = leftFormatted.length;
        inputRef.current.setSelectionRange(pos, pos);
      }
    }, 0);
  };

  const increment = () => {
    // If empty, start from min value or 0
    const currentValue =
      value === "" || value === undefined || value === null
        ? min !== undefined
          ? Number(min)
          : 0
        : Number(value);
    const stepValue = Number(step);
    const newValue = currentValue + stepValue;

    if (!max || newValue <= Number(max)) {
      onChange(newValue.toString());
    }
  };

  const decrement = () => {
    // If empty, start from min value or 0
    const currentValue =
      value === "" || value === undefined || value === null
        ? min !== undefined
          ? Number(min)
          : 0
        : Number(value);
    const stepValue = Number(step);
    const newValue = currentValue - stepValue;

    if (!min || newValue >= Number(min)) {
      onChange(newValue.toString());
    }
  };

  // When blurring, convert to number if valid, don't auto-default empty values
  const handleBlur = () => {
    setFocused(false);
    if (value === "" || value === undefined || value === null) {
      // Don't auto-default to any number, keep it empty
      return;
    }
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      // Apply min/max constraints
      if (min !== undefined && numValue < min) {
        onChange(min.toString());
        return;
      }
      if (max !== undefined && numValue > max) {
        onChange(max.toString());
        return;
      }
      onChange(numValue.toString());
    } else {
      // If invalid input, clear it instead of defaulting
      onChange("");
    }
  };

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    if (onFocus) onFocus(e);
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
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={formatNumberIndian(
            displayValue === undefined || displayValue === null
              ? ""
              : displayValue.toString(),
          )}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-4 py-3 pr-12 theme-input border-2 rounded-xl transition-all duration-300 focus:outline-none
               /* Remove default number input arrows */
               [&::-webkit-outer-spin-button]:appearance-none
               [&::-webkit-inner-spin-button]:appearance-none
               [-moz-appearance:textfield]
               ${
                 error
                   ? "border-red-500 focus:border-red-400"
                   : focused
                     ? "border-blue-500 focus:border-blue-400"
                     : "theme-border"
               } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        />

        {/* Number controls */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col">
          <button
            type="button"
            onClick={increment}
            disabled={
              disabled ||
              (max !== undefined && Number(value || 0) >= Number(max))
            }
            className="p-1 theme-text-muted hover:theme-text-primary cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={decrement}
            disabled={
              disabled ||
              (min !== undefined && Number(value || 0) <= Number(min))
            }
            className="p-1 text-muted hover:text-fg transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {focused && !error && (
          <div className="absolute inset-0 rounded-xl pointer-events-none bg-black/10"></div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
        <p className="mt-1 text-sm text-muted">{helperText}</p>
      )}
    </div>
  );
};

export default NumberInput;
