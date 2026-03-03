import { getUserId } from "@/api/usersApi";
import type { ComponentType, ReactNode } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import Button from "./Button";

type DataCardItem = {
  created_by?: string;
  [key: string]: unknown;
};

type DataCardField = {
  label: string;
  value: ReactNode;
  color?: string;
};

type DataCardAction = {
  label?: string;
  icon?: ComponentType<{ size?: number }>;
  onClick: () => void;
  className?: string;
  variant?:
    | "primary"
    | "secondary"
    | "danger"
    | "success"
    | "info"
    | "warning"
    | "ghost"
    | "neutral";
};

type DataCardProps = {
  item: DataCardItem;
  title: ReactNode;
  subtitle?: ReactNode;
  status?: "public" | "private" | string;
  fields?: DataCardField[];
  actions?: DataCardAction[];
  hoverColor?: "blue" | "purple" | "green";
  onEdit?: (item: DataCardItem) => void;
  onDelete?: (item: DataCardItem) => void;
  className?: string;
};

export default function DataCard({
  item,
  title,
  subtitle,
  status,
  fields = [],
  actions = [],
  hoverColor = "blue",
  onEdit,
  onDelete,
  className = "",
}: DataCardProps) {
  const hoverColors = {
    blue: "hover:shadow-primary",
    purple: "hover:shadow-[0_4px_14px_rgba(139,92,246,0.3)]",
    green: "hover:shadow-success",
  };

  const statusColors = {
    public: "badge-success",
    private: "badge-primary",
  };
  const resolvedStatusColor =
    status === "public" || status === "private"
      ? statusColors[status]
      : statusColors.private;

  return (
    <div
      className={`card ${hoverColors[hoverColor]} hover:scale-[1.005] ${className}`}
    >
      <div className="flex justify-between items-start gap-4">
        {/* Left: Main Info */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* First Line: Name, Label, and Status */}
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-semibold text-base truncate theme-text-primary">
              {title}
            </h3>
            {subtitle && (
              <span className="text-sm italic truncate theme-text-muted">
                "{subtitle}"
              </span>
            )}
            {status && (
              <span
                className={`px-2 py-1 text-xs rounded-full font-medium shrink-0 ${
                  resolvedStatusColor
                }`}
              >
                {status}
              </span>
            )}
          </div>

          {/* Second Line: Field Information */}
          {fields.length > 0 && (
            <div className="flex flex-wrap gap-4 text-sm">
              {fields.map((field, index) => (
                <div key={index} className="flex items-center gap-1 min-w-0">
                  <span className="text-xs font-medium text-muted">
                    {field.label}:
                  </span>
                  <span
                    className={`truncate ${field.color ? "" : "text-fg-secondary"}`}
                  >
                    {field.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex gap-2 shrink-0">
          {item.created_by === getUserId() && (
            <>
              {/* Custom action buttons */}
              {actions.map((action, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant={action.variant}
                  onClick={action.onClick}
                  className={action.className}
                >
                  {action.icon && <action.icon size={12} />}
                  {action.label && ` ${action.label}`}
                </Button>
              ))}

              {/* Default Edit button if onEdit is provided */}
              {onEdit && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onEdit(item)}
                >
                  <FiEdit2 size={12} /> Edit
                </Button>
              )}

              {/* Default Delete button if onDelete is provided */}
              {onDelete && (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => onDelete(item)}
                >
                  <FiTrash2 size={12} />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
