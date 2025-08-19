import { useState } from "react";

const NumberSelectInput = ({
   label,
   value,
   onChange,
   options = [],
   placeholder = "Select a number",
   defaultValue = "",
   required = false,
   disabled = false,
   error = "",
   helperText = "",
   className = "",
   width = "w-full",
}) => {
   const [focused, setFocused] = useState(false);
   const [isOpen, setIsOpen] = useState(false);

   // Use value if provided, otherwise use defaultValue
   const displayValue =
      value !== undefined && value !== null ? value : defaultValue;

   const handleSelect = (optionValue) => {
      onChange(Number(optionValue));
      setIsOpen(false);
   };

   const selectedOption = options.find((opt) => opt.value === displayValue);

   return (
      <div className={`relative ${width} ${className}`}>
         {label && (
            <label className="block text-sm font-medium text-gray-300 mb-1">
               {label}
               {required && <span className="text-red-400 ml-1">*</span>}
            </label>
         )}

         <div className="relative">
            <button
               type="button"
               onClick={() => !disabled && setIsOpen(!isOpen)}
               onFocus={() => setFocused(true)}
               onBlur={() => setFocused(false)}
               disabled={disabled}
               className={`w-full px-4 py-3 pr-10 bg-gray-800/50 border-2 rounded-xl text-left cursor-pointer transition-all duration-300 focus:outline-none ${
                  error
                     ? "border-red-500 focus:border-red-400"
                     : focused || isOpen
                     ? "border-blue-500 focus:border-blue-400"
                     : "border-gray-600 hover:border-gray-500"
               } ${
                  disabled
                     ? "opacity-50 cursor-not-allowed"
                     : "hover:bg-gray-800/70 cursor-pointer"
               }`}
            >
               <span
                  className={selectedOption ? "text-white" : "text-gray-500"}
               >
                  {selectedOption
                     ? `${selectedOption.label} (${selectedOption.value})`
                     : placeholder}
               </span>

               <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg
                     className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                     }`}
                     fill="currentColor"
                     viewBox="0 0 20 20"
                  >
                     <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                     />
                  </svg>
               </div>
            </button>

            {(focused || isOpen) && !error && (
               <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-600/20 pointer-events-none"></div>
            )}

            {/* Dropdown Options */}
            {isOpen && !disabled && (
               <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                  {options.length > 0 ? (
                     options.map((option, index) => (
                        <button
                           key={option.value}
                           type="button"
                           onClick={() => handleSelect(option.value)}
                           className={`w-full px-4 py-3 text-left hover:bg-gray-700/50 transition-colors duration-200 flex justify-between cursor-pointer items-center ${
                              index === 0 ? "rounded-t-xl" : ""
                           } ${
                              index === options.length - 1 ? "rounded-b-xl" : ""
                           } ${
                              option.value === value
                                 ? "bg-blue-600/20 text-blue-300"
                                 : "text-white"
                           }`}
                        >
                           <span>{option.label}</span>
                           <span className="text-gray-400 font-mono">
                              {option.value}
                           </span>
                        </button>
                     ))
                  ) : (
                     <div className="px-4 py-3 text-gray-500 text-center">
                        No options available
                     </div>
                  )}
               </div>
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

         {/* Backdrop to close dropdown */}
         {isOpen && (
            <div
               className="fixed inset-0 z-40"
               onClick={() => setIsOpen(false)}
            />
         )}
      </div>
   );
};

export default NumberSelectInput;
