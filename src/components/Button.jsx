const Button = ({
   children,
   onClick,
   type = "button",
   variant = "primary", // "primary", "secondary", "danger", "success"
   size = "md", // "sm", "md", "lg"
   className = "",
   disabled = false,
   ...props
}) => {
   const getVariantClasses = () => {
      switch (variant) {
         case "secondary":
            return {
               base: "bg-gray-700/80 hover:bg-gray-600 border border-gray-600/50 backdrop-blur-sm",
               gradient: null,
            };
         case "danger":
            return {
               base: "text-white shadow-lg",
               gradient: {
                  primary: "from-red-500 to-pink-600",
                  hover: "from-red-600 to-pink-700",
               },
            };
         case "success":
            return {
               base: "text-white shadow-lg",
               gradient: {
                  primary: "from-green-500 to-emerald-600",
                  hover: "from-green-600 to-emerald-700",
               },
            };
         default: // primary
            return {
               base: "text-white shadow-lg",
               gradient: {
                  primary: "from-blue-500 to-purple-600",
                  hover: "from-blue-600 to-purple-700",
               },
            };
      }
   };

   const getSizeClasses = () => {
      switch (size) {
         case "sm":
            return "px-3 py-1.5 text-sm rounded";
         case "lg":
            return "px-6 py-3 text-lg rounded-xl";
         default: // md
            return "px-4 py-2 text-base rounded-lg";
      }
   };

   const variantClasses = getVariantClasses();
   const sizeClasses = getSizeClasses();

   return (
      <button
         type={type}
         onClick={onClick}
         disabled={disabled}
         className={`font-medium cursor-pointer transition-all duration-300 hover:scale-105 relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${variantClasses.base} ${sizeClasses} ${className}`}
         {...props}
      >
         {/* Gradient backgrounds for variants that have them */}
         {variantClasses.gradient && (
            <>
               <div
                  className={`absolute inset-0 bg-gradient-to-r ${variantClasses.gradient.primary} opacity-100`}
               />
               <div
                  className={`absolute inset-0 bg-gradient-to-r ${variantClasses.gradient.hover} opacity-0 hover:opacity-100 transition-opacity duration-300`}
               />
            </>
         )}

         {/* Content wrapper */}
         <div className="relative z-10 flex items-center justify-center gap-2">
            {children}
         </div>
      </button>
   );
};

export default Button;
