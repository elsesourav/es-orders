import { TextInput as RNTextInput, Text, View } from "react-native";
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
   ...props
}) => {
   const { theme } = useTheme();

   const handleTextChange = (text) => {
      if (onChangeText) {
         onChangeText(text);
      }
   };

   return (
      <View style={style}>
         {label && (
            <Text
               className="text-sm font-medium mb-1"
               style={{ color: theme.colors.text }}
            >
               {label}
            </Text>
         )}
         <RNTextInput
            className={`border rounded-lg px-3 py-2 ${
               error ? "border-red-500" : "border-gray-300"
            }`}
            style={[
               {
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: error ? "#EF4444" : theme.colors.border,
                  fontSize: 16,
                  lineHeight: 20,
               },
               inputStyle,
            ]}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.textSecondary}
            value={value || ""}
            onChangeText={handleTextChange}
            secureTextEntry={secureTextEntry}
            autoComplete="off"
            autoCorrect={false}
            {...props}
         />
         {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
      </View>
   );
};
