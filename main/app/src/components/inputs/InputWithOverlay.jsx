import { useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../lib/ThemeContext";
import { TextInput } from "../ui/TextInput";

export const InputWithOverlay = ({
   label,
   value,
   onChange,
   placeholder = "",
   required = false,
   disabled = false,
   error = "",
   helperText = "",
   style,
   overlayTitle = "Input",
   renderOverlayContent,
   ...props
}) => {
   const { theme } = useTheme();
   const [showOverlay, setShowOverlay] = useState(false);

   const handleOpenOverlay = () => {
      if (!disabled) {
         setShowOverlay(true);
      }
   };

   const handleSave = (newValue) => {
      onChange(newValue);
      setShowOverlay(false);
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

         <TouchableOpacity
            onPress={handleOpenOverlay}
            disabled={disabled}
            className={`border rounded-lg px-3 py-3 ${
               error ? "border-red-500" : "border-gray-300"
            } ${disabled ? "opacity-50" : ""}`}
            style={{
               backgroundColor: theme.colors.surface,
               borderColor: error ? "#EF4444" : theme.colors.border,
            }}
         >
            <Text
               style={{
                  color: value ? theme.colors.text : theme.colors.textSecondary,
               }}
            >
               {value || placeholder}
            </Text>
         </TouchableOpacity>

         {helperText && !error && (
            <Text
               className="text-xs mt-1"
               style={{ color: theme.colors.textSecondary }}
            >
               {helperText}
            </Text>
         )}

         {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}

         {/* Overlay Modal */}
         <Modal
            visible={showOverlay}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => setShowOverlay(false)}
         >
            <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
               {/* Header */}
               <View
                  className="flex-row justify-between items-center px-4 py-3 border-b"
                  style={{ borderBottomColor: theme.colors.border }}
               >
                  <TouchableOpacity onPress={() => setShowOverlay(false)}>
                     <Text style={{ color: theme.colors.primary }}>Cancel</Text>
                  </TouchableOpacity>
                  <Text
                     className="font-semibold"
                     style={{ color: theme.colors.text }}
                  >
                     {overlayTitle}
                  </Text>
                  <TouchableOpacity onPress={() => handleSave(value)}>
                     <Text style={{ color: theme.colors.primary }}>Save</Text>
                  </TouchableOpacity>
               </View>

               {/* Content */}
               <View className="flex-1 p-4">
                  {renderOverlayContent ? (
                     renderOverlayContent(value, onChange, handleSave)
                  ) : (
                     <TextInput
                        label={label}
                        value={value}
                        onChangeText={onChange}
                        placeholder={placeholder}
                        {...props}
                     />
                  )}
               </View>
            </View>
         </Modal>
      </View>
   );
};
