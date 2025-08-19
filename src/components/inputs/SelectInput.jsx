import { useEffect, useRef, useState } from "react";

const SelectInput = ({
   label,
   value,
   onChange,
   options = [],
   placeholder = "Select an option",
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
   const [searchTerm, setSearchTerm] = useState("");
   const [highlightedIndex, setHighlightedIndex] = useState(-1);
   const inputRef = useRef(null);

   // Use value if provided, otherwise use defaultValue
   const displayValue =
      value !== undefined && value !== null ? value : defaultValue;

   // Filter options based on search term
   const filteredOptions = searchTerm
      ? options.filter((option) =>
           option.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options;

   const handleSelect = (option) => {
      onChange(option.value);
      setIsOpen(false);
      setFocused(false);
      setSearchTerm("");
      setHighlightedIndex(-1);
   };

   const handleButtonClick = (e) => {
      e.preventDefault();
      if (!disabled) {
         setIsOpen(!isOpen);
         if (!isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
         }
      }
   };

   const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
         case "ArrowDown":
            e.preventDefault();
            setHighlightedIndex((prev) =>
               prev < filteredOptions.length - 1 ? prev + 1 : 0
            );
            break;
         case "ArrowUp":
            e.preventDefault();
            setHighlightedIndex((prev) =>
               prev > 0 ? prev - 1 : filteredOptions.length - 1
            );
            break;
         case "Enter":
            e.preventDefault();
            if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
               handleSelect(filteredOptions[highlightedIndex]);
            } else if (filteredOptions.length > 0) {
               // Always select first option if no specific option is highlighted
               handleSelect(filteredOptions[0]);
            }
            break;
         case "Escape":
            setIsOpen(false);
            setSearchTerm("");
            setHighlightedIndex(-1);
            break;
      }
   };

   const handleSearchChange = (e) => {
      setSearchTerm(e.target.value);
      setHighlightedIndex(-1); // Reset highlight when searching
   };

   // Reset highlighted index when filtered options change
   useEffect(() => {
      setHighlightedIndex(-1);
   }, [searchTerm]);

   // Close dropdown when clicking outside
   useEffect(() => {
      const handleClickOutside = (e) => {
         if (!e.target.closest(".select-input-container")) {
            setIsOpen(false);
            setSearchTerm("");
            setHighlightedIndex(-1);
         }
      };

      if (isOpen) {
         document.addEventListener("mousedown", handleClickOutside);
         return () =>
            document.removeEventListener("mousedown", handleClickOutside);
      }
   }, [isOpen]);

   const selectedOption = options.find((opt) => opt.value === displayValue);

   return (
      <div className={`relative ${width} ${className} select-input-container`}>
         {label && (
            <label className="block text-sm font-medium text-gray-300 mb-1">
               {label}
               {required && <span className="text-red-400 ml-1">*</span>}
            </label>
         )}

         <div className="relative">
            {isOpen ? (
               <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Search options..."
                  className={`w-full px-4 py-3 pr-10 bg-gray-800/50 border-2 rounded-xl text-white transition-all duration-300 focus:outline-none ${
                     error
                        ? "border-red-500 focus:border-red-400"
                        : "border-blue-500 focus:border-blue-400"
                  }`}
               />
            ) : (
               <button
                  type="button"
                  onClick={handleButtonClick}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  onKeyDown={handleKeyDown}
                  disabled={disabled}
                  className={`w-full px-4 py-3 pr-10 bg-gray-800/50 border-2 rounded-xl text-nowrap overflow-y-scroll text-left transition-all duration-300 focus:outline-none cursor-pointer ${
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
                     {selectedOption ? selectedOption.label : placeholder}
                  </span>
               </button>
            )}

            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
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

            {(focused || isOpen) && !error && (
               <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-600/20 pointer-events-none"></div>
            )}

            {/* Dropdown Options */}
            {isOpen && !disabled && (
               <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl max-h-60 overflow-y-auto cursor-pointer">
                  {filteredOptions.length > 0 ? (
                     filteredOptions.map((option, index) => (
                        <button
                           key={option.value}
                           type="button"
                           onClick={() => handleSelect(option)}
                           className={`w-full px-4 py-3 text-left hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer ${
                              index === 0 ? "rounded-t-xl" : ""
                           } ${
                              index === filteredOptions.length - 1
                                 ? "rounded-b-xl"
                                 : ""
                           } ${
                              option.value === value
                                 ? "bg-blue-600/20 text-blue-300"
                                 : highlightedIndex === index
                                 ? "bg-gray-700/70 text-white"
                                 : "text-white"
                           }`}
                        >
                           {option.label}
                        </button>
                     ))
                  ) : (
                     <div className="px-4 py-3 text-gray-500 text-center">
                        {searchTerm
                           ? "No options found"
                           : "No options available"}
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
      </div>
   );
};

export default SelectInput;
