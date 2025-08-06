import { useState } from "react";

const DateInput = ({
   label,
   value,
   onChange,
   min,
   max,
   defaultValue = "",
   required = false,
   disabled = false,
   error = "",
   helperText = "",
   className = "",
   width = "w-full",
   onFocus,
}) => {
   const [focused, setFocused] = useState(false);

   const handleFocus = (e) => {
      setFocused(true);
      if (onFocus) onFocus(e);
   };

   // Use value if provided, otherwise use defaultValue
   const displayValue =
      value !== undefined && value !== null ? value : defaultValue;

   return (
      <div className={`relative ${width} ${className}`}>
         {label && (
            <label className="block text-sm font-medium text-gray-300 mb-1">
               {label}
               {required && <span className="text-red-400 ml-1">*</span>}
            </label>
         )}

         <div className="relative">
            <input
               type="date"
               value={displayValue || ""}
               onChange={(e) => onChange(e.target.value)}
               onFocus={handleFocus}
               onBlur={() => setFocused(false)}
               min={min}
               max={max}
               disabled={disabled}
               className={`w-full px-4 py-3 bg-gray-800/50 border-2 rounded-xl text-white transition-all duration-300 focus:outline-none ${
                  error
                     ? "border-red-500 focus:border-red-400"
                     : focused
                     ? "border-blue-500 focus:border-blue-400"
                     : "border-gray-600 hover:border-gray-500"
               } ${
                  disabled
                     ? "opacity-50 cursor-not-allowed"
                     : "hover:bg-gray-800/70"
               }`}
               style={{
                  colorScheme: "dark",
               }}
            />

            {focused && !error && (
               <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-600/20 pointer-events-none"></div>
            )}
         </div>

         {error && (
            <p className="mt-1 text-sm text-red-400 flex items-center">
               <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
               >
                  <path
                     fillRule="evenodd"
                     d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                     clipRule="evenodd"
                  />
               </svg>
               {error}
            </p>
         )}

         {helperText && !error && (
            <p className="mt-1 text-sm text-gray-400">{helperText}</p>
         )}
      </div>
   );
};

export default DateInput;
