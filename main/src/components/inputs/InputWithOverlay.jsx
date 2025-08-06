import { useState } from "react";
import OverlayCustomInput from "./OverlayCustomInput";

const InputWithOverlay = ({
   label,
   value,
   onChange,
   placeholder = "Click to add custom input",
   defaultValue = null,
   required = false,
   error = "",
   helperText = "",
   className = "",
   width = "w-full",
   overlayTitle = "Custom Input",
   overlayFields = [],
}) => {
   const [isOverlayOpen, setIsOverlayOpen] = useState(false);
   const [focused, setFocused] = useState(false);

   // Use value if provided, otherwise use defaultValue
   const displayValue =
      value !== undefined &&
      value !== null &&
      Object.keys(value || {}).length > 0
         ? value
         : defaultValue;

   const handleOpenOverlay = () => {
      setIsOverlayOpen(true);
   };

   const handleSaveOverlay = (formData) => {
      onChange(formData);
      setIsOverlayOpen(false);
   };

   const handleCloseOverlay = () => {
      setIsOverlayOpen(false);
   };

   const getDisplayValueForField = (field, value) => {
      if (!field) return value;

      switch (field.type) {
         case "select":
         case "numberSelect": {
            const option = field.options?.find((opt) => opt.value === value);
            return option ? option.label : value;
         }
         case "date": {
            return value ? new Date(value).toLocaleDateString() : value;
         }
         default:
            return value;
      }
   };

   const renderChipsDisplay = () => {
      if (!value || Object.keys(value).length === 0) {
         return <span className="text-gray-500">{placeholder}</span>;
      }

      const entries = Object.entries(value);

      return (
         <div className="flex flex-wrap gap-1 -my-1">
            {entries.map(([fieldName, fieldValue]) => {
               const field = overlayFields.find((f) => f.name === fieldName);

               if (Array.isArray(fieldValue)) {
                  // Handle multiple values (arrays)
                  return fieldValue.map(
                     (item, index) =>
                        item && (
                           <div
                              key={`${fieldName}-${index}`}
                              className="inline-flex items-center px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded-md border border-blue-500/30"
                           >
                              {getDisplayValueForField(field, item)}
                           </div>
                        )
                  );
               } else {
                  // Handle single values
                  return (
                     fieldValue && (
                        <div
                           key={fieldName}
                           className="inline-flex items-center px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded-md border border-blue-500/30"
                        >
                           {getDisplayValueForField(field, fieldValue)}
                        </div>
                     )
                  );
               }
            })}
         </div>
      );
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
            <button
               type="button"
               onClick={handleOpenOverlay}
               onFocus={() => setFocused(true)}
               onBlur={() => setFocused(false)}
               className={`w-full px-4 py-3 pr-10 bg-gray-800/50 border-2 rounded-xl text-left transition-all cursor-pointer duration-300 focus:outline-none ${
                  error
                     ? "border-red-500 focus:border-red-400"
                     : focused
                     ? "border-blue-500 focus:border-blue-400"
                     : "border-gray-600 hover:border-gray-500"
               } hover:bg-gray-800/70 cursor-pointer`}
            >
               {renderChipsDisplay()}

               <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg
                     className="w-5 h-5 text-gray-400"
                     fill="currentColor"
                     viewBox="0 0 20 20"
                  >
                     <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clipRule="evenodd"
                     />
                  </svg>
               </div>
            </button>

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

         <OverlayCustomInput
            isOpen={isOverlayOpen}
            onClose={handleCloseOverlay}
            onSave={handleSaveOverlay}
            title={overlayTitle}
            initialData={displayValue || {}}
            fields={overlayFields}
         />
      </div>
   );
};

export default InputWithOverlay;
