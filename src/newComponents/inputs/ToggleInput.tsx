type ToggleInputProps = {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "soft" | "outline";
  theme?: "indigo" | "emerald" | "rose" | "amber" | "slate";
};

const ToggleInput = ({
  checked = false,
  onChange,
  label,
  disabled = false,
  className = "",
  size = "md",
  variant = "solid",
  theme = "indigo",
}: ToggleInputProps) => {
  const sizeStyles = {
    sm: { track: "w-16 h-7", text: "text-xs" },
    md: { track: "w-24 h-9", text: "text-sm" },
    lg: { track: "w-32 h-11", text: "text-sm" },
  } as const;

  const themes = {
    indigo: {
      solid: "bg-gradient-to-br from-indigo-500 to-violet-600",
      soft: "bg-indigo-400/60",
      outline: "bg-indigo-400/30",
      indicatorShadow: "shadow-[0_2px_6px_rgba(99,102,241,0.4)]",
      hoverGlow:
        "hover:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),0_3px_10px_rgba(99,102,241,0.25)]",
      textOn: "text-indigo-200",
      textOff: "theme-text-secondary",
    },
    emerald: {
      solid: "bg-gradient-to-br from-emerald-500 to-green-600",
      soft: "bg-emerald-400/60",
      outline: "bg-emerald-400/30",
      indicatorShadow: "shadow-[0_2px_6px_rgba(16,185,129,0.4)]",
      hoverGlow:
        "hover:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),0_3px_10px_rgba(16,185,129,0.25)]",
      textOn: "text-emerald-200",
      textOff: "theme-text-secondary",
    },
    rose: {
      solid: "bg-gradient-to-br from-rose-500 to-pink-600",
      soft: "bg-rose-400/60",
      outline: "bg-rose-400/30",
      indicatorShadow: "shadow-[0_2px_6px_rgba(244,63,94,0.4)]",
      hoverGlow:
        "hover:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),0_3px_10px_rgba(244,63,94,0.25)]",
      textOn: "text-rose-200",
      textOff: "theme-text-secondary",
    },
    amber: {
      solid: "bg-gradient-to-br from-amber-500 to-orange-600",
      soft: "bg-amber-400/60",
      outline: "bg-amber-400/30",
      indicatorShadow: "shadow-[0_2px_6px_rgba(245,158,11,0.4)]",
      hoverGlow:
        "hover:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),0_3px_10px_rgba(245,158,11,0.25)]",
      textOn: "text-amber-200",
      textOff: "theme-text-secondary",
    },
    slate: {
      solid: "bg-gradient-to-br from-slate-500 to-slate-700",
      soft: "bg-slate-400/60",
      outline: "bg-slate-400/30",
      indicatorShadow: "shadow-[0_2px_6px_rgba(100,116,139,0.35)]",
      hoverGlow:
        "hover:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),0_3px_10px_rgba(100,116,139,0.2)]",
      textOn: "text-slate-200",
      textOff: "theme-text-secondary",
    },
  } as const;

  const selectedSize = sizeStyles[size];
  const selectedTheme = themes[theme];

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label || "Toggle"}
      disabled={disabled}
      onClick={() => {
        if (!disabled) onChange?.(!checked);
      }}
      className={`
        inline-flex items-center gap-2.5
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
    >
      {/* Track — same style as _toggleContainer */}
      <span
        className={`
          relative ${selectedSize.track} rounded-full overflow-hidden p-1
          theme-bg-surface border theme-border
          shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]
          transition-all duration-300 ease
          ${!disabled ? `hover:-translate-y-[0.5px] ${selectedTheme.hoverGlow}` : ""}
        `}
      >
        {/* Sliding half-pill indicator — same as _toggleContainer::before */}
        <span
          className={`
            absolute top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-full
            transition-[left] duration-450 ease-[cubic-bezier(0.68,-0.35,0.265,1.35)]
            ${checked ? selectedTheme[variant] : "bg-[rgb(60,60,60)]"}
            ${checked ? selectedTheme.indicatorShadow : ""}
            ${checked ? "left-1/2" : "left-1"}
          `}
        />
      </span>

      {label ? (
        <span
          className={`
            ${selectedSize.text} select-none font-medium
            transition-all duration-350 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
            ${checked ? `${selectedTheme.textOn} scale-[1.01] drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]` : selectedTheme.textOff}
          `}
        >
          {label}
        </span>
      ) : null}
    </button>
  );
};

export default ToggleInput;
