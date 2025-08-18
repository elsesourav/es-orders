import { Mic, MicOff } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Vosk from "../../lib/vosk.js";
import {
   createVoiceActions,
   generateGrammarWords,
   processVoiceCommand,
} from "./recognition.js";

/**
 * @param {Function} onNextOrder - Callback for next order navigation
 * @param {Function} onPrevOrder - Callback for previous order navigation
 * @param {Function} onSelectOrder - Callback for direct order selection
 * @param {number} ordersLength - Total number of orders available
 */
const VoiceControl = ({
   onNextOrder,
   onPrevOrder,
   onSelectOrder,
   ordersLength,
}) => {
   const [isVoiceListening, setIsVoiceListening] = useState(false);
   const [voiceStatus, setVoiceStatus] = useState(
      "Click to start voice commands"
   );
   const [showVoiceStatus, setShowVoiceStatus] = useState(false);
   const [voiceStatusType, setVoiceStatusType] = useState("info"); // "success", "error", "info"

   // References for Vosk recognition system
   const voskRecognizerRef = useRef(null);
   const audioContextRef = useRef(null);
   const mediaStreamRef = useRef(null);
   const sourceNodeRef = useRef(null);
   const processorNodeRef = useRef(null);

   const isManualStopRef = useRef(false);
   const voskModelRef = useRef(null);

   // Action definitions with patterns - memoized to prevent unnecessary re-renders
   const voiceActions = useMemo(
      () =>
         createVoiceActions(
            onNextOrder,
            onPrevOrder,
            onSelectOrder,
            ordersLength
         ),
      [onNextOrder, onPrevOrder, onSelectOrder, ordersLength]
   );

   // Process voice commands using the recognition module
   const handleVoiceCommand = useCallback(
      (transcript) => {
         const result = processVoiceCommand(transcript, voiceActions);

         setVoiceStatus(result.message);
         setVoiceStatusType(result.type);
         setShowVoiceStatus(true);

         const timeout =
            result.type === "success"
               ? 1500
               : result.type === "error"
               ? 2000
               : 1500;
         setTimeout(() => {
            setShowVoiceStatus(false);
            // Clean up memory after successful action
            if (
               result.type === "success" &&
               typeof window !== "undefined" &&
               window.gc
            ) {
               window.gc();
            }
         }, timeout);

         return result.success;
      },
      [voiceActions]
   );

   // Process transcript from either recognition system
   const handleTranscript = useCallback(
      (transcript, isFinal = true) => {
         if (!transcript.trim()) return;

         const cleanTranscript = transcript.toLowerCase().trim();

         if (isFinal) {
            const commandProcessed = handleVoiceCommand(cleanTranscript);

            // Only show the transcript as info if no command was processed
            if (!commandProcessed) {
               setVoiceStatus(cleanTranscript);
               setVoiceStatusType("info");
               setShowVoiceStatus(true);
            }
         } else {
            // Show interim results
            setVoiceStatus(cleanTranscript);
            setVoiceStatusType("info");
            setShowVoiceStatus(true);
         }
      },
      [handleVoiceCommand]
   );

   // Initialize Vosk speech recognition
   const initializeVosk = useCallback(async () => {
      try {
         setVoiceStatus("Loading...");
         setVoiceStatusType("info");
         setShowVoiceStatus(true);

         // Generate grammar words using the recognition module
         const grammarWords = generateGrammarWords();
         const grammar = JSON.stringify(grammarWords);

         const model = await Vosk.createModel(
            "./models/vosk-model-small-en-us-0.15.zip"
         );
         voskModelRef.current = model;

         const recognizer = new model.KaldiRecognizer(16000, grammar);
         voskRecognizerRef.current = recognizer;

         // Set up event handlers
         recognizer.on("result", (message) => {
            if (message.result.text) {
               handleTranscript(message.result.text, true);
            }
         });

         recognizer.on("partialresult", (message) => {
            if (message.result.partial) {
               handleTranscript(message.result.partial, false);
            }
         });

         setVoiceStatus("Mic On");
         setVoiceStatusType("info");
         setShowVoiceStatus(true);
         setTimeout(() => setShowVoiceStatus(false), 2000);

         return true;
      } catch (error) {
         console.error("Failed to initialize Vosk:", error);
         setVoiceStatus("Vosk initialization failed");
         setVoiceStatusType("error");
         setShowVoiceStatus(true);
         setTimeout(() => setShowVoiceStatus(false), 3000);
         return false;
      }
   }, [handleTranscript]);

   // Start Vosk listening
   const startVoskListening = useCallback(async () => {
      try {
         // Get microphone access with optimal settings for Vosk
         mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({
            audio: {
               sampleRate: 16000, // Model's optimal sample rate
               channelCount: 1, // Mono audio
               echoCancellation: true, // Keep echo cancellation for better quality
               noiseSuppression: true, // Keep noise suppression for cleaner audio
               autoGainControl: true, // Auto gain helps with volume levels
            },
         });

         // Create audio context with 16kHz sample rate
         audioContextRef.current = new AudioContext({ sampleRate: 16000 });
         sourceNodeRef.current =
            audioContextRef.current.createMediaStreamSource(
               mediaStreamRef.current
            );
         processorNodeRef.current =
            audioContextRef.current.createScriptProcessor(2048, 1, 1);

         // Process audio data
         processorNodeRef.current.onaudioprocess = (event) => {
            try {
               if (voskRecognizerRef.current) {
                  voskRecognizerRef.current.acceptWaveform(event.inputBuffer);
               }
            } catch {
               // Silently handle audio processing errors
            }
         };

         // Connect audio nodes
         sourceNodeRef.current.connect(processorNodeRef.current);
         processorNodeRef.current.connect(audioContextRef.current.destination);

         setIsVoiceListening(true);
         setVoiceStatus("Listening...");
         setVoiceStatusType("info");
         setShowVoiceStatus(true);
         setTimeout(() => setShowVoiceStatus(false), 2000);

         return true;
      } catch (error) {
         console.error("Error starting Vosk listening:", error);
         setVoiceStatus("Microphone access denied");
         setVoiceStatusType("error");
         setShowVoiceStatus(true);
         setTimeout(() => setShowVoiceStatus(false), 3000);
         return false;
      }
   }, []);

   // Stop Vosk listening
   const stopVoskListening = useCallback(() => {
      if (mediaStreamRef.current) {
         mediaStreamRef.current.getTracks().forEach((track) => track.stop());
         mediaStreamRef.current = null;
      }
      if (processorNodeRef.current) {
         processorNodeRef.current.disconnect();
         processorNodeRef.current = null;
      }
      if (sourceNodeRef.current) {
         sourceNodeRef.current.disconnect();
         sourceNodeRef.current = null;
      }
      if (
         audioContextRef.current &&
         audioContextRef.current.state !== "closed"
      ) {
         audioContextRef.current.close();
         audioContextRef.current = null;
      }
   }, []);

   // Clean up Vosk model and recognizer
   const cleanupVoskModel = useCallback(() => {
      try {
         // Terminate recognizer
         if (voskRecognizerRef.current) {
            voskRecognizerRef.current.remove?.();
            voskRecognizerRef.current = null;
         }

         // Terminate model
         if (voskModelRef.current) {
            voskModelRef.current.terminate();
            voskModelRef.current = null;
         }

         console.log("Vosk model and recognizer cleaned up");
      } catch (error) {
         console.warn("Error during Vosk cleanup:", error);
      }
   }, []);

   // Complete memory cleanup
   const performMemoryCleanup = useCallback(() => {
      // Stop audio streams
      stopVoskListening();
      cleanupVoskModel();

      // Reset state
      setIsVoiceListening(false);
      setShowVoiceStatus(false);
      setVoiceStatus("Click to start voice commands");
      setVoiceStatusType("info");

      // Force garbage collection if available (development only)
      if (typeof window !== "undefined" && window.gc) {
         window.gc();
      }

      console.log("Memory cleanup completed");
   }, [stopVoskListening, cleanupVoskModel]);

   // Toggle voice recognition (Vosk only)
   const toggleVoiceRecognition = useCallback(async () => {
      if (isVoiceListening) {
         // Stop recognition
         isManualStopRef.current = true;
         stopVoskListening();
         setIsVoiceListening(false);

         setVoiceStatus("Voice recognition stopped");
         setVoiceStatusType("info");
         setShowVoiceStatus(true);
         setTimeout(() => {
            setShowVoiceStatus(false);
            // Clean up memory after stopping
            if (typeof window !== "undefined" && window.gc) {
               window.gc();
            }
         }, 1500);
      } else {
         // Start recognition with Vosk
         isManualStopRef.current = false;

         const voskInitialized =
            voskRecognizerRef.current || (await initializeVosk());
         if (voskInitialized) {
            await startVoskListening();
         } else {
            setVoiceStatus("Voice recognition unavailable");
            setVoiceStatusType("error");
            setShowVoiceStatus(true);
            setTimeout(() => setShowVoiceStatus(false), 3000);
         }
      }
   }, [
      isVoiceListening,
      initializeVosk,
      startVoskListening,
      stopVoskListening,
   ]);

   // Cleanup on unmount
   useEffect(() => {
      return () => {
         isManualStopRef.current = true;
         performMemoryCleanup();
      };
   }, [performMemoryCleanup]);

   return (
      <>
         {/* Fixed Voice Control Section - Bottom Right */}
         <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 h-10 z-50 flex items-center gap-2">
            {/* Voice Status - Left side */}
            <div
               className={`max-w-xs h-full transition-opacity duration-300 ${
                  showVoiceStatus && voiceStatus ? "opacity-100" : "opacity-0"
               }`}
            >
               <div
                  className={`relative backdrop-blur-sm h-full text-sm px-4 py-2 rounded-lg shadow-app-md border transition-colors duration-300 ${
                     voiceStatusType === "success"
                        ? "bg-gradient-to-r from-emerald-500/90 to-green-500/90 dark:from-emerald-600/90 dark:to-green-600/90 text-white border-emerald-400 dark:border-emerald-500"
                        : voiceStatusType === "error"
                        ? "bg-error/80 dark:bg-error/70 text-white border-error dark:border-error/80"
                        : "bg-info/80 dark:bg-info/70 text-white border-info dark:border-info/80"
                  }`}
               >
                  <div
                     className={`absolute inset-0 rounded-lg ${
                        voiceStatusType === "success"
                           ? "bg-gradient-to-b from-white/30 via-emerald-200/20 to-transparent"
                           : "bg-gradient-to-b from-white/20 via-transparent to-transparent"
                     }`}
                  ></div>
                  <span className="relative font-medium">{voiceStatus}</span>
               </div>
            </div>

            {/* Voice Control Button - Right side */}
            <button
               onClick={toggleVoiceRecognition}
               className={`relative h-full aspect-square rounded-xl backdrop-blur-sm shadow-app-md border transition-all duration-300 ${
                  isVoiceListening
                     ? "bg-error/80 dark:bg-error/70 text-white border-error dark:border-error/80 animate-pulse hover:bg-error/90 dark:hover:bg-error/80"
                     : "bg-gradient-to-br from-emerald-500/90 to-green-600/90 dark:from-emerald-600/90 dark:to-green-700/90 text-white border-emerald-400 dark:border-emerald-500 hover:from-emerald-600/90 hover:to-green-700/90 dark:hover:from-emerald-700/90 dark:hover:to-green-800/90"
               }`}
            >
               <div
                  className={`absolute inset-0 rounded-xl ${
                     isVoiceListening
                        ? "bg-gradient-to-b from-white/20 via-transparent to-transparent"
                        : "bg-gradient-to-b from-white/30 via-emerald-200/20 to-transparent"
                  }`}
               ></div>
               {isVoiceListening ? (
                  <MicOff className="size-5 mx-auto relative" />
               ) : (
                  <Mic className="size-5 mx-auto relative" />
               )}
            </button>
         </div>
      </>
   );
};

export default VoiceControl;
