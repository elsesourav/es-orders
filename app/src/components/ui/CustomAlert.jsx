import { useEffect, useRef } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../lib/ThemeContext";

export const CustomAlert = ({
   type = "info",
   message,
   onClose,
   duration = 5000,
   visible = true,
}) => {
   const { theme } = useTheme();
   const fadeAnim = useRef(new Animated.Value(0)).current;
   const slideAnim = useRef(new Animated.Value(50)).current;

   const colorMap = {
      info: { bg: "#3B82F6", accent: "#1D4ED8" },
      success: { bg: "#10B981", accent: "#059669" },
      error: { bg: "#EF4444", accent: "#DC2626" },
      warning: { bg: "#F59E0B", accent: "#D97706" },
   };

   const colors = colorMap[type] || colorMap.info;

   useEffect(() => {
      if (visible) {
         // Show animation
         Animated.parallel([
            Animated.timing(fadeAnim, {
               toValue: 1,
               duration: 300,
               useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
               toValue: 0,
               duration: 300,
               useNativeDriver: true,
            }),
         ]).start();

         // Auto-dismiss timer
         if (onClose && duration > 0) {
            const timer = setTimeout(() => {
               hideAlert();
            }, duration);
            return () => clearTimeout(timer);
         }
      }
   }, [visible, onClose, duration]);

   const hideAlert = () => {
      Animated.parallel([
         Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
         }),
         Animated.timing(slideAnim, {
            toValue: 50,
            duration: 200,
            useNativeDriver: true,
         }),
      ]).start(() => {
         onClose && onClose();
      });
   };

   if (!visible) return null;

   return (
      <View className="absolute bottom-8 left-4 right-4 z-50 items-center">
         <Animated.View
            className="min-w-[280px] max-w-xs px-4 py-3 rounded-lg shadow-2xl flex-row items-center justify-between"
            style={{
               backgroundColor: colors.bg,
               opacity: fadeAnim,
               transform: [{ translateY: slideAnim }],
            }}
         >
            <Text className="font-medium text-white flex-1 mr-2">
               {message}
            </Text>

            {onClose && (
               <TouchableOpacity
                  onPress={hideAlert}
                  className="ml-2 px-2 py-1 rounded"
                  style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
               >
                  <Text className="text-white text-sm">✕</Text>
               </TouchableOpacity>
            )}
         </Animated.View>
      </View>
   );
};
