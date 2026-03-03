import { useEffect, useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import Button from "./Button";

type ConfirmDialogVariant = "danger" | "warning" | "info";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmDialogVariant;
};

export default function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger", // danger, warning, info
}: ConfirmDialogProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      // Small delay to ensure render happens before class change for transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true));
      });
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Handle escape key
  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onCancel]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-2147483647 flex items-center justify-center transition-all duration-300 ${
        isVisible
          ? "bg-black/40 backdrop-blur-sm opacity-100"
          : "bg-black/0 backdrop-blur-none opacity-0"
      }`}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div
        className={`theme-card rounded-2xl shadow-2xl max-w-sm w-full p-6 relative flex flex-col items-center transform transition-all duration-300 border theme-border ${
          isVisible
            ? "scale-100 translate-y-0 opacity-100"
            : "scale-95 translate-y-4 opacity-0"
        }`}
      >
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
            variant === "danger"
              ? "bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400"
              : "bg-yellow-100 text-yellow-500 dark:bg-yellow-900/30 dark:text-yellow-400"
          }`}
        >
          <FiAlertTriangle className="text-2xl" />
        </div>

        <h3 className="text-lg font-bold theme-text-primary mb-2 text-center">
          {title}
        </h3>
        <p className="theme-text-secondary mb-8 text-center text-sm leading-relaxed">
          {message}
        </p>

        <div className="flex gap-3 w-full">
          <Button
            onClick={onCancel}
            variant="ghost"
            className="flex-1 justify-center theme-bg-elevated theme-bg-hover"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            variant={variant}
            className="flex-1 justify-center shadow-lg shadow-red-500/20"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
