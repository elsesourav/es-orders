type SpaceBarProps = {
  className?: string;
  width?: string;
};

const SpaceBar = ({ className = "", width = "w-full" }: SpaceBarProps) => {
  return <div className={`relative h-full ${width} ${className}`}></div>;
};

export default SpaceBar;
