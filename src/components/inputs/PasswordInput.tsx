import type { ChangeEvent } from "react";
import { useState } from "react";

type PasswordInputProps = {
  label?: string;
  value?: string;
  onChange: (value: string, event?: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  width?: string;
  name?: string;
  autoComplete?: string;
};

const EyeOnIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.223-3.592m3.31-2.687A9.956 9.956 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.043 5.306M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 3l18 18"
    />
  </svg>
);

const PasswordInput = ({
  label,
  value,
  onChange,
  placeholder = "Password",
  defaultValue = "",
  required = false,
  disabled = false,
  error = "",
  helperText = "",
  className = "",
  width = "w-full",
  name,
  autoComplete,
}: PasswordInputProps) => {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

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
        <input
          type={visible ? "text" : "password"}
          name={name}
          value={displayValue || ""}
          onChange={(event) => onChange(event.target.value, event)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`w-full px-4 py-3 pr-12 theme-input border-2 rounded-xl transition-all duration-300 focus:outline-none ${
            error
              ? "border-red-500 focus:border-red-400"
              : focused
                ? "border-blue-500 focus:border-blue-400"
                : "theme-border hover:border-hover"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        />

        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer transition-colors duration-200 text-muted hover:text-fg"
          onClick={() => setVisible((prev) => !prev)}
          disabled={disabled}
          tabIndex={-1}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOnIcon /> : <EyeOffIcon />}
        </button>

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

export default PasswordInput;
