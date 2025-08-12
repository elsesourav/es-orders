import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
   TextInput as RNTextInput,
   Text,
   TouchableOpacity,
   View,
} from "react-native";
import { useTheme } from "../../lib/ThemeContext";

export const TextInput = ({
   label,
   error,
   placeholder,
   value,
   onChangeText,
   secureTextEntry = false,
   style,
   inputStyle,
   helperText,
   required = false,
   showPasswordToggle = false, // New prop to enable password visibility toggle
   ...props
}) => {
   const { theme } = useTheme();
   const [isPasswordVisible, setIsPasswordVisible] = useState(false);

   const handleTextChange = (text) => {
      if (onChangeText) {
         onChangeText(text);
      }
   };

   const togglePasswordVisibility = () => {
      setIsPasswordVisible(!isPasswordVisible);
   };

   const actualSecureTextEntry = secureTextEntry && !isPasswordVisible;

   return (
      <View style={[{ marginBottom: 16 }, style]}>
         {label && (
            <Text
               className="text-base font-semibold mb-2"
               style={{ color: theme.colors.text }}
            >
               {label}
               {required && <Text style={{ color: "#EF4444" }}> *</Text>}
            </Text>
         )}

         <View style={{ position: "relative" }}>
            <RNTextInput
               style={[
                  {
                     backgroundColor: theme.colors.surface,
                     color: theme.colors.text,
                     borderColor: error ? "#EF4444" : theme.colors.border,
                     borderWidth: 1.5,
                     borderRadius: 12,
                     paddingHorizontal: 16,
                     paddingVertical: 16,
                     fontSize: 16,
                     lineHeight: 20,
                     minHeight: 56, // Make fields bigger
                     paddingRight: showPasswordToggle ? 56 : 16, // Space for eye icon
                     shadowColor: "#000",
                     shadowOffset: { width: 0, height: 1 },
                     shadowOpacity: 0.05,
                     shadowRadius: 2,
                     elevation: 1,
                  },
                  inputStyle,
               ]}
               placeholder={placeholder}
               placeholderTextColor={theme.colors.textSecondary}
               value={value || ""}
               onChangeText={handleTextChange}
               secureTextEntry={actualSecureTextEntry}
               autoComplete="off"
               autoCorrect={false}
               {...props}
            />

            {/* Password visibility toggle */}
            {showPasswordToggle && (
               <TouchableOpacity
                  onPress={togglePasswordVisibility}
                  style={{
                     position: "absolute",
                     right: 6,
                     top: 0,
                     bottom: 0,
                     justifyContent: "center",
                     alignItems: "center",
                     width: 40,
                     height: "100%",
                  }}
                  activeOpacity={0.7}
               >
                  <Ionicons
                     name={isPasswordVisible ? "eye-off" : "eye"}
                     size={22}
                     color={theme.colors.textSecondary}
                  />
               </TouchableOpacity>
            )}
         </View>

         {helperText && (
            <Text
               className="text-sm mt-2"
               style={{ color: theme.colors.textSecondary }}
            >
               {helperText}
            </Text>
         )}

         {error && <Text className="text-red-500 text-sm mt-2">{error}</Text>}
      </View>
   );
};
