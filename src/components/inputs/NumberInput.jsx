import { useRef, useState } from "react";

const NumberInput = ({
   label,
   value,
   onChange,
   placeholder = "",
   defaultValue = "",
   min,
   max,
   step = 1,
   required = false,
   disabled = false,
   error = "",
   helperText = "",
   className = "",
   width = "w-full",
   onFocus,
   useIndianFormat = false, // Add a prop to control Indian formatting
}) => {
   const [focused, setFocused] = useState(false);
   const inputRef = useRef();

   // Use value if provided, otherwise use defaultValue
   const displayValue =
      value !== undefined && value !== null ? value : defaultValue;

   // Format number with commas (Indian style, controlled by prop)
   function formatNumberIndian(x) {
      if (x === "" || x === undefined || x === null) return "";
      const num = Number(x);
      if (isNaN(num)) return x;
      // Preserve decimals if present
      const [intPart, decPart] = x.toString().split(".");
      const formattedInt = useIndianFormat
         ? new Intl.NumberFormat("en-IN").format(Number(intPart))
         : new Intl.NumberFormat("en-US").format(Number(intPart));
      return decPart !== undefined
         ? `${formattedInt}.${decPart}`
         : formattedInt;
   }

   // Remove all commas
   function unformatNumber(x) {
      return x.replace(/,/g, "");
   }

   const handleChange = (e) => {
      const el = e.target;
      const rawValue = el.value;
      const selectionStart = el.selectionStart;
      const unformatted = unformatNumber(rawValue);
      if (unformatted === "") {
         onChange("");
         return;
      }
      // Allow only numbers, minus sign, and decimal point
      if (!/^-?\d*\.?\d*$/.test(unformatted)) {
         return;
      }
      // Always update the input value for controlled input
      onChange(unformatted);
      setTimeout(() => {
         if (inputRef.current) {
            let pos = selectionStart;
            // Count commas before caret in old and new
            const leftRaw = rawValue.slice(0, selectionStart);
            const leftUnformatted = unformatNumber(leftRaw);
            const leftFormatted = formatNumberIndian(leftUnformatted);
            pos = leftFormatted.length;
            inputRef.current.setSelectionRange(pos, pos);
         }
      }, 0);
   };

   const increment = () => {
      // If empty, start from min value or 0
      const currentValue =
         value === "" || value === undefined || value === null
            ? min !== undefined
               ? Number(min)
               : 0
            : Number(value);
      const stepValue = Number(step);
      const newValue = currentValue + stepValue;

      if (!max || newValue <= Number(max)) {
         onChange(newValue.toString());
      }
   };

   const decrement = () => {
      // If empty, start from min value or 0
      const currentValue =
         value === "" || value === undefined || value === null
            ? min !== undefined
               ? Number(min)
               : 0
            : Number(value);
      const stepValue = Number(step);
      const newValue = currentValue - stepValue;

      if (!min || newValue >= Number(min)) {
         onChange(newValue.toString());
      }
   };

   // When blurring, convert to number if valid, don't auto-default empty values
   const handleBlur = () => {
      setFocused(false);
      if (value === "" || value === undefined || value === null) {
         // Don't auto-default to any number, keep it empty
         return;
      }
      const numValue = Number(value);
      if (!isNaN(numValue)) {
         // Apply min/max constraints
         if (min !== undefined && numValue < min) {
            onChange(min.toString());
            return;
         }
         if (max !== undefined && numValue > max) {
            onChange(max.toString());
            return;
         }
         onChange(numValue.toString());
      } else {
         // If invalid input, clear it instead of defaulting
         onChange("");
      }
   };

   const handleFocus = (e) => {
      setFocused(true);
      if (onFocus) onFocus(e);
   };

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
               ref={inputRef}
               type="text"
               inputMode="numeric"
               value={formatNumberIndian(
                  displayValue === undefined || displayValue === null
                     ? ""
                     : displayValue.toString()
               )}
               onChange={handleChange}
               onFocus={handleFocus}
               onBlur={handleBlur}
               placeholder={placeholder}
               disabled={disabled}
               className={`w-full px-4 py-3 pr-12 bg-gray-800/50 border-2 rounded-xl text-white placeholder-gray-500 transition-all duration-300 focus:outline-none
               /* Remove default number input arrows */
               [&::-webkit-outer-spin-button]:appearance-none
               [&::-webkit-inner-spin-button]:appearance-none
               [-moz-appearance:textfield]
               ${
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
            />

            {/* Number controls */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col">
               <button
                  type="button"
                  onClick={increment}
                  disabled={
                     disabled ||
                     (max !== undefined && Number(value || 0) >= Number(max))
                  }
                  className="p-1 text-gray-400 hover:text-white cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  <svg
                     className="w-3 h-3"
                     fill="currentColor"
                     viewBox="0 0 20 20"
                  >
                     <path
                        fillRule="evenodd"
                        d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                        clipRule="evenodd"
                     />
                  </svg>
               </button>
               <button
                  type="button"
                  onClick={decrement}
                  disabled={
                     disabled ||
                     (min !== undefined && Number(value || 0) <= Number(min))
                  }
                  className="p-1 text-gray-400 hover:text-white transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
               >
                  <svg
                     className="w-3 h-3"
                     fill="currentColor"
                     viewBox="0 0 20 20"
                  >
                     <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                     />
                  </svg>
               </button>
            </div>

            {focused && !error && (
               <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-600/20 pointer-events-none"></div>
            )}
         </div>

         {error && (
            <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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

export default NumberInput;
