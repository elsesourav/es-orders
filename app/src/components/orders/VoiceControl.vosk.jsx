import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { useCallback, useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { useVoskSpeechRecognition } from "../../hooks/useVoskSpeechRecognition";

export const VoiceControl = ({
   onNextOrder,
   onPrevOrder,
   onSelectOrder,
   ordersLength,
}) => {
   const {
      isListening,
      recognizedText,
      error,
      isAvailable,
      isModelLoaded,
      startListening,
      stopListening,
      resetRecognition,
      getPlatformInfo,
   } = useVoskSpeechRecognition();

   const [voiceStatus, setVoiceStatus] = useState(
      "Tap to start voice recognition"
   );
   const [showStatus, setShowStatus] = useState(false);

   // Show status message
   const showStatusMessage = (message, duration = 3000) => {
      setVoiceStatus(message);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), duration);
   };

   // Helper function to convert spoken numbers to digits
   const convertSpokenToNumber = (text) => {
      const numberMap = {
         zero: 0,
         one: 1,
         two: 2,
         to: 2,
         three: 3,
         four: 4,
         for: 4,
         five: 5,
         six: 6,
         seven: 7,
         eight: 8,
         nine: 9,
         ten: 10,
         eleven: 11,
         twelve: 12,
         thirteen: 13,
         fourteen: 14,
         fifteen: 15,
         sixteen: 16,
         seventeen: 17,
         eighteen: 18,
         nineteen: 19,
         twenty: 20,
      };

      for (const [word, num] of Object.entries(numberMap)) {
         if (text.includes(word)) {
            return num;
         }
      }

      // Try to extract digit number
      const match = text.match(/\d+/);
      return match ? parseInt(match[0]) : null;
   };

   // Process voice commands
   const processVoiceCommand = useCallback(
      (transcript) => {
         console.log("🎤 Voice recognized:", transcript);

         const command = transcript.toLowerCase().trim();
         showStatusMessage(`Heard: "${command}"`);

         if (command.includes("next order") || command.includes("next")) {
            onNextOrder();
            showStatusMessage("✅ Moving to next order");
            Speech.speak("Moving to next order");
         } else if (
            command.includes("previous") ||
            command.includes("prev") ||
            command.includes("back")
         ) {
            onPrevOrder();
            showStatusMessage("✅ Moving to previous order");
            Speech.speak("Moving to previous order");
         } else if (
            command.includes("open") ||
            command.includes("show") ||
            command.includes("go to")
         ) {
            const orderNumber = convertSpokenToNumber(command);

            if (orderNumber !== null) {
               const orderIndex = orderNumber - 1;
               if (orderIndex >= 0 && orderIndex < ordersLength) {
                  onSelectOrder(orderIndex);
                  showStatusMessage(`✅ Opening order ${orderNumber}`);
                  Speech.speak(`Opening order ${orderNumber}`);
               } else {
                  showStatusMessage(`❌ Order ${orderNumber} not found`);
                  Speech.speak(`Order ${orderNumber} not found`);
               }
            } else {
               showStatusMessage("❌ Order number unclear");
               Speech.speak("Order number unclear");
            }
         } else if (command.includes("stop") || command.includes("quit")) {
            handleStopListening();
         }
      },
      [onNextOrder, onPrevOrder, onSelectOrder, ordersLength]
   );

   // Effect to process recognized text
   useEffect(() => {
      if (recognizedText) {
         processVoiceCommand(recognizedText);
         // Reset after processing
         setTimeout(() => {
            resetRecognition();
         }, 2000);
      }
   }, [recognizedText, processVoiceCommand, resetRecognition]);

   // Effect to show errors
   useEffect(() => {
      if (error) {
         showStatusMessage(`❌ Error: ${error}`);
      }
   }, [error]);

   // Effect to show availability status
   useEffect(() => {
      const platformInfo = getPlatformInfo();
      
      if (isAvailable) {
         if (platformInfo.offline) {
            showStatusMessage(`✅ Offline speech ready! (${platformInfo.engine})`);
         } else {
            showStatusMessage(`✅ Speech ready! (${platformInfo.engine})`);
         }
      } else {
         showStatusMessage("❌ Speech recognition not available");
      }
   }, [isAvailable, isModelLoaded, getPlatformInfo]);

   // Handle start listening
   const handleStartListening = async () => {
      try {
         console.log("🚀 Starting voice recognition...");

         if (!isAvailable) {
            const platformInfo = getPlatformInfo();
            Alert.alert(
               "Voice Recognition Not Available",
               `Speech recognition is not available.\n\nPlatform: ${platformInfo.platform}\nEngine: ${platformInfo.engine}\n\nFor offline speech recognition:\n• Use development build\n• Download Vosk model\n• Grant microphone permissions`,
               [{ text: "OK" }]
            );
            return;
         }

         await startListening("en-US");

         const platformInfo = getPlatformInfo();
         Alert.alert(
            "Voice Control Active",
            `🎤 Voice recognition is listening!\n\nEngine: ${platformInfo.engine}\nOffline: ${platformInfo.offline ? "Yes" : "No"}\n\nCommands:\n• 'Next order'\n• 'Previous order'\n• 'Open order [number]'\n• 'Stop'`,
            [{ text: "OK" }]
         );
      } catch (err) {
         console.error("❌ Error starting speech recognition:", err);
         showStatusMessage("❌ Failed to start voice recognition");
         
         Alert.alert(
            "Speech Recognition Error",
            "Could not start voice recognition. Please check microphone permissions and try again.",
            [{ text: "OK" }]
         );
      }
   };

   // Handle stop listening
   const handleStopListening = async () => {
      try {
         await stopListening();
         showStatusMessage("🔇 Voice recognition stopped");
         Speech.speak("Voice recognition stopped");
      } catch (err) {
         console.error("❌ Error stopping speech recognition:", err);
         showStatusMessage("❌ Error stopping voice recognition");
      }
   };

   return (
      <>
         {/* Voice Control Button */}
         <View
            style={{
               position: "absolute",
               bottom: 10,
               right: 10,
               zIndex: 1000,
            }}
         >
            <TouchableOpacity
               onPress={handleStartListening}
               style={{
                  width: 56,
                  height: 56,
                  borderRadius: 20,
                  backgroundColor: isListening ? "#ff6b35" : "#2c3e50",
                  borderWidth: 2,
                  borderColor: isListening ? "#ff8c42" : "#34495e",
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: isListening ? "#ff6b35" : "#2c3e50",
                  shadowOffset: { width: 0, height: isListening ? 8 : 4 },
                  shadowOpacity: isListening ? 0.6 : 0.3,
                  shadowRadius: isListening ? 15 : 6,
                  elevation: isListening ? 12 : 6,
                  transform: [{ scale: isListening ? 1.1 : 1 }],
               }}
               activeOpacity={0.7}
            >
               <Ionicons
                  name={isListening ? "mic" : "mic-outline"}
                  size={28}
                  color="#ffffff"
               />
            </TouchableOpacity>
         </View>

         {/* Voice Status Display */}
         {showStatus && (
            <View
               style={{
                  position: "absolute",
                  bottom: 80,
                  right: 10,
                  zIndex: 999,
                  maxWidth: 250,
               }}
            >
               <View
                  style={{
                     backgroundColor: "#ff6b35",
                     borderRadius: 12,
                     padding: 12,
                     borderWidth: 2,
                     borderColor: "#ff8c42",
                     shadowColor: "#ff6b35",
                     shadowOffset: { width: 0, height: 6 },
                     shadowOpacity: 0.4,
                     shadowRadius: 8,
                     elevation: 8,
                  }}
               >
                  <Text
                     style={{
                        fontSize: 13,
                        color: "#ffffff",
                        fontWeight: "600",
                        textAlign: "center",
                     }}
                  >
                     🎤 {voiceStatus}
                  </Text>
               </View>
            </View>
         )}

         {/* Recognized Text Display */}
         {recognizedText && (
            <View
               style={{
                  position: "absolute",
                  bottom: 140,
                  right: 10,
                  zIndex: 998,
                  maxWidth: 250,
               }}
            >
               <View
                  style={{
                     backgroundColor: "#22c55e",
                     borderRadius: 12,
                     padding: 12,
                     borderWidth: 2,
                     borderColor: "#16a34a",
                  }}
               >
                  <Text
                     style={{
                        fontSize: 12,
                        color: "#ffffff",
                        fontWeight: "600",
                     }}
                  >
                     📝 "{recognizedText}"
                  </Text>
               </View>
            </View>
         )}
      </>
   );
};
