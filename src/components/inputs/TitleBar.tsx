type TitleBarProps = {
  value?: string;
  className?: string;
  width?: string;
};

const TitleBar = ({
  value = "Your Title",
  className = "",
  width = "w-full",
}: TitleBarProps) => {
  return (
    <div
      className={`relative h-full font-bold text-fg text-2xl grid place-items-center ${width} ${className}`}
    >
      {value}
    </div>
  );
};

export default TitleBar;
