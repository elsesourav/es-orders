import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import {
   ExpoSpeechRecognitionModule,
   useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useCallback, useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

export const VoiceControl = ({
   onNextOrder,
   onPrevOrder,
   onSelectOrder,
   ordersLength,
}) => {
   const [isListening, setIsListening] = useState(false);
   const [recognizedText, setRecognizedText] = useState("");
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
         setRecognizedText(transcript);

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
            stopListening();
         }
      },
      [onNextOrder, onPrevOrder, onSelectOrder, ordersLength]
   );

   // Set up speech recognition event listeners
   useSpeechRecognitionEvent("start", () => {
      console.log("🎤 Speech recognition started");
      setIsListening(true);
      showStatusMessage("🎤 Listening... Speak now!");
   });

   useSpeechRecognitionEvent("end", () => {
      console.log("⏹️ Speech recognition ended");
      setIsListening(false);
   });

   useSpeechRecognitionEvent("result", (event) => {
      console.log("� Speech results:", event.results);
      if (event.results && event.results.length > 0) {
         const transcript = event.results[0]?.transcript;
         if (transcript) {
            processVoiceCommand(transcript);
         }
      }
   });

   useSpeechRecognitionEvent("error", (event) => {
      console.error("❌ Speech error:", event.error, event.message);
      setIsListening(false);
      showStatusMessage(`❌ Error: ${event.error}`);
   });

   // Check if speech recognition is available
   useEffect(() => {
      const checkAvailability = () => {
         try {
            const available =
               ExpoSpeechRecognitionModule.isRecognitionAvailable();
            console.log("🎤 Speech recognition available:", available);

            if (available) {
               showStatusMessage("✅ Voice recognition ready!");
            } else {
               showStatusMessage("❌ Speech recognition not available");
            }
         } catch (error) {
            console.error("❌ Error checking availability:", error);
            showStatusMessage("❌ Speech recognition not available");
         }
      };

      checkAvailability();
   }, []);

   // Start listening
   const startListening = async () => {
      try {
         console.log("🚀 Starting voice recognition...");

         // Request permissions first
         const result =
            await ExpoSpeechRecognitionModule.requestPermissionsAsync();
         console.log("� Permission result:", result);

         if (!result.granted) {
            Alert.alert(
               "Permission Required",
               "Microphone permission is required for voice commands. Please grant permission in settings.",
               [{ text: "OK" }]
            );
            return;
         }

         // Start speech recognition
         ExpoSpeechRecognitionModule.start({
            lang: "en-US",
            interimResults: false,
            maxAlternatives: 1,
            continuous: false,
         });

         Alert.alert(
            "Voice Control Active",
            "🎤 Voice recognition is now listening!\n\nCommands:\n• 'Next order'\n• 'Previous order'\n• 'Open order [number]'\n• 'Stop'",
            [{ text: "OK" }]
         );
      } catch (error) {
         console.error("❌ Error starting speech recognition:", error);
         setIsListening(false);
         showStatusMessage("❌ Failed to start voice recognition");

         Alert.alert(
            "Speech Recognition Error",
            "Could not start voice recognition. Please check microphone permissions and try again.",
            [{ text: "OK" }]
         );
      }
   };

   // Stop listening
   const stopListening = () => {
      try {
         ExpoSpeechRecognitionModule.stop();
         setIsListening(false);
         showStatusMessage("🔇 Voice recognition stopped");
         Speech.speak("Voice recognition stopped");
      } catch (error) {
         console.error("❌ Error stopping speech recognition:", error);
         setIsListening(false);
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
               onPress={startListening}
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
