const TitleBar = ({
   value = "Your Title",
   className = "",
   width = "w-full",
}) => {
   return (
      <div
         className={`relative h-full font-bold text-gray-100 dark:text-gray-50 text-2xl grid place-items-center ${width} ${className}`}
      >
         {value}
      </div>
   );
};

export default TitleBar;
