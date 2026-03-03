import CheckboxInput from "./inputs/CheckboxInput";

type GroupItem = {
  id: string;
  name: string;
  products_ids?: Array<string | number>;
};

type GroupCardProps = {
  group: GroupItem;
  isSelected: boolean;
  onToggle?: (groupId: string) => void;
  onToggleSelection?: (groupId: string) => void;
  theme?: "blue" | "green" | "purple";
};

const GroupCard = ({
  group,
  isSelected,
  onToggle,
  onToggleSelection, // legacy prop for backwards compatibility
  theme = "blue", // default theme
}: GroupCardProps) => {
  // Support both prop names for backwards compatibility
  const handleToggle = onToggle || onToggleSelection;

  const getThemeClasses = () => {
    const themes = {
      blue: {
        selected: "bg-primary-glow border-primary shadow-primary",
        indicator: "bg-primary",
        productCount: "text-primary-light",
      },
      green: {
        selected: "bg-success/20 border-success shadow-success",
        indicator: "bg-success",
        productCount: "text-success-light",
      },
      purple: {
        selected:
          "bg-[rgba(139,92,246,0.2)] border-[#8b5cf6] shadow-[0_4px_14px_rgba(139,92,246,0.4)]",
        indicator: "bg-[#8b5cf6]",
        productCount: "text-[#c4b5fd]",
      },
    };
    return themes[theme] || themes.blue;
  };

  const themeClasses = getThemeClasses();

  return (
    <div
      className={`relative p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer group ${isSelected ? themeClasses.selected : "bg-surface border-border"}`}
      onClick={() => handleToggle && handleToggle(group.id)}
    >
      {/* Selection indicator */}
      <div
        className="absolute top-2 right-2"
        onClick={(e) => e.stopPropagation()}
      >
        <CheckboxInput
          checked={isSelected}
          onChange={() => handleToggle && handleToggle(group.id)}
          size="sm"
          className="border-none! bg-transparent!"
        />
      </div>

      {/* Group content */}
      <div className="pr-6">
        <h3
          className={`text-sm font-medium mb-1 group-hover:opacity-90 line-clamp-2 ${isSelected ? "theme-text-primary" : "theme-text-secondary"}`}
        >
          {group.name}
        </h3>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs ${isSelected ? themeClasses.productCount : "text-muted"}`}
          >
            {group.products_ids?.length || 0} products
          </span>
        </div>
      </div>
    </div>
  );
};

export default GroupCard;
