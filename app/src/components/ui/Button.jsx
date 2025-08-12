import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
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
   backgroundOpacity,
   borderOpacity,
   outlineOpacity,
   ...props
}) => {
   const { theme } = useTheme();

   // Helper function to convert hex to RGBA
   const hexToRgba = (hex, alpha) => {
      const cleanHex = hex.replace("#", "");
      const r = parseInt(cleanHex.slice(0, 2), 16);
      const g = parseInt(cleanHex.slice(2, 4), 16);
      const b = parseInt(cleanHex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
   };

   // Theme colors
   const primaryColor = theme.colors.primary || "#3b82f6";
   const textColor = theme.colors.text || "#000000";
   const borderColor = theme.colors.border || "#e5e7eb";
   const cardColor = theme.colors.card || "#f3f4f6";

   // Size configurations
   const sizes = {
      sm: {
         paddingHorizontal: 12,
         paddingVertical: 8,
         borderRadius: 6,
         outlineRadius: 8,
         fontSize: 14,
         fontWeight: "500",
      },
      default: {
         paddingHorizontal: 24,
         paddingVertical: 12,
         borderRadius: 10,
         outlineRadius: 12,
         fontSize: 14,
         fontWeight: "600",
      },
      lg: {
         paddingHorizontal: 32,
         paddingVertical: 16,
         borderRadius: 12,
         outlineRadius: 14,
         fontSize: 16,
         fontWeight: "600",
      },
   };

   // Get variant colors
   const getVariantConfig = () => {
      switch (variant) {
         case "destructive":
            return {
               color: "#dc2626",
               outlineOpacity: outlineOpacity || 0.05,
               borderOpacity: borderOpacity || 0.8,
               backgroundOpacity: backgroundOpacity || 1,
               textColor: "#ffffff",
               needsOutline: true,
            };
         case "destructiveSoft":
            return {
               color: "#dc2626",
               outlineOpacity: outlineOpacity || 0.08,
               borderOpacity: borderOpacity || 0.3,
               backgroundOpacity: backgroundOpacity || 0.1,
               textColor: backgroundOpacity > 0.5 ? "#ffffff" : "#dc2626",
               needsOutline: true,
            };
         case "success":
            return {
               color: "#16a34a",
               outlineOpacity: outlineOpacity || 0.05,
               borderOpacity: borderOpacity || 0.8,
               backgroundOpacity: backgroundOpacity || 1,
               textColor: "#ffffff",
               needsOutline: true,
            };
         case "successSoft":
            return {
               color: "#16a34a",
               outlineOpacity: outlineOpacity || 0.08,
               borderOpacity: borderOpacity || 0.3,
               backgroundOpacity: backgroundOpacity || 0.1,
               textColor: "#16a34a",
               needsOutline: true,
            };
         case "warning":
            return {
               color: "#f59e0b",
               outlineOpacity: outlineOpacity || 0.05,
               borderOpacity: borderOpacity || 0.8,
               backgroundOpacity: backgroundOpacity || 1,
               textColor: "#ffffff",
               needsOutline: true,
            };
         case "warningSoft":
            return {
               color: "#f59e0b",
               outlineOpacity: outlineOpacity || 0.08,
               borderOpacity: borderOpacity || 0.3,
               backgroundOpacity: backgroundOpacity || 0.1,
               textColor: "#f59e0b",
               needsOutline: true,
            };
         case "primarySoft":
            return {
               color: primaryColor,
               outlineOpacity: outlineOpacity || 0.08,
               borderOpacity: borderOpacity || 0.3,
               backgroundOpacity: backgroundOpacity || 0.1,
               textColor: primaryColor,
               needsOutline: true,
            };
         case "outline":
            return {
               color: borderColor,
               outlineOpacity: 0,
               borderOpacity: 1,
               backgroundOpacity: 0,
               textColor: textColor,
               needsOutline: false,
            };
         case "ghost":
            return {
               color: textColor,
               outlineOpacity: 0,
               borderOpacity: 0,
               backgroundOpacity: 0,
               textColor: textColor,
               needsOutline: false,
            };
         case "link":
            return {
               color: primaryColor,
               outlineOpacity: 0,
               borderOpacity: 0,
               backgroundOpacity: 0,
               textColor: primaryColor,
               needsOutline: false,
               textDecorationLine: "underline",
            };
         default: // "default"
            return {
               color: primaryColor,
               outlineOpacity: outlineOpacity || 0.05,
               borderOpacity: borderOpacity || 0.8,
               backgroundOpacity: backgroundOpacity || 1,
               textColor: "#ffffff",
               needsOutline: true,
            };
      }
   };

   const sizeConfig = sizes[size] || sizes.default;
   const variantConfig = getVariantConfig();

   // Button outline styles (outer container) - matches your buttonOutline
   const buttonOutlineStyles = {
      padding: 0, // Space for outline
      borderWidth: 2,
      borderColor: hexToRgba(variantConfig.color, variantConfig.outlineOpacity), // Outline with opacity
      borderRadius: sizeConfig.outlineRadius, // Slightly larger radius for outline
      backgroundColor: "transparent",
      opacity: disabled ? 0.5 : 1,
   };

   // Button styles (inner pressable) - matches your button
   const buttonStyles = {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: sizeConfig.paddingVertical,
      paddingHorizontal: sizeConfig.paddingHorizontal,
      borderWidth: 1,
      borderColor: hexToRgba(variantConfig.color, variantConfig.borderOpacity), // Border with opacity
      borderRadius: sizeConfig.borderRadius, // rounded corners
      backgroundColor: hexToRgba(
         variantConfig.color,
         variantConfig.backgroundOpacity
      ), // Background with opacity
   };

   // Text styles
   const textStyles = {
      fontSize: sizeConfig.fontSize,
      fontWeight: sizeConfig.fontWeight,
      color: variantConfig.textColor,
      textAlign: "center",
      textAlignVertical: "center",
      includeFontPadding: false,
      ...(variantConfig.textDecorationLine && {
         textDecorationLine: variantConfig.textDecorationLine,
      }),
   };

   // Loading indicator color
   const getLoadingColor = () => {
      return variantConfig.textColor;
   };

   // Single render - use outline wrapper only when needed
   return (
      <View
         style={[variantConfig.needsOutline ? buttonOutlineStyles : {}, style]}
      >
         <TouchableOpacity
            style={[
               variantConfig.needsOutline
                  ? buttonStyles
                  : { ...buttonStyles, width: "100%" },
            ]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            {...props}
         >
            <View
               style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: 1,
               }}
            >
               {loading && (
                  <ActivityIndicator
                     size="small"
                     color={getLoadingColor()}
                     style={{ marginRight: children || title ? 8 : 0 }}
                  />
               )}
               {children ? (
                  typeof children === "string" ? (
                     <Text style={[textStyles, textStyle]}>{children}</Text>
                  ) : (
                     children
                  )
               ) : (
                  title && <Text style={[textStyles, textStyle]}>{title}</Text>
               )}
            </View>
         </TouchableOpacity>
      </View>
   );
};
