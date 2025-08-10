import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../lib/ThemeContext";

export const Button = ({
   title,
   onPress,
   variant = "primary",
   size = "md",
   disabled = false,
   loading = false,
   style,
   textStyle,
   ...props
}) => {
   const { theme } = useTheme();

   const getButtonStyles = () => {
      const baseStyles =
         "px-4 py-2 rounded-lg flex-row items-center justify-center";

      const variantStyles = {
         primary: `bg-blue-600 ${disabled ? "opacity-50" : ""}`,
         secondary: `bg-gray-600 ${disabled ? "opacity-50" : ""}`,
         outline: `border-2 border-blue-600 ${disabled ? "opacity-50" : ""}`,
         ghost: `${disabled ? "opacity-50" : ""}`,
      };

      const sizeStyles = {
         sm: "px-3 py-1.5",
         md: "px-4 py-2",
         lg: "px-6 py-3",
      };

      return `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]}`;
   };

   const getTextStyles = () => {
      const baseStyles = "font-medium text-center";

      const variantStyles = {
         primary: "text-white",
         secondary: "text-white",
         outline: "text-blue-600",
         ghost: "text-blue-600",
      };

      const sizeStyles = {
         sm: "text-sm",
         md: "text-base",
         lg: "text-lg",
      };

      return `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]}`;
   };

   return (
      <TouchableOpacity
         className={getButtonStyles()}
         onPress={onPress}
         disabled={disabled || loading}
         style={style}
         {...props}
      >
         {loading && (
            <ActivityIndicator
               size="small"
               color={
                  variant === "outline" || variant === "ghost"
                     ? theme.colors.primary
                     : "white"
               }
               style={{ marginRight: 8 }}
            />
         )}
         <Text className={getTextStyles()} style={textStyle}>
            {title}
         </Text>
      </TouchableOpacity>
   );
};
