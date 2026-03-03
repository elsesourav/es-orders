import type { CSSProperties } from "react";
import { useCallback, useEffect, useState } from "react";

type AlertType = "info" | "success" | "error" | "warning";

type CustomAlertProps = {
  type?: AlertType;
  message: string;
  onClose?: () => void;
  duration?: number;
};

export default function CustomAlert({
  type = "info",
  message,
  onClose,
  duration = 5000,
}: CustomAlertProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const colorMap = {
    info: {
      bg: "#6366f1", // primary
      bgLight: "#818cf8", // primary-light
      icon: "ℹ️",
    },
    success: {
      bg: "#10b981", // success
      bgLight: "#34d399", // success-light
      icon: "✓",
    },
    error: {
      bg: "#f43f5e", // danger
      bgLight: "#fb7185", // danger-light
      icon: "✕",
    },
    warning: {
      bg: "#f59e0b", // warning
      bgLight: "#fbbf24", // warning-light
      icon: "⚠",
    },
  };

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onClose?.();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true));

    if (!onClose) return undefined;
    const timer = setTimeout(() => {
      handleClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration, handleClose]);

  const colors = colorMap[type] || colorMap.info;
  const alertStyle = {
    "--alert-bg": colors.bg,
    "--alert-bg-light": colors.bgLight,
  } as CSSProperties;

  return (
    <>
      <div
        className={`custom-alert custom-alert-${type} ${isVisible ? "visible" : ""} ${isExiting ? "exiting" : ""}`}
        style={alertStyle}
      >
        <div className="alert-content">
          <span className="alert-icon">{colors.icon}</span>
          <span className="alert-message">{message}</span>
        </div>
        {onClose && (
          <button onClick={handleClose} className="alert-close">
            ✕
          </button>
        )}
        <div
          className="alert-progress"
          style={{ animationDuration: `${duration}ms` }}
        />
      </div>
      <style>{`
        :root {
          --alert-dark-primary: rgb(40, 41, 42);
          --alert-dark-secondary: rgb(60, 60, 60);
        }

        .custom-alert {
          position: fixed;
          left: 50%;
          bottom: -120px;
          transform: translateX(-50%) scale(0.9);
          z-index: 2147483648;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          min-width: 320px;
          max-width: 480px;
          padding: 16px 20px;
          border-radius: 16px;
          background: var(--alert-dark-secondary);
          color: var(--alert-dark-primary);
          font-weight: 500;
          box-shadow: 
            0 10px 40px rgba(0, 0, 0, 0.3),
            0 2px 8px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          border: 1px solid var(--alert-dark-primary);
          backdrop-filter: blur(10px);
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          overflow: hidden;
          opacity: 0;
        }
        
        .custom-alert.visible {
          bottom: 32px;
          transform: translateX(-50%) scale(1) translateY(0);
          opacity: 1;
        }
        
        .custom-alert.exiting {
          bottom: -120px;
          opacity: 0;
          transform: translateX(-50%) scale(0.85) translateY(30px);
          transition: all 0.35s cubic-bezier(0.4, 0, 1, 1);
        }
        
        .alert-content {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }
        
        .alert-icon {
          font-size: 20px;
          line-height: 1;
          flex-shrink: 0;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
          animation: iconBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        @keyframes iconBounce {
          0% { transform: scale(0) rotate(-180deg); }
          50% { transform: scale(1.2) rotate(10deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        
        .alert-message {
          font-size: 14px;
          line-height: 1.5;
          flex: 1;
          min-width: 0;
          word-wrap: break-word;
        }
        
        .alert-close {
          background: var(--alert-dark-primary);
          border: none;
          color: var(--alert-dark-secondary);
          width: 28px;
          height: 28px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: bold;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
          backdrop-filter: blur(4px);
        }
        
        .alert-close:hover {
          background: var(--alert-dark-primary);
          transform: scale(1.1) rotate(90deg);
        }
        
        .alert-close:active {
          transform: scale(0.95) rotate(90deg);
        }
        
        .alert-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 4px;
          background: linear-gradient(
            90deg,
            var(--alert-dark-primary),
            var(--alert-dark-secondary)
          );
          animation: progressShrink linear forwards;
          border-radius: 0 0 16px 16px;
          box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.1);
        }
        
        @keyframes progressShrink {
          0% { 
            width: 100%; 
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% { 
            width: 0%; 
            opacity: 0;
          }
        }
        
        /* Light theme adjustments */
        .light-theme .custom-alert {
          background: var(--alert-bg-light);
          color: #1e293b;
          box-shadow: 
            0 10px 40px rgba(0, 0, 0, 0.15),
            0 2px 8px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        .light-theme .alert-close {
          background: rgba(0, 0, 0, 0.1);
          color: #1e293b;
        }
        
        .light-theme .alert-close:hover {
          background: rgba(0, 0, 0, 0.15);
        }
        
        .light-theme .alert-progress {
          background: linear-gradient(
            90deg,
            rgba(0, 0, 0, 0.25),
            rgba(0, 0, 0, 0.15)
          );
        }
        
        /* Mobile responsive */
        @media (max-width: 640px) {
          .custom-alert {
            min-width: 280px;
            max-width: calc(100vw - 32px);
            padding: 14px 16px;
            bottom: -100px;
          }
          
          .custom-alert.visible {
            bottom: 20px;
          }
          
          .alert-message {
            font-size: 13px;
          }
        }
      `}</style>
    </>
  );
}
