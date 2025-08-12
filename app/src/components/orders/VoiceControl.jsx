import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../lib/ThemeContext";

export const VoiceControl = ({
   onNextOrder,
   onPrevOrder,
   onSelectOrder,
   ordersLength,
}) => {
   const { theme } = useTheme();
   const [isListening, setIsListening] = useState(false);

   const handleVoiceToggle = () => {
      setIsListening(!isListening);
      // In a real implementation, you would integrate with react-native-voice
      // or similar voice recognition library
      console.log("Voice control toggled:", !isListening);
   };

   return (
      <View
         style={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 1000,
         }}
      >
         <TouchableOpacity
            onPress={handleVoiceToggle}
            style={{
               width: 48,
               height: 48,
               borderRadius: 24,
               backgroundColor: isListening ? "#ef4444" : theme.colors.primary,
               justifyContent: "center",
               alignItems: "center",
               shadowColor: "#000",
               shadowOffset: { width: 0, height: 2 },
               shadowOpacity: 0.25,
               shadowRadius: 4,
               elevation: 5,
            }}
            activeOpacity={0.8}
         >
            <Ionicons
               name={isListening ? "mic" : "mic-outline"}
               size={24}
               color="#ffffff"
            />
         </TouchableOpacity>

         {isListening && (
            <View
               style={{
                  position: "absolute",
                  top: 56,
                  right: 0,
                  backgroundColor: theme.colors.card,
                  borderRadius: 8,
                  padding: 8,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  minWidth: 120,
               }}
            >
               <Text
                  style={{
                     fontSize: 12,
                     color: theme.colors.text,
                     textAlign: "center",
                  }}
               >
                  Listening...
               </Text>
            </View>
         )}
      </View>
   );
};
