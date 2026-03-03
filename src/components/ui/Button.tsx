import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "success"
  | "info"
  | "warning"
  | "ghost"
  | "neutral";

type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary", // "primary", "secondary", "danger", "success", "info", "warning", "ghost", "neutral"
  size = "md", // "sm", "md", "lg"
  className = "",
  disabled = false,
  ...props
}: ButtonProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "secondary":
        return "btn-secondary";
      case "danger":
        return "btn-danger";
      case "success":
        return "btn-success";
      case "info":
        return "btn-info";
      case "warning":
        return "btn-warning";
      case "ghost":
        return "btn-ghost";
      case "neutral":
        return "btn-neutral";
      default: // primary
        return "btn-primary";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "!px-3 !py-1.5 text-sm !rounded";
      case "lg":
        return "!px-6 !py-3 text-lg !rounded-xl";
      default: // md
        return "text-base";
    }
  };

  const variantClasses = getVariantClasses();
  const sizeClasses = getSizeClasses();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${variantClasses} ${sizeClasses} disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${className}`}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">{children}</div>
    </button>
  );
};

export default Button;
