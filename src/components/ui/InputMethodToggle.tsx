import { FiDatabase, FiUsers } from "react-icons/fi";

type InputMethod = "manual" | "groups";

type InputMethodToggleProps = {
  inputMethod?: InputMethod;
  onInputMethodChange?: (method: InputMethod) => void;
  disabled?: boolean;
  theme?: "blue" | "green" | "orange" | "purple";
};

/**
 * InputMethodToggle Component
 *
 * A standalone toggle switch component for switching between Manual Input and Group Selection modes.
 * Styled to match the UpdateMRP title section style.
 *
 * @param {Object} props
 * @param {string} props.inputMethod - Current input method ("manual" or "groups")
 * @param {function} props.onInputMethodChange - Callback when input method changes
 * @param {boolean} props.disabled - Whether the toggle is disabled
 * @param {string} props.theme - Theme color (blue, green, orange, purple)
 */
export default function InputMethodToggle({
  inputMethod = "manual",
  onInputMethodChange,
  disabled = false,
  theme = "blue",
}: InputMethodToggleProps) {
  // Theme color mappings - matching UpdateMRP title section style
  const themeColors = {
    blue: {
      bg: "bg-blue-600",
      text: "text-blue-400",
    },
    green: {
      bg: "bg-green-600",
      text: "text-green-400",
    },
    orange: {
      bg: "bg-orange-600",
      text: "text-orange-400",
    },
    purple: {
      bg: "bg-purple-600",
      text: "text-purple-400",
    },
  };

  const colors = themeColors[theme] || themeColors.blue;

  const handleInputMethodChange = (method: InputMethod) => {
    if (onInputMethodChange && !disabled) {
      onInputMethodChange(method);
    }
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-medium theme-text-primary">Input Method</h3>
      </div>

      <div className="relative flex theme-bg-elevated rounded-lg p-1 theme-border border shadow-lg">
        {/* Background slider */}
        <div
          className={`absolute inset-1 w-[calc(50%-4px)] ${
            colors.bg
          } rounded-md transition-all duration-300 ease-in-out ${
            inputMethod === "groups" ? "left-[calc(50%+2px)]" : "left-1"
          }`}
        />

        {/* Manual Input Button */}
        <button
          onClick={() => handleInputMethodChange("manual")}
          disabled={disabled}
          className={`relative z-10 flex items-center gap-1.5 px-4 py-2 rounded-md transition-all duration-300 flex-1 justify-center ${
            inputMethod === "manual"
              ? "text-white font-semibold"
              : "theme-text-muted hover:theme-text-secondary"
          } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
        >
          <FiDatabase className="w-4 h-4" />
          <span className="text-sm font-medium">Manual Input</span>
        </button>

        {/* Group Selection Button */}
        <button
          onClick={() => handleInputMethodChange("groups")}
          disabled={disabled}
          className={`relative z-10 flex items-center gap-1.5 px-4 py-2 rounded-md transition-all duration-300 flex-1 justify-center ${
            inputMethod === "groups"
              ? "text-white font-semibold"
              : "theme-text-muted hover:theme-text-secondary"
          } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
        >
          <FiUsers className="w-4 h-4" />
          <span className="text-sm font-medium">Group Selection</span>
        </button>
      </div>
    </div>
  );
}
