import type { FocusEvent } from "react";
import { useState } from "react";

type DateInputProps = {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  width?: string;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
};

const DateInput = ({
  label,
  value,
  onChange,
  min,
  max,
  defaultValue = "",
  required = false,
  disabled = false,
  error = "",
  helperText = "",
  className = "",
  width = "w-full",
  onFocus,
}: DateInputProps) => {
  const [focused, setFocused] = useState(false);

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    if (onFocus) onFocus(e);
  };

  // Use value if provided, otherwise use defaultValue
  const displayValue =
    value !== undefined && value !== null ? value : defaultValue;

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
          type="date"
          value={displayValue || ""}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={() => setFocused(false)}
          min={min}
          max={max}
          disabled={disabled}
          className={`w-full px-4 py-3 theme-input border-2 rounded-xl transition-all duration-300 focus:outline-none ${
            error
              ? "border-red-500 focus:border-red-400"
              : focused
                ? "border-blue-500 focus:border-blue-400"
                : "theme-border"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          style={{
            colorScheme: "dark",
          }}
        />

        {focused && !error && (
          <div className="absolute inset-0 rounded-xl pointer-events-none bg-black/5"></div>
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
        <p className="mt-1 text-sm text-muted">{helperText}</p>
      )}
    </div>
  );
};

export default DateInput;
