import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

let VoskModule = null;

// Dynamically import Vosk only on mobile platforms
if (Platform.OS !== "web") {
   try {
      VoskModule = require("react-native-vosk");
   } catch (error) {
      console.warn("Vosk module not available:", error);
   }
}

export const useVoskSpeechRecognition = () => {
   const [isListening, setIsListening] = useState(false);
   const [recognizedText, setRecognizedText] = useState("");
   const [error, setError] = useState(null);
   const [isAvailable, setIsAvailable] = useState(false);
   const [isModelLoaded, setIsModelLoaded] = useState(false);
   const recognizerRef = useRef(null);
   const webRecognitionRef = useRef(null);

   // Check availability and initialize
   useEffect(() => {
      const initializeVosk = async () => {
         try {
            if (Platform.OS === "web") {
               // Web Speech API check
               const available =
                  "webkitSpeechRecognition" in window ||
                  "SpeechRecognition" in window;
               setIsAvailable(available);
               if (available) {
                  console.log("🌐 Web Speech API available");
               }
            } else if (VoskModule) {
               // Initialize Vosk for mobile
               console.log("🎤 Initializing Vosk...");

               // Check if model exists, if not download a small model
               const modelPath = await VoskModule.loadModel(
                  "vosk-model-small-en-us-0.15"
               );

               if (modelPath) {
                  const recognizer = new VoskModule.VoskRecognizer(
                     modelPath,
                     16000
                  );
                  recognizerRef.current = recognizer;
                  setIsModelLoaded(true);
                  setIsAvailable(true);
                  console.log("✅ Vosk initialized successfully");
               } else {
                  throw new Error("Failed to load Vosk model");
               }
            } else {
               setError("Vosk not available on this platform");
               setIsAvailable(false);
            }
         } catch (err) {
            console.error("❌ Error initializing speech recognition:", err);
            setError(err.message || "Failed to initialize speech recognition");
            setIsAvailable(false);
         }
      };

      initializeVosk();

      // Cleanup
      return () => {
         if (recognizerRef.current && VoskModule) {
            try {
               recognizerRef.current.free();
            } catch (e) {
               console.warn("Error cleaning up Vosk recognizer:", e);
            }
         }
      };
   }, []);

   // Start listening function
   const startListening = useCallback(
      async (language = "en-US") => {
         try {
            setError(null);

            if (Platform.OS === "web") {
               // Use Web Speech API
               const SpeechRecognition =
                  window.SpeechRecognition || window.webkitSpeechRecognition;

               if (SpeechRecognition) {
                  const recognition = new SpeechRecognition();
                  recognition.continuous = false;
                  recognition.interimResults = false;
                  recognition.lang = language;

                  recognition.onstart = () => {
                     setIsListening(true);
                     console.log("🎤 Web speech recognition started");
                  };

                  recognition.onresult = (event) => {
                     if (event.results.length > 0) {
                        const transcript = event.results[0][0].transcript;
                        setRecognizedText(transcript);
                        console.log("📝 Web speech result:", transcript);
                     }
                  };

                  recognition.onerror = (event) => {
                     console.error("❌ Web speech error:", event.error);
                     setError(event.error);
                     setIsListening(false);
                  };

                  recognition.onend = () => {
                     setIsListening(false);
                     console.log("⏹️ Web speech recognition ended");
                  };

                  webRecognitionRef.current = recognition;
                  recognition.start();
               } else {
                  throw new Error("Web Speech API not supported");
               }
            } else if (VoskModule && recognizerRef.current && isModelLoaded) {
               // Use Vosk for mobile
               console.log("🎤 Starting Vosk recognition...");

               // Start audio recording and recognition
               await VoskModule.startRecognition(recognizerRef.current, {
                  onPartialResult: (result) => {
                     console.log("📝 Vosk partial result:", result);
                  },
                  onResult: (result) => {
                     console.log("✅ Vosk final result:", result);
                     setRecognizedText(result.text || result);
                  },
                  onError: (error) => {
                     console.error("❌ Vosk error:", error);
                     setError(error);
                     setIsListening(false);
                  },
               });

               setIsListening(true);
            } else {
               throw new Error("Vosk not initialized or model not loaded");
            }
         } catch (err) {
            console.error("❌ Error starting speech recognition:", err);
            setError(err.message || "Failed to start speech recognition");
            setIsListening(false);
         }
      },
      [isModelLoaded]
   );

   // Stop listening function
   const stopListening = useCallback(async () => {
      try {
         if (Platform.OS === "web" && webRecognitionRef.current) {
            webRecognitionRef.current.stop();
            webRecognitionRef.current = null;
         } else if (VoskModule && recognizerRef.current) {
            await VoskModule.stopRecognition();
         }

         setIsListening(false);
         console.log("⏹️ Speech recognition stopped");
      } catch (err) {
         console.error("❌ Error stopping speech recognition:", err);
         setError(err.message || "Failed to stop speech recognition");
         setIsListening(false);
      }
   }, []);

   // Reset recognition state
   const resetRecognition = useCallback(() => {
      setRecognizedText("");
      setError(null);
   }, []);

   // Get platform info
   const getPlatformInfo = useCallback(() => {
      if (Platform.OS === "web") {
         return {
            platform: "web",
            engine: "Web Speech API",
            offline: false,
         };
      } else if (VoskModule && isModelLoaded) {
         return {
            platform: Platform.OS,
            engine: "Vosk",
            offline: true,
         };
      }
      return {
         platform: Platform.OS,
         engine: "none",
         offline: false,
      };
   }, [isModelLoaded]);

   return {
      isListening,
      recognizedText,
      error,
      isAvailable,
      isModelLoaded,
      startListening,
      stopListening,
      resetRecognition,
      getPlatformInfo,
   };
};
