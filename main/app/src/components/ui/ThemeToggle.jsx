import { Text, TouchableOpacity } from "react-native";
import { useTheme } from "../../lib/ThemeContext";

export const ThemeToggle = ({ size = "md", style }) => {
   const { isDark, toggleTheme, theme } = useTheme();

   const sizeMap = {
      sm: { container: "p-1", text: "text-sm" },
      md: { container: "p-2", text: "text-base" },
      lg: { container: "p-3", text: "text-lg" },
   };

   const currentSize = sizeMap[size] || sizeMap.md;

   return (
      <TouchableOpacity
         onPress={toggleTheme}
         className={`${currentSize.container} rounded-lg`}
         style={[
            {
               backgroundColor: theme.colors.surface,
            },
            style,
         ]}
         activeOpacity={0.7}
      >
         <Text className={currentSize.text}>{isDark ? "☀️" : "🌙"}</Text>
      </TouchableOpacity>
   );
};
