import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../../lib/ThemeContext";

export const Button = ({
   title,
   onPress,
   variant = "default",
   size = "default",
   disabled = false,
   loading = false,
   style,
   textStyle,
   children,
   ...props
}) => {
   const { theme } = useTheme();

   const getButtonStyles = () => {
      const baseStyle = {
         flexDirection: "row",
         alignItems: "center",
         justifyContent: "center",
         borderRadius: 8,
         opacity: disabled ? 0.6 : 1,
         overflow: "hidden", // Prevent white box artifacts
         // Modern shadow system
         shadowColor: "#000",
         shadowOffset: { width: 0, height: 1 },
         shadowOpacity: 0.05,
         shadowRadius: 2,
         elevation: 1,
      };

      const sizeStyles = {
         sm: {
            paddingHorizontal: 12,
            paddingVertical: 8,
            minHeight: 36,
            borderRadius: 6,
         },
         default: {
            paddingHorizontal: 16,
            paddingVertical: 10,
            minHeight: 40,
            borderRadius: 8,
         },
         lg: {
            paddingHorizontal: 20,
            paddingVertical: 12,
            minHeight: 44,
            borderRadius: 10,
         },
         icon: {
            padding: 10,
            minHeight: 40,
            minWidth: 40,
            borderRadius: 8,
         },
      };

      const variantStyles = {
         default: {
            backgroundColor: theme.colors.primary,
            borderWidth: 0,
         },
         destructive: {
            backgroundColor: "#dc2626", // red-600
            borderWidth: 0,
         },
         outline: {
            backgroundColor: "transparent",
            borderWidth: 1,
            borderColor: theme.colors.border || "#e5e7eb",
            shadowOpacity: 0,
            elevation: 0,
         },
         secondary: {
            backgroundColor: theme.colors.card || "#f3f4f6",
            borderWidth: 0,
         },
         ghost: {
            backgroundColor: "transparent",
            borderWidth: 0,
            shadowOpacity: 0,
            elevation: 0,
         },
         link: {
            backgroundColor: "transparent",
            borderWidth: 0,
            shadowOpacity: 0,
            elevation: 0,
            paddingHorizontal: 0,
            paddingVertical: 0,
            minHeight: "auto",
         },
         // Soft variants with transparency
         destructiveSoft: {
            backgroundColor: "#dc262615", // red with alpha
            borderWidth: 1,
            borderColor: "#dc262630",
         },
         primarySoft: {
            backgroundColor: theme.colors.primary + "15" || "#3b82f615",
            borderWidth: 1,
            borderColor: theme.colors.primary + "30" || "#3b82f630",
         },
         successSoft: {
            backgroundColor: "#16a34a15", // green with alpha
            borderWidth: 1,
            borderColor: "#16a34a30",
         },
      };

      return {
         ...baseStyle,
         ...sizeStyles[size],
         ...variantStyles[variant],
      };
   };

   const getTextStyles = () => {
      const baseStyle = {
         fontWeight: "600",
         textAlign: "center",
         includeFontPadding: false, // Better text alignment on Android
      };

      const sizeStyles = {
         sm: { fontSize: 14, fontWeight: "500" },
         default: { fontSize: 14, fontWeight: "600" },
         lg: { fontSize: 16, fontWeight: "600" },
         icon: { fontSize: 0 }, // No text for icon buttons
      };

      const variantStyles = {
         default: { color: "#ffffff" },
         destructive: { color: "#ffffff" },
         outline: { color: theme.colors.text || "#000000" },
         secondary: { color: theme.colors.text || "#000000" },
         ghost: { color: theme.colors.text || "#000000" },
         link: {
            color: theme.colors.primary || "#3b82f6",
            textDecorationLine: "underline",
         },
         destructiveSoft: { color: "#dc2626" },
         primarySoft: { color: theme.colors.primary || "#3b82f6" },
         successSoft: { color: "#16a34a" },
      };

      return {
         ...baseStyle,
         ...sizeStyles[size],
         ...variantStyles[variant],
      };
   };

   const getLoadingColor = () => {
      const transparentVariants = [
         "outline",
         "ghost",
         "link",
         "destructiveSoft",
         "primarySoft",
         "successSoft",
      ];

      if (transparentVariants.includes(variant)) {
         if (variant === "destructiveSoft") return "#dc2626";
         if (variant === "primarySoft")
            return theme.colors.primary || "#3b82f6";
         if (variant === "successSoft") return "#16a34a";
         if (variant === "outline" || variant === "ghost")
            return theme.colors.text || "#000000";
         if (variant === "link") return theme.colors.primary || "#3b82f6";
      }

      if (variant === "secondary") return theme.colors.text || "#000000";

      return "#ffffff";
   };

   return (
      <TouchableOpacity
         style={[getButtonStyles(), style]}
         onPress={onPress}
         disabled={disabled || loading}
         activeOpacity={0.7}
         underlayColor="transparent"
         delayPressIn={0}
         delayPressOut={0}
         {...props}
      >
         {loading && (
            <ActivityIndicator
               size="small"
               color={getLoadingColor()}
               style={{ marginRight: children || title ? 8 : 0 }}
            />
         )}

         {children ||
            (title && (
               <Text style={[getTextStyles(), textStyle]}>{title}</Text>
            ))}
      </TouchableOpacity>
   );
};
