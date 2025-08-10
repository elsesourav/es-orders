import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../lib/ThemeContext";
import { TextInput } from "../ui/TextInput";

export const MultipleInput = ({
   label,
   value = [],
   onChange,
   placeholder = "Add item",
   required = false,
   error = "",
   helperText = "",
   style,
   maxItems,
   addButtonText = "Add",
   emptyText = "No items added",
}) => {
   const { theme } = useTheme();
   const [newItem, setNewItem] = useState("");

   const handleAdd = () => {
      if (newItem.trim() && (!maxItems || value.length < maxItems)) {
         const updatedValue = [...value, newItem.trim()];
         onChange(updatedValue);
         setNewItem("");
      }
   };

   const handleRemove = (index) => {
      const updatedValue = value.filter((_, i) => i !== index);
      onChange(updatedValue);
   };

   return (
      <View style={style}>
         {label && (
            <Text
               className="text-sm font-medium mb-1"
               style={{ color: theme.colors.text }}
            >
               {label}
               {required && <Text className="text-red-500 ml-1">*</Text>}
            </Text>
         )}

         {/* Add new item */}
         <View className="flex-row items-center mb-2">
            <TextInput
               placeholder={placeholder}
               value={newItem}
               onChangeText={setNewItem}
               style={{ flex: 1, marginRight: 8 }}
               onSubmitEditing={handleAdd}
               returnKeyType="done"
            />
            <TouchableOpacity
               onPress={handleAdd}
               disabled={
                  !newItem.trim() || (maxItems && value.length >= maxItems)
               }
               className={`px-3 py-2 rounded-lg ${
                  !newItem.trim() || (maxItems && value.length >= maxItems)
                     ? "opacity-50"
                     : ""
               }`}
               style={{ backgroundColor: theme.colors.primary }}
            >
               <Text className="text-white font-medium">{addButtonText}</Text>
            </TouchableOpacity>
         </View>

         {/* Items list */}
         {value.length === 0 ? (
            <View
               className="p-4 rounded-lg border border-dashed"
               style={{ borderColor: theme.colors.border }}
            >
               <Text
                  className="text-center"
                  style={{ color: theme.colors.textSecondary }}
               >
                  {emptyText}
               </Text>
            </View>
         ) : (
            <ScrollView className="max-h-40" nestedScrollEnabled>
               {value.map((item, index) => (
                  <View
                     key={index}
                     className="flex-row items-center justify-between p-3 mb-2 rounded-lg"
                     style={{ backgroundColor: theme.colors.surface }}
                  >
                     <Text
                        className="flex-1 mr-2"
                        style={{ color: theme.colors.text }}
                     >
                        {item}
                     </Text>
                     <TouchableOpacity
                        onPress={() => handleRemove(index)}
                        className="p-1 rounded"
                        style={{ backgroundColor: theme.colors.background }}
                     >
                        <Text style={{ color: "#EF4444" }}>✕</Text>
                     </TouchableOpacity>
                  </View>
               ))}
            </ScrollView>
         )}

         {maxItems && (
            <Text
               className="text-xs mt-1"
               style={{ color: theme.colors.textSecondary }}
            >
               {value.length}/{maxItems} items
            </Text>
         )}

         {helperText && !error && (
            <Text
               className="text-xs mt-1"
               style={{ color: theme.colors.textSecondary }}
            >
               {helperText}
            </Text>
         )}

         {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
      </View>
   );
};
