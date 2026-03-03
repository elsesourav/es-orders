import type { ChangeEvent, FocusEvent, TextareaHTMLAttributes } from "react";
import { useState } from "react";

type TextAreaProps = {
  label?: string;
  value?: string;
  onChange: (value: string, event?: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  width?: string;
  rows?: number;
  onFocus?: (event: FocusEvent<HTMLTextAreaElement>) => void;
} & Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "defaultValue" | "onChange" | "onFocus" | "rows"
>;

const TextArea = ({
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
  rows = 4,
  onFocus,
  ...props
}: TextAreaProps) => {
  const [focused, setFocused] = useState(false);

  const handleFocus = (e: FocusEvent<HTMLTextAreaElement>) => {
    setFocused(true);
    if (onFocus) onFocus(e);
  };

  // Use value if provided, otherwise use defaultValue
  const displayValue =
    value !== undefined && value !== null ? value : defaultValue;

  return (
    <div className={`relative flex flex-col ${width} ${className}`}>
      {label && (
        <label className="block text-sm font-medium theme-text-secondary mb-1 shrink-0">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative w-full">
        <textarea
          value={displayValue || ""}
          onChange={(e) => onChange(e.target.value, e)}
          onFocus={handleFocus}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={rows}
          {...props}
          className={`relative w-full px-4 py-3 theme-input border-2 rounded-xl transition-all duration-300 focus:outline-none resize-y custom-scrollbar ${
            error
              ? "border-red-500 focus:border-red-400"
              : focused
                ? "border-blue-500 focus:border-blue-400"
                : "theme-border"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        />
        {focused && !error && (
          <div className="absolute inset-0 rounded-xl pointer-events-none bg-black/5"></div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-400 flex items-center shrink-0">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7-4a1 1 0 10-2 0v4a1 1 0 002 0V6zm-1 8a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm theme-text-muted shrink-0">{helperText}</p>
      )}
    </div>
  );
};

export default TextArea;
