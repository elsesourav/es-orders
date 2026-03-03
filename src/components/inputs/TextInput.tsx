import type {
  ChangeEvent,
  FocusEvent,
  InputHTMLAttributes,
  KeyboardEvent,
} from "react";
import { useState } from "react";
import { FiSearch } from "react-icons/fi";

type TextInputType = InputHTMLAttributes<HTMLInputElement>["type"];

type TextInputProps = {
  label?: string;
  value?: string | number;
  onChange: (value: string, event?: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  defaultValue?: string | number;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  width?: string;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  showSearchIcon?: boolean;
  type?: TextInputType;
  name?: string;
};

const TextInput = ({
  label,
  value,
  onChange,
  placeholder = "",
  defaultValue = "",
  required = false,
  disabled = false,
  error = "",
  helperText = "",
  className = "",
  width = "w-full",
  onFocus,
  onKeyDown,
  showSearchIcon = false, // Added prop for search icon
  type = "text",
  name,
}: TextInputProps) => {
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
        <label className="block text-sm font-medium text-fg-secondary mb-1">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {showSearchIcon && (
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted text-sm z-10" />
        )}
        <input
          type={type}
          name={name}
          value={displayValue || ""}
          onChange={(e) => onChange(e.target.value, e)}
          onFocus={handleFocus}
          onBlur={() => setFocused(false)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full ${showSearchIcon ? "pl-10" : "px-4"} py-3 theme-input border-2 rounded-xl transition-all duration-300 focus:outline-none ${
            error
              ? "border-red-500 focus:border-red-400"
              : focused
                ? "border-blue-500 focus:border-blue-400"
                : "theme-border hover:border-hover"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
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
        <p className="mt-1 text-sm theme-text-muted">{helperText}</p>
      )}
    </div>
  );
};

export default TextInput;
