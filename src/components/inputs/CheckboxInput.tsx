import type { MouseEvent, ReactNode } from "react";
import { useId } from "react";

type CheckboxSize = "sm" | "md" | "lg";

type CheckboxInputProps = {
  checked?: boolean;
  onChange?: (checked: boolean, event: MouseEvent<HTMLButtonElement>) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  size?: CheckboxSize;
  checkedIcon?: ReactNode;
  uncheckedIcon?: ReactNode;
};

/**
 * Checkbox Input Component - Modern box style with full clickable area
 * @param {Object} props - Component props
 * @param {boolean} props.checked - Checked state
 * @param {Function} props.onChange - Change handler
 * @param {string} props.label - Label text
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.size - Size: "sm" | "md" | "lg"
 */
const CheckboxInput = ({
  checked = false,
  onChange,
  label,
  disabled = false,
  className = "",
  size = "md",
  checkedIcon = null,
  uncheckedIcon = null,
}: CheckboxInputProps) => {
  const checkboxId = useId();

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      onChange?.(!checked, e);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`
        ${sizeClasses[size]}
        flex items-center gap-2.5
        rounded-lg
        border
        font-medium
        transition-all duration-200
        whitespace-nowrap
        ${
          checked
            ? "bg-primary-glow border-primary text-primary-light"
            : "theme-bg-surface theme-border theme-text-secondary hover:theme-bg-elevated hover:border-opacity-80"
        }
        ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer active:scale-95"
        }
        ${className}
      `}
    >
      {/* Custom Provided Icons or Default Box */}
      {checked && checkedIcon ? (
        checkedIcon
      ) : !checked && uncheckedIcon ? (
        uncheckedIcon
      ) : (
        <div
          className={`
          flex items-center justify-center
          w-4 h-4
          rounded
          border
          transition-all duration-200
          ${
            checked
              ? "bg-primary border-primary"
              : "theme-bg-elevated theme-border"
          }
        `}
        >
          {checked && (
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      )}

      {/* Label */}
      {label && <span className="select-none">{label}</span>}

      {/* Hidden native checkbox for accessibility */}
      <input
        id={checkboxId}
        type="checkbox"
        checked={checked}
        onChange={() => {}}
        tabIndex={-1}
        className="sr-only"
        aria-hidden="true"
      />
    </button>
  );
};

export default CheckboxInput;
