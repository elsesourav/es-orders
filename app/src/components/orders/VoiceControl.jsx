import { Ionicons } from "@expo/vector-icons";
import { AudioModule } from "expo-audio";
import * as Speech from "expo-speech";
import { useCallback, useEffect, useRef, useState } from "react";
import {
   Alert,
   Linking,
   Platform,
   Text,
   TouchableOpacity,
   View,
} from "react-native";
import { useTheme } from "../../lib/ThemeContext";

// Voice recognition not available in Expo managed workflow
// Would need to eject to bare React Native to use @react-native-voice/voice
let Voice = null;

export const VoiceControl = ({
   onNextOrder,
   onPrevOrder,
   onSelectOrder,
   ordersLength,
}) => {
   const { theme } = useTheme();
   const [isVoiceListening, setIsVoiceListening] = useState(false);
   const [voiceStatus, setVoiceStatus] = useState(
      "Tap to start voice commands"
   );
   const [showVoiceStatus, setShowVoiceStatus] = useState(false);
   const [voiceStatusType, setVoiceStatusType] = useState("info");
   const [hasPermission, setHasPermission] = useState(false);

   const recognitionRef = useRef(null);
   const isListeningRef = useRef(false);
   const isManualStopRef = useRef(false);

   // Update ref when state changes to avoid closure issues
   useEffect(() => {
      isListeningRef.current = isVoiceListening;
      console.log("📊 Voice Listening State:", isVoiceListening);
   }, [isVoiceListening]);

   // Check microphone permissions on component mount
   useEffect(() => {
      const checkInitialPermissions = async () => {
         try {
            const permissions =
               await AudioModule.getRecordingPermissionsAsync();
            console.log("🎤 Initial permission status:", permissions);
            setHasPermission(permissions.granted);

            // Update initial status based on permissions
            if (permissions.granted) {
               setVoiceStatus("Tap to start voice commands");
            } else {
               setVoiceStatus("Tap to grant microphone access");
            }
         } catch (error) {
            console.error("❌ Error checking initial permissions:", error);
            setHasPermission(false);
            setVoiceStatus("Microphone permission required");
         }
      };

      const initializeNativeVoice = async () => {
         // Native voice recognition is not available in Expo managed workflow
         console.log("🎤 Checking native voice availability...");
         console.log(
            "❌ Voice module not available - Expo managed workflow limitation"
         );
      };
      checkInitialPermissions();
      initializeNativeVoice();

      // Cleanup voice listeners on unmount
      return () => {
         // No native voice cleanup needed in Expo
         console.log("🧹 Cleaning up voice control component");
      };
   }, []);

   // Request microphone permission using expo-audio
   const requestMicrophonePermission = async () => {
      try {
         console.log("🎤 Requesting microphone permission with expo-audio...");

         // Check current permissions first
         const currentPermissions =
            await AudioModule.getRecordingPermissionsAsync();
         console.log("🎤 Current permission status:", currentPermissions);

         if (currentPermissions.granted) {
            console.log("✅ Permission already granted");
            setHasPermission(true);
            return true;
         }

         // Request permissions
         const { status, granted } =
            await AudioModule.requestRecordingPermissionsAsync();
         console.log("🎤 Permission request result:", { status, granted });

         if (granted) {
            console.log("✅ Microphone permission granted");
            setHasPermission(true);
            setVoiceStatus("✅ Microphone access granted");
            setVoiceStatusType("success");
            setShowVoiceStatus(true);
            setTimeout(() => setShowVoiceStatus(false), 2000);
            return true;
         } else {
            console.log("❌ Microphone permission denied");
            setHasPermission(false);
            setVoiceStatus("❌ Microphone access required");
            setVoiceStatusType("error");
            setShowVoiceStatus(true);

            Alert.alert(
               "Microphone Permission Required",
               "This app needs microphone access to process voice commands. Please grant permission in your device settings.",
               [
                  {
                     text: "Cancel",
                     style: "cancel",
                     onPress: () => setShowVoiceStatus(false),
                  },
                  {
                     text: "Open Settings",
                     onPress: () => {
                        // Open device settings for the app
                        if (Platform.OS === "ios") {
                           // iOS: open app settings
                           Linking.openURL("app-settings:");
                        } else {
                           // Android: open app info settings
                           Linking.openSettings();
                        }
                     },
                  },
               ]
            );
            return false;
         }
      } catch (error) {
         console.error("❌ Error requesting microphone permission:", error);
         setHasPermission(false);
         setVoiceStatus("❌ Permission request failed");
         setVoiceStatusType("error");
         setShowVoiceStatus(true);
         return false;
      }
   };

   // Initialize Web Speech Recognition for web platform
   const initializeWebSpeechRecognition = useCallback(() => {
      if (Platform.OS !== "web") return null;

      if (typeof window === "undefined") return null;

      const SpeechRecognition =
         window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
         console.log("❌ Web Speech Recognition not supported");
         return null;
      }

      console.log("✅ Initializing Web Speech Recognition");
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
         console.log("🎤 Web Speech Recognition started");
         setVoiceStatus("🎤 Listening...");
         setVoiceStatusType("info");
         setShowVoiceStatus(true);
      };

      recognition.onresult = (event) => {
         console.log("🗣️ Speech result received");
         const results = event.results;
         const lastResult = results[results.length - 1];

         if (lastResult.isFinal) {
            const transcript = lastResult[0].transcript.toLowerCase().trim();
            console.log("✅ Final transcript:", transcript);
            processVoiceCommand(transcript);
         }
      };

      recognition.onerror = (event) => {
         console.error("❌ Speech recognition error:", event.error);
         if (event.error === "not-allowed") {
            setVoiceStatus("❌ Microphone access denied");
            setVoiceStatusType("error");
            setShowVoiceStatus(true);
            Alert.alert(
               "Microphone Access Required",
               "Please allow microphone access to use voice commands. You may need to enable microphone permissions in your browser or device settings.",
               [
                  { text: "Cancel", style: "cancel" },
                  {
                     text: "Check Settings",
                     onPress: () => {
                        if (Platform.OS === "web") {
                           // For web, suggest checking browser permissions
                           Alert.alert(
                              "Browser Permissions",
                              "In your browser:\n1. Click the lock/info icon in the address bar\n2. Allow microphone access for this site\n3. Refresh the page and try again"
                           );
                        }
                     },
                  },
               ]
            );
         } else if (event.error === "no-speech") {
            setVoiceStatus("🔇 No speech detected - try again");
            setVoiceStatusType("error");
            setShowVoiceStatus(true);
            setTimeout(() => setShowVoiceStatus(false), 3000);
         } else {
            setVoiceStatus(`❌ Speech error: ${event.error}`);
            setVoiceStatusType("error");
            setShowVoiceStatus(true);
            setTimeout(() => setShowVoiceStatus(false), 4000);
         }
      };

      recognition.onend = () => {
         console.log("⏹️ Speech recognition ended");
         if (!isManualStopRef.current && isListeningRef.current) {
            console.log("🔄 Restarting speech recognition");
            try {
               recognition.start();
            } catch (error) {
               console.error("❌ Error restarting recognition:", error);
            }
         }
      };

      return recognition;
   }, []);

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
      return null;
   };

   // Speak feedback to user
   const speakFeedback = useCallback((text) => {
      if (Platform.OS !== "web") {
         Speech.speak(text, {
            language: "en-US",
            pitch: 1.0,
            rate: 0.9,
         });
      }
   }, []);

   // Process voice commands
   const processVoiceCommand = useCallback(
      (transcript) => {
         console.log("🔊 RAW TRANSCRIPT RECEIVED:", transcript);
         console.log("📏 Transcript length:", transcript.length);
         console.log("🔤 Original case:", transcript);

         const command = transcript.toLowerCase().trim();
         console.log("🎤 PROCESSED COMMAND:", command);
         console.log(
            "📝 Processing voice command at:",
            new Date().toLocaleTimeString()
         );
         console.log("📊 Available orders count:", ordersLength);

         setVoiceStatus(`Heard: "${command}"`);
         setVoiceStatusType("info");
         setShowVoiceStatus(true);

         setTimeout(() => setShowVoiceStatus(false), 3000);

         if (
            command.includes("next order") ||
            command.includes("next orders")
         ) {
            console.log("✅ COMMAND MATCHED: Next Order");
            onNextOrder();
            const feedback = "Moving to next order";
            setVoiceStatus(`✅ ${feedback}`);
            setVoiceStatusType("success");
            setShowVoiceStatus(true);
            speakFeedback(feedback);
            setTimeout(() => setShowVoiceStatus(false), 2000);
         } else if (
            command.includes("previous order") ||
            command.includes("previous orders") ||
            command.includes("prev order") ||
            command.includes("back")
         ) {
            console.log("✅ COMMAND MATCHED: Previous Order");
            onPrevOrder();
            const feedback = "Moving to previous order";
            setVoiceStatus(`✅ ${feedback}`);
            setVoiceStatusType("success");
            setShowVoiceStatus(true);
            speakFeedback(feedback);
            setTimeout(() => setShowVoiceStatus(false), 2000);
         } else if (
            command.includes("open") ||
            command.includes("show") ||
            command.includes("go to")
         ) {
            console.log("✅ COMMAND MATCHED: Open Order");
            let orderNumber = null;

            // First try to extract digit number
            const digitMatch = command.match(
               /(?:open|show|go to)\s+(?:order\s+)?(\d+)/
            );
            if (digitMatch) {
               orderNumber = parseInt(digitMatch[1]);
               console.log("🔢 EXTRACTED DIGIT:", orderNumber);
            } else {
               // Try to extract spoken number
               const spokenNumber = convertSpokenToNumber(command);
               if (spokenNumber !== null) {
                  orderNumber = spokenNumber;
               }
            }

            if (orderNumber !== null) {
               const orderIndex = orderNumber - 1; // Convert to 0-based index
               if (orderIndex >= 0 && orderIndex < ordersLength) {
                  onSelectOrder(orderIndex);
                  const feedback = `Opening order ${orderNumber}`;
                  setVoiceStatus(`✅ ${feedback}`);
                  setVoiceStatusType("success");
                  setShowVoiceStatus(true);
                  speakFeedback(feedback);
                  setTimeout(() => setShowVoiceStatus(false), 2000);
               } else {
                  const feedback = `Order ${orderNumber} not found`;
                  setVoiceStatus(`❌ ${feedback}`);
                  setVoiceStatusType("error");
                  setShowVoiceStatus(true);
                  speakFeedback(feedback);
                  setTimeout(() => setShowVoiceStatus(false), 2500);
               }
            } else {
               const feedback = "Order number unclear";
               setVoiceStatus(`❌ ${feedback}`);
               setVoiceStatusType("error");
               setShowVoiceStatus(true);
               speakFeedback(feedback);
               setTimeout(() => setShowVoiceStatus(false), 2000);
            }
         } else if (command.includes("stop") || command.includes("quit")) {
            stopListening();
         }
         // Don't show error for unrecognized commands, just ignore them
      },
      [onNextOrder, onPrevOrder, onSelectOrder, ordersLength, speakFeedback]
   );

   // Initialize speech recognition based on platform
   const initializeSpeechRecognition = useCallback(() => {
      console.log("🎯 INITIALIZING SPEECH RECOGNITION");
      console.log("📱 Platform:", Platform.OS);

      // For web platform - use Web Speech API
      if (Platform.OS === "web") {
         if (
            typeof window !== "undefined" &&
            ("webkitSpeechRecognition" in window ||
               "SpeechRecognition" in window)
         ) {
            console.log("✅ WEB SPEECH RECOGNITION AVAILABLE");
            const SpeechRecognition =
               window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();

            recognition.continuous = true;
            recognition.interimResults = true; // Enable interim results to see partial speech
            recognition.lang = "en-US";

            recognition.onstart = () => {
               console.log("🎤 WEB SPEECH RECOGNITION STARTED");
               console.log("⏰ Started at:", new Date().toLocaleTimeString());
               console.log("🌐 Recognition language:", recognition.lang);
               console.log("🔄 Continuous mode:", recognition.continuous);
               console.log("📝 Interim results:", recognition.interimResults);
               setVoiceStatus("🎤 Listening for speech...");
               setVoiceStatusType("info");
               setShowVoiceStatus(true);
               setTimeout(() => setShowVoiceStatus(false), 2000);
            };

            recognition.onresult = (event) => {
               console.log("🗣️ WEB SPEECH DETECTED - Raw event:", event);
               console.log("📊 Total results count:", event.results.length);

               const results = event.results;

               // Log all results (both interim and final)
               for (let i = 0; i < results.length; i++) {
                  const result = results[i];
                  const transcript = result[0].transcript;
                  const confidence = result[0].confidence;

                  if (result.isFinal) {
                     console.log(`✅ FINAL RESULT [${i}]:`, transcript);
                     console.log(`🎯 Confidence: ${confidence}`);
                  } else {
                     console.log(`⏳ INTERIM RESULT [${i}]:`, transcript);
                  }
               }

               const lastResult = results[results.length - 1];

               if (lastResult.isFinal) {
                  const transcript = lastResult[0].transcript;
                  console.log("🎤 PROCESSING FINAL TRANSCRIPT:", transcript);
                  processVoiceCommand(transcript);
               } else {
                  const interimTranscript = lastResult[0].transcript;
                  console.log("👂 LISTENING (interim):", interimTranscript);
               }
            };

            recognition.onerror = (event) => {
               console.error("❌ WEB SPEECH RECOGNITION ERROR:", event.error);
               setVoiceStatus(`❌ Speech error: ${event.error}`);
               setVoiceStatusType("error");
               setShowVoiceStatus(true);
               setTimeout(() => setShowVoiceStatus(false), 3000);
            };

            recognition.onend = () => {
               console.log("⏹️ WEB SPEECH RECOGNITION ENDED");
               console.log("⏰ Ended at:", new Date().toLocaleTimeString());
               console.log("🏁 Manual stop?", isManualStopRef.current);
               console.log("👂 Still listening?", isListeningRef.current);

               if (!isManualStopRef.current && isListeningRef.current) {
                  console.log(
                     "🔄 AUTO-RESTARTING WEB SPEECH RECOGNITION in 1 second..."
                  );
                  setTimeout(() => {
                     if (!isManualStopRef.current && isListeningRef.current) {
                        console.log("▶️ RESTARTING SPEECH RECOGNITION NOW");
                        recognition.start();
                     } else {
                        console.log("❌ CONDITIONS CHANGED - NOT RESTARTING");
                     }
                  }, 1000);
               } else {
                  console.log(
                     "🛑 NOT RESTARTING - Manual stop or not listening"
                  );
               }
            };

            recognitionRef.current = recognition;
            return recognition;
         } else {
            console.log(
               "❌ WEB SPEECH RECOGNITION NOT SUPPORTED IN THIS BROWSER"
            );
            return null;
         }
      }
      // For Android/iOS - speech recognition not available in Expo managed workflow
      else if (Platform.OS === "android" || Platform.OS === "ios") {
         console.log("❌ NATIVE SPEECH RECOGNITION NOT AVAILABLE IN EXPO");
         console.log(
            "ℹ️ React Native doesn't have built-in speech recognition"
         );
         console.log(
            "ℹ️ Would need native speech recognition library like @react-native-voice/voice"
         );
         return null;
      } else {
         console.log("❌ SPEECH RECOGNITION NOT AVAILABLE ON THIS PLATFORM");
         return null;
      }
   }, [processVoiceCommand]);

   // Start real speech recognition
   const startRealSpeechRecognition = useCallback(async () => {
      console.log("🚀 ATTEMPTING TO START REAL SPEECH RECOGNITION");

      // For mobile platforms, speech recognition not available in Expo managed workflow
      if (Platform.OS === "android" || Platform.OS === "ios") {
         console.log(
            "📱 Mobile platform detected - speech recognition requires ejecting from Expo"
         );
         return false;
      }

      // For web, use Web Speech API
      const speechRecognition = initializeSpeechRecognition();

      if (speechRecognition && typeof speechRecognition.start === "function") {
         try {
            console.log("▶️ STARTING WEB SPEECH RECOGNITION");
            speechRecognition.start();
            return true;
         } catch (error) {
            console.error("❌ FAILED TO START WEB SPEECH RECOGNITION:", error);
            return false;
         }
      }

      return false;
   }, [initializeSpeechRecognition]);

   // Stop real speech recognition
   const stopRealSpeechRecognition = useCallback(async () => {
      // For mobile platforms, no native voice to stop
      if (Platform.OS === "android" || Platform.OS === "ios") {
         console.log("📱 Mobile platform - no speech recognition to stop");
         return;
      }

      // Stop web speech recognition
      if (recognitionRef.current) {
         console.log("⏹️ STOPPING WEB SPEECH RECOGNITION");
         recognitionRef.current.stop();
      }
   }, []);

   // Start voice listening - ONLY real speech recognition, no simulation
   const startListening = useCallback(async () => {
      try {
         console.log("🚀 STARTING REAL VOICE CONTROL");
         console.log("📊 Orders available:", ordersLength);

         // Check permissions first
         if (!hasPermission) {
            console.log("🔒 Requesting microphone permission...");
            const permissionGranted = await requestMicrophonePermission();
            if (!permissionGranted) {
               console.log("❌ Permission denied, cannot start voice control");
               return;
            }
         }

         setIsVoiceListening(true);
         isListeningRef.current = true;
         isManualStopRef.current = false;

         console.log("✅ REFS SET - isListeningRef:", isListeningRef.current);

         // ONLY try real speech recognition - no simulation fallback
         const realSpeechStarted = startRealSpeechRecognition();

         if (realSpeechStarted) {
            console.log("✅ REAL SPEECH RECOGNITION STARTED");
            setVoiceStatus("🎤 Listening for voice commands...");
            setVoiceStatusType("info");
            setShowVoiceStatus(true);
            speakFeedback("Voice control activated - speak your command");
            setTimeout(() => setShowVoiceStatus(false), 3000);

            Alert.alert(
               "Voice Control Active",
               "🎤 Real speech recognition is now listening!\n\nSpeak these commands:\n• 'Next order'\n• 'Previous order'\n• 'Open order [number]'\n• 'Stop'\n\nSpeak clearly into your microphone.",
               [{ text: "OK" }]
            );
         } else {
            console.log("❌ SPEECH RECOGNITION NOT AVAILABLE");
            setIsVoiceListening(false);
            isListeningRef.current = false;

            let errorMessage = "❌ Speech recognition not available";
            let alertTitle = "Voice Control Not Available";
            let alertMessage = "";

            if (Platform.OS === "android") {
               errorMessage =
                  "❌ Speech recognition requires ejecting from Expo";
               alertTitle = "Android Voice Control Solution";
               alertMessage =
                  "🚀 To get REAL speech recognition working on Android:\n\n✅ SOLUTION:\n1. Eject from Expo managed workflow:\n   `npx expo run:android` or `npx expo eject`\n\n2. Install native speech library:\n   `npm install @react-native-voice/voice`\n\n3. Link the native dependencies\n\n🎯 ALTERNATIVE:\n• Use the web version in browser\n• Web Speech API works perfectly\n\n⚠️ Current Expo managed workflow cannot access native speech recognition APIs.";
            } else if (Platform.OS === "ios") {
               errorMessage =
                  "❌ Speech recognition requires ejecting from Expo";
               alertTitle = "iOS Voice Control Solution";
               alertMessage =
                  "🚀 To get REAL speech recognition working on iOS:\n\n✅ SOLUTION:\n1. Eject from Expo managed workflow:\n   `npx expo run:ios` or `npx expo eject`\n\n2. Install native speech library:\n   `npm install @react-native-voice/voice`\n\n3. Configure iOS permissions\n\n🎯 ALTERNATIVE:\n• Use the web version in browser\n• Web Speech API works perfectly\n\n⚠️ Current Expo managed workflow cannot access native speech recognition APIs.";
            } else {
               alertMessage =
                  "❌ Speech recognition is not available on this platform.\n\nSupported platforms:\n• Web browsers with microphone access\n• Desktop browsers (Chrome, Firefox, Safari)\n\nFor mobile devices, please use the web version in your browser.";
            }

            setVoiceStatus(errorMessage);
            setVoiceStatusType("error");
            setShowVoiceStatus(true);
            setTimeout(() => setShowVoiceStatus(false), 4000);

            Alert.alert(alertTitle, alertMessage, [{ text: "OK" }]);
         }
      } catch (error) {
         console.error("❌ ERROR STARTING VOICE CONTROL:", error);
         setIsVoiceListening(false);
         isListeningRef.current = false;
         setVoiceStatus("❌ Failed to start voice control");
         setVoiceStatusType("error");
         setShowVoiceStatus(true);
         setTimeout(() => setShowVoiceStatus(false), 3000);
      }
   }, [
      hasPermission,
      requestMicrophonePermission,
      speakFeedback,
      startRealSpeechRecognition,
   ]);

   // Stop voice listening - ONLY real speech recognition
   const stopListening = useCallback(() => {
      try {
         console.log("⏹️ STOPPING VOICE CONTROL");
         isManualStopRef.current = true;
         isListeningRef.current = false;

         // Stop real speech recognition if active
         if (recognitionRef.current) {
            console.log("🛑 STOPPING REAL SPEECH RECOGNITION");
            recognitionRef.current.stop();
            recognitionRef.current = null;
         }

         setIsVoiceListening(false);
         const statusText = "🔇 Voice control stopped";
         setVoiceStatus(statusText);
         setVoiceStatusType("info");
         setShowVoiceStatus(true);
         speakFeedback("Voice control deactivated");
         setTimeout(() => setShowVoiceStatus(false), 2000);
         console.log("✅ VOICE CONTROL STOPPED SUCCESSFULLY");
      } catch (error) {
         console.error("❌ ERROR STOPPING VOICE CONTROL:", error);
         setIsVoiceListening(false);
         isListeningRef.current = false;
      }
   }, [speakFeedback]);

   // Toggle voice recognition
   const toggleVoiceRecognition = useCallback(() => {
      console.log(
         `🔄 TOGGLING VOICE CONTROL - Currently: ${
            isVoiceListening ? "ON" : "OFF"
         }`
      );
      if (isVoiceListening) {
         stopListening();
      } else {
         startListening();
      }
   }, [isVoiceListening, startListening, stopListening]);

   // Cleanup on unmount
   useEffect(() => {
      return () => {
         isManualStopRef.current = true;

         // Stop any active speech recognition
         if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
         }
      };
   }, []);

   // Get status colors based on type
   const getStatusColors = () => {
      switch (voiceStatusType) {
         case "success":
            return {
               backgroundColor: "#22c55e",
               borderColor: "#16a34a",
               textColor: "#ffffff",
            };
         case "error":
            return {
               backgroundColor: "#ef4444",
               borderColor: "#dc2626",
               textColor: "#ffffff",
            };
         default:
            return {
               backgroundColor: "#ff6b35",
               borderColor: "#ff8c42",
               textColor: "#ffffff",
            };
      }
   };

   const statusColors = getStatusColors();

   return (
      <>
         <View
            style={{
               position: "absolute",
               bottom: 10,
               right: 10,
               zIndex: 1000,
            }}
         >
            <TouchableOpacity
               onPress={toggleVoiceRecognition}
               style={{
                  width: 56,
                  height: 56,
                  borderRadius: 20,
                  backgroundColor: isVoiceListening
                     ? "#ff6b35"
                     : hasPermission
                     ? "#2c3e50"
                     : "#8e8e93",
                  borderWidth: 2,
                  borderColor: isVoiceListening
                     ? "#ff8c42"
                     : hasPermission
                     ? "#34495e"
                     : "#aeaeb2",
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: isVoiceListening ? "#ff6b35" : "#2c3e50",
                  shadowOffset: {
                     width: 0,
                     height: isVoiceListening ? 8 : 4,
                  },
                  shadowOpacity: isVoiceListening ? 0.6 : 0.3,
                  shadowRadius: isVoiceListening ? 15 : 6,
                  elevation: isVoiceListening ? 12 : 6,
                  transform: [
                     { scale: isVoiceListening ? 1.1 : 1 },
                     { rotate: isVoiceListening ? "2deg" : "0deg" },
                  ],
               }}
               activeOpacity={0.7}
            >
               <Ionicons
                  name={
                     isVoiceListening
                        ? "mic"
                        : hasPermission
                        ? "mic-outline"
                        : "mic-off"
                  }
                  size={28}
                  color="#ffffff"
               />
            </TouchableOpacity>
         </View>

         {/* Voice Status Display */}
         {showVoiceStatus && voiceStatus && (
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
                     backgroundColor: statusColors.backgroundColor,
                     borderRadius: 12,
                     padding: 12,
                     borderWidth: 2,
                     borderColor: statusColors.borderColor,
                     shadowColor: statusColors.backgroundColor,
                     shadowOffset: { width: 0, height: 6 },
                     shadowOpacity: 0.4,
                     shadowRadius: 8,
                     elevation: 8,
                     transform: [{ scale: 1.02 }],
                  }}
               >
                  <Text
                     style={{
                        fontSize: 13,
                        color: statusColors.textColor,
                        fontWeight: "600",
                        textAlign: "center",
                        textShadowColor: "rgba(0, 0, 0, 0.3)",
                        textShadowOffset: { width: 1, height: 1 },
                        textShadowRadius: 2,
                     }}
                  >
                     {voiceStatusType === "success"
                        ? "✅"
                        : voiceStatusType === "error"
                        ? "❌"
                        : "🎤"}{" "}
                     {voiceStatus}
                  </Text>
               </View>
            </View>
         )}
      </>
   );
};
