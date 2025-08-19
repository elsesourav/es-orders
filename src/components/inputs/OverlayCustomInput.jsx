import { useState } from "react";
import DateInput from "./DateInput";
import NumberInput from "./NumberInput";
import NumberSelectInput from "./NumberSelectInput";
import SelectInput from "./SelectInput";
import TextInput from "./TextInput";

/**
 * OverlayCustomInput - A modal component for creating custom forms with multiple input types
 *
 * @example
 * // Basic usage with different field types
 * <OverlayCustomInput
 *    isOpen={isModalOpen}
 *    onClose={() => setIsModalOpen(false)}
 *    onSave={(data) => console.log('Saved data:', data)}
 *    title="User Registration"
 *    initialData={{ name: '', age: 0 }}
 *    fields={[
 *       {
 *          name: "fullName",
 *          label: "Full Name",
 *          type: "text",
 *          placeholder: "Enter your full name",
 *          required: true,
 *          helperText: "Your legal name as it appears on documents"
 *       },
 *       {
 *          name: "age",
 *          label: "Age",
 *          type: "number",
 *          min: 18,
 *          max: 100,
 *          step: 1,
 *          required: true
 *       },
 *       {
 *          name: "birthDate",
 *          label: "Birth Date",
 *          type: "date",
 *          required: true
 *       },
 *       {
 *          name: "country",
 *          label: "Country",
 *          type: "select",
 *          options: [
 *             { value: "us", label: "United States" },
 *             { value: "ca", label: "Canada" },
 *             { value: "uk", label: "United Kingdom" }
 *          ],
 *          placeholder: "Select your country",
 *          required: true
 *       },
 *       {
 *          name: "priority",
 *          label: "Priority Level",
 *          type: "numberSelect",
 *          options: [
 *             { value: 1, label: "Low" },
 *             { value: 2, label: "Medium" },
 *             { value: 3, label: "High" }
 *          ],
 *          required: false
 *       }
 *    ]}
 * />
 *
 * @example
 * // Multiple field example - allows adding multiple instances of the same field
 * <OverlayCustomInput
 *    isOpen={isModalOpen}
 *    onClose={() => setIsModalOpen(false)}
 *    onSave={(data) => console.log('Saved data:', data)}
 *    title="Favorite Settings"
 *    fields={[
 *       {
 *          name: "favoriteMonths",
 *          label: "Favorite Months",
 *          type: "select",
 *          multiple: true,  // This enables add/remove functionality
 *          options: [
 *             { value: "january", label: "January" },
 *             { value: "february", label: "February" },
 *             { value: "march", label: "March" },
 *             // ... more months
 *          ],
 *          placeholder: "Select a month",
 *          required: true,
 *          helperText: "Choose your preferred months"
 *       },
 *       {
 *          name: "phoneNumbers",
 *          label: "Phone Numbers",
 *          type: "text",
 *          multiple: true,  // Users can add multiple phone numbers
 *          placeholder: "Enter phone number",
 *          required: false,
 *          helperText: "Add all your contact numbers"
 *       }
 *    ]}
 * />
 *
 * // The saved data structure will be:
 * // {
 * //    favoriteMonths: ["january", "march", "july"],  // Array for multiple fields
 * //    phoneNumbers: ["+1234567890", "+0987654321"]   // Array for multiple fields
 * // }
 *
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Called when modal is closed/cancelled
 * @param {function} onSave - Called with form data when saved
 * @param {string} title - Modal title
 * @param {object} initialData - Initial form values
 * @param {array} fields - Array of field configurations
 *
 * Field Configuration Options:
 * - name: string (required) - Field identifier
 * - label: string (required) - Display label
 * - type: string (required) - "text", "number", "date", "select", "numberSelect"
 * - multiple: boolean - Enable add/remove functionality for multiple values
 * - placeholder: string - Input placeholder text
 * - required: boolean - Field validation requirement
 * - helperText: string - Additional help text
 * - options: array - For select/numberSelect types: [{ value, label }]
 * - min/max/step: number - For number type inputs
 */

const OverlayCustomInput = ({
   isOpen,
   onClose,
   onSave,
   title = "Custom Input",
   initialData = {},
   fields = [],
}) => {
   const [formData, setFormData] = useState(initialData);
   const [errors, setErrors] = useState({});

   const handleFieldChange = (fieldName, value, index = null) => {
      if (index !== null) {
         // Handle array fields
         setFormData((prev) => {
            const currentArray = prev[fieldName] || [];
            const newArray = [...currentArray];
            newArray[index] = value;
            return {
               ...prev,
               [fieldName]: newArray,
            };
         });
      } else {
         // Handle single fields
         setFormData((prev) => ({
            ...prev,
            [fieldName]: value,
         }));
      }

      // Clear error when user starts typing
      if (errors[fieldName]) {
         setErrors((prev) => ({
            ...prev,
            [fieldName]: "",
         }));
      }
   };

   const addNewField = (fieldName) => {
      setFormData((prev) => {
         const currentArray = prev[fieldName] || [];
         return {
            ...prev,
            [fieldName]: [...currentArray, ""],
         };
      });
   };

   const removeField = (fieldName, index) => {
      setFormData((prev) => {
         const currentArray = prev[fieldName] || [];
         const newArray = currentArray.filter((_, i) => i !== index);
         return {
            ...prev,
            [fieldName]: newArray.length > 0 ? newArray : undefined,
         };
      });
   };

   const getDisplayValueForField = (field, value) => {
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

   const validateForm = () => {
      const newErrors = {};

      fields.forEach((field) => {
         if (field.required) {
            if (field.multiple) {
               const fieldArray = formData[field.name] || [];
               if (
                  fieldArray.length === 0 ||
                  fieldArray.some((item) => !item || item === "")
               ) {
                  newErrors[field.name] = `${field.label} is required`;
               }
            } else {
               if (!formData[field.name] || formData[field.name] === "") {
                  newErrors[field.name] = `${field.label} is required`;
               }
            }
         }
      });

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const handleSave = () => {
      if (validateForm()) {
         onSave(formData);
         onClose();
      }
   };

   const handleCancel = () => {
      setFormData(initialData);
      setErrors({});
      onClose();
   };

   const renderField = (field) => {
      if (field.multiple) {
         const fieldArray = formData[field.name] || [""];

         return (
            <div key={field.name} className="mb-4">
               <label className="block text-sm font-medium text-gray-300 mb-1">
                  {field.label}
                  {field.required && (
                     <span className="text-red-400 ml-1">*</span>
                  )}
               </label>

               {/* Display saved values as chips */}
               {formData[field.name] && formData[field.name].length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3 p-2 bg-gray-700/30 rounded-lg border border-gray-600/50">
                     {formData[field.name].map(
                        (savedValue, savedIndex) =>
                           savedValue && (
                              <div
                                 key={`saved-${field.name}-${savedIndex}`}
                                 className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600/20 text-blue-300 text-sm rounded-md border border-blue-500/30"
                              >
                                 <span>
                                    {getDisplayValueForField(field, savedValue)}
                                 </span>
                                 <button
                                    type="button"
                                    onClick={() =>
                                       removeField(field.name, savedIndex)
                                    }
                                    className="ml-1 text-blue-400 hover:text-red-400 transition-colors cursor-pointer"
                                 >
                                    <svg
                                       className="w-3 h-3"
                                       fill="currentColor"
                                       viewBox="0 0 20 20"
                                    >
                                       <path
                                          fillRule="evenodd"
                                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                          clipRule="evenodd"
                                       />
                                    </svg>
                                 </button>
                              </div>
                           )
                     )}
                  </div>
               )}

               {fieldArray.map((value, index) => (
                  <div
                     key={`${field.name}-${index}`}
                     className="flex items-center gap-2 mb-2"
                  >
                     <div className="flex-1">
                        {renderSingleInput(field, value, index)}
                     </div>

                     {fieldArray.length > 1 && (
                        <button
                           type="button"
                           onClick={() => removeField(field.name, index)}
                           className="p-2 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                        >
                           <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                           >
                              <path
                                 fillRule="evenodd"
                                 d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                 clipRule="evenodd"
                              />
                           </svg>
                        </button>
                     )}
                  </div>
               ))}

               <button
                  type="button"
                  onClick={() => addNewField(field.name)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
               >
                  <svg
                     className="w-4 h-4"
                     fill="currentColor"
                     viewBox="0 0 20 20"
                  >
                     <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clipRule="evenodd"
                     />
                  </svg>
                  Add another {field.label ? field.label.toLowerCase() : ""}
               </button>

               {errors[field.name] && (
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
                     {errors[field.name]}
                  </p>
               )}

               {field.helperText && !errors[field.name] && (
                  <p className="mt-1 text-sm text-gray-400">
                     {field.helperText}
                  </p>
               )}
            </div>
         );
      } else {
         return renderSingleInput(field, formData[field.name] || "", null);
      }
   };

   const renderSingleInput = (field, value, index) => {
      const key = index !== null ? `${field.name}-${index}` : field.name;
      const commonProps = {
         label: index !== null ? null : field.label,
         value: value,
         onChange: (val) => handleFieldChange(field.name, val, index),
         required: index === null ? field.required : false,
         error: index === null ? errors[field.name] : "",
         helperText: index === null ? field.helperText : "",
         className: index === null ? "mb-4" : "",
      };

      switch (field.type) {
         case "text":
            return (
               <TextInput
                  key={key}
                  {...commonProps}
                  placeholder={field.placeholder}
               />
            );

         case "date":
            return (
               <DateInput
                  key={key}
                  {...commonProps}
                  placeholder={field.placeholder}
               />
            );

         case "number":
            return (
               <NumberInput
                  key={key}
                  {...commonProps}
                  placeholder={field.placeholder}
                  min={field.min}
                  max={field.max}
                  step={field.step}
               />
            );

         case "select":
            return (
               <SelectInput
                  key={key}
                  {...commonProps}
                  options={field.options || []}
                  placeholder={field.placeholder}
               />
            );

         case "numberSelect":
            return (
               <NumberSelectInput
                  key={key}
                  {...commonProps}
                  options={field.options || []}
                  placeholder={field.placeholder}
               />
            );

         default:
            return null;
      }
   };

   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
         {/* Backdrop */}
         <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCancel}
         />

         {/* Modal */}
         <div className="relative bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
               <h3 className="text-xl font-semibold text-white">{title}</h3>
               <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-white transition-colors p-1 cursor-pointer"
               >
                  <svg
                     className="w-6 h-6"
                     fill="currentColor"
                     viewBox="0 0 20 20"
                  >
                     <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                     />
                  </svg>
               </button>
            </div>

            {/* Content */}
            <div className="p-6">{fields.map(renderField)}</div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
               <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-400 hover:text-white cursor-pointer transition-colors"
               >
                  Cancel
               </button>
               <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-medium cursor-pointer"
               >
                  Save
               </button>
            </div>
         </div>
      </div>
   );
};

export default OverlayCustomInput;
