import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

export const useWebViewSpeechRecognition = () => {
   const [isListening, setIsListening] = useState(false);
   const [recognizedText, setRecognizedText] = useState("");
   const [partialText, setPartialText] = useState("");
   const [error, setError] = useState(null);
   const [isAvailable, setIsAvailable] = useState(false);
   const [isModelLoaded, setIsModelLoaded] = useState(false);
   
   const voskServiceRef = useRef(null);
   const webRecognitionRef = useRef(null);

   // Handle messages from Vosk WebView service
   const handleVoskMessage = useCallback((message) => {
      console.log("🎤 Vosk message:", message);
      
      switch (message.type) {
         case 'VOSK_READY':
            setIsModelLoaded(true);
            setIsAvailable(true);
            setError(null);
            console.log("✅ Vosk model loaded successfully");
            break;
            
         case 'VOSK_ERROR':
            setError(message.payload.error);
            setIsAvailable(false);
            setIsModelLoaded(false);
            setIsListening(false);
            console.error("❌ Vosk error:", message.payload.error);
            break;
            
         case 'SPEECH_START':
            setIsListening(true);
            setError(null);
            console.log("🎤 Speech recognition started");
            break;
            
         case 'SPEECH_STOP':
            setIsListening(false);
            setPartialText("");
            console.log("⏹️ Speech recognition stopped");
            break;
            
         case 'SPEECH_RESULT':
            setRecognizedText(message.payload.text);
            setPartialText("");
            console.log("📝 Final result:", message.payload.text);
            break;
            
         case 'SPEECH_PARTIAL':
            setPartialText(message.payload.text);
            console.log("📝 Partial result:", message.payload.text);
            break;
      }
   }, []);

   // Set up Web Speech API (fallback)
   const setupWebSpeechAPI = useCallback(() => {
      if (typeof window !== 'undefined' && (window.webkitSpeechRecognition || window.SpeechRecognition)) {
         setIsAvailable(true);
         setIsModelLoaded(true);
         console.log("🌐 Web Speech API available");
         return true;
      }
      return false;
   }, []);

   // Initialize
   useEffect(() => {
      if (Platform.OS === "web") {
         setupWebSpeechAPI();
      } else {
         // For mobile, we'll use the WebView service
         // The availability will be set when Vosk loads
         console.log("📱 Mobile platform - waiting for Vosk WebView service");
      }
   }, [setupWebSpeechAPI]);

   // Start listening function
   const startListening = useCallback(async (language = "en-US") => {
      try {
         setError(null);
         setRecognizedText("");
         setPartialText("");
         
         if (Platform.OS === "web" && (window.webkitSpeechRecognition || window.SpeechRecognition)) {
            // Use Web Speech API for web
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = language;

            recognition.onstart = () => {
               setIsListening(true);
               console.log("🎤 Web speech recognition started");
            };

            recognition.onresult = (event) => {
               let finalTranscript = '';
               let interimTranscript = '';

               for (let i = event.resultIndex; i < event.results.length; i++) {
                  const transcript = event.results[i][0].transcript;
                  if (event.results[i].isFinal) {
                     finalTranscript += transcript;
                  } else {
                     interimTranscript += transcript;
                  }
               }

               if (finalTranscript) {
                  setRecognizedText(finalTranscript);
                  setPartialText("");
                  console.log("📝 Web speech final result:", finalTranscript);
               } else if (interimTranscript) {
                  setPartialText(interimTranscript);
                  console.log("📝 Web speech partial result:", interimTranscript);
               }
            };

            recognition.onerror = (event) => {
               console.error("❌ Web speech error:", event.error);
               setError(event.error);
               setIsListening(false);
            };

            recognition.onend = () => {
               setIsListening(false);
               setPartialText("");
               console.log("⏹️ Web speech recognition ended");
            };

            webRecognitionRef.current = recognition;
            recognition.start();
         } else if (voskServiceRef.current && isModelLoaded) {
            // Use Vosk WebView service for mobile
            console.log("🎤 Starting Vosk recognition...");
            voskServiceRef.current.startRecognition();
         } else {
            throw new Error("Speech recognition not available or model not loaded");
         }
      } catch (err) {
         console.error("❌ Error starting speech recognition:", err);
         setError(err.message || "Failed to start speech recognition");
         setIsListening(false);
      }
   }, [isModelLoaded]);

   // Stop listening function
   const stopListening = useCallback(async () => {
      try {
         if (Platform.OS === "web" && webRecognitionRef.current) {
            webRecognitionRef.current.stop();
            webRecognitionRef.current = null;
         } else if (voskServiceRef.current) {
            voskServiceRef.current.stopRecognition();
         }
         
         setIsListening(false);
         setPartialText("");
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
      setPartialText("");
      setError(null);
   }, []);

   // Set Vosk service reference
   const setVoskServiceRef = useCallback((ref) => {
      voskServiceRef.current = ref;
   }, []);

   // Get platform info
   const getPlatformInfo = useCallback(() => {
      if (Platform.OS === "web") {
         return {
            platform: "web",
            engine: "Web Speech API",
            offline: false
         };
      } else if (isModelLoaded) {
         return {
            platform: Platform.OS,
            engine: "Vosk (WebView)",
            offline: true
         };
      }
      return {
         platform: Platform.OS,
         engine: "none",
         offline: false
      };
   }, [isModelLoaded]);

   return {
      isListening,
      recognizedText,
      partialText,
      error,
      isAvailable,
      isModelLoaded,
      startListening,
      stopListening,
      resetRecognition,
      getPlatformInfo,
      handleVoskMessage,
      setVoskServiceRef
   };
};
