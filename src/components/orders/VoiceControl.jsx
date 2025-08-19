import { Mic, MicOff } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "../../lib/useLanguage";
import { useVoiceSettings } from "../../lib/useVoiceSettings";
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
   const { t } = useLanguage();
   const { actionTalkEnabled, showMicButton } = useVoiceSettings();
   const [isVoiceListening, setIsVoiceListening] = useState(false);
   const [voiceStatus, setVoiceStatus] = useState(t("voice.clickToStart"));
   const [showVoiceStatus, setShowVoiceStatus] = useState(false);
   const [voiceStatusType, setVoiceStatusType] = useState("info"); // "success", "error", "info"
   const [isSpeaking, setIsSpeaking] = useState(false); // Track if TTS is speaking

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

   // Temporarily pause voice recognition (mute microphone)
   const pauseVoiceRecognition = useCallback(() => {
      if (mediaStreamRef.current) {
         mediaStreamRef.current.getTracks().forEach((track) => {
            track.enabled = false;
         });
      }
   }, []);

   // Resume voice recognition (unmute microphone)
   const resumeVoiceRecognition = useCallback(() => {
      if (mediaStreamRef.current) {
         mediaStreamRef.current.getTracks().forEach((track) => {
            track.enabled = true;
         });
      }
   }, []);

   // Process voice commands using the recognition module
   const handleVoiceCommand = useCallback(
      (transcript) => {
         const result = processVoiceCommand(
            transcript,
            voiceActions,
            actionTalkEnabled, // Use the setting to control TTS
            () => {
               // On speech start: pause voice recognition and update state
               setIsSpeaking(true);
               pauseVoiceRecognition();
            },
            () => {
               // On speech end: resume voice recognition and update state
               setIsSpeaking(false);
               resumeVoiceRecognition();
            }
         );

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
      [
         voiceActions,
         actionTalkEnabled,
         pauseVoiceRecognition,
         resumeVoiceRecognition,
      ]
   ); // Process transcript from either recognition system
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
         setVoiceStatus(t("voice.loading"));
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

         setVoiceStatus(t("voice.micOn"));
         setVoiceStatusType("info");
         setShowVoiceStatus(true);
         setTimeout(() => setShowVoiceStatus(false), 2000);

         return true;
      } catch (error) {
         console.error("Failed to initialize Vosk:", error);
         setVoiceStatus(t("voice.voskInitializationFailed"));
         setVoiceStatusType("error");
         setShowVoiceStatus(true);
         setTimeout(() => setShowVoiceStatus(false), 3000);
         return false;
      }
   }, [handleTranscript, t]);

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
         setVoiceStatus(t("voice.listening"));
         setVoiceStatusType("info");
         setShowVoiceStatus(true);
         setTimeout(() => setShowVoiceStatus(false), 2000);

         return true;
      } catch (error) {
         console.error("Error starting Vosk listening:", error);
         setVoiceStatus(t("voice.microphoneAccessDenied"));
         setVoiceStatusType("error");
         setShowVoiceStatus(true);
         setTimeout(() => setShowVoiceStatus(false), 3000);
         return false;
      }
   }, [t]);

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
      setVoiceStatus(t("voice.clickToStart"));
      setVoiceStatusType("info");

      // Force garbage collection if available (development only)
      if (typeof window !== "undefined" && window.gc) {
         window.gc();
      }

      console.log("Memory cleanup completed");
   }, [stopVoskListening, cleanupVoskModel, t]);

   // Toggle voice recognition (Vosk only)
   const toggleVoiceRecognition = useCallback(async () => {
      if (isVoiceListening) {
         // Stop recognition
         isManualStopRef.current = true;
         stopVoskListening();
         setIsVoiceListening(false);

         setVoiceStatus(t("voice.voiceRecognitionStopped"));
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
            setVoiceStatus(t("voice.voiceRecognitionUnavailable"));
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
      t,
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
         {showMicButton && (
            <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 h-10 z-50 flex items-center gap-2">
               {/* Voice Status - Left side */}
               <div
                  className={`max-w-xs h-full transition-opacity duration-300 ${
                     showVoiceStatus &&
                     voiceStatus &&
                     voiceStatusType === "success"
                        ? "opacity-100"
                        : showVoiceStatus && voiceStatus
                        ? "opacity-50"
                        : "opacity-0"
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
                  className={`relative h-full opacity-50 aspect-square rounded-xl backdrop-blur-sm shadow-app-md border transition-all duration-300 ${
                     isVoiceListening
                        ? isSpeaking
                           ? "bg-warning/80 dark:bg-warning/70 text-white border-warning dark:border-warning/80 animate-pulse hover:bg-warning/90 dark:hover:bg-warning/80"
                           : "bg-error/80 dark:bg-error/70 text-white border-error dark:border-error/80 animate-pulse hover:bg-error/90 dark:hover:bg-error/80"
                        : "bg-gradient-to-br from-emerald-500/90 to-green-600/90 dark:from-emerald-600/90 dark:to-green-700/90 text-white border-emerald-400 dark:border-emerald-500 hover:from-emerald-600/90 hover:to-green-700/90 dark:hover:from-emerald-700/90 dark:hover:to-green-800/90"
                  }`}
               >
                  <div
                     className={`absolute inset-0 rounded-xl ${
                        isVoiceListening
                           ? isSpeaking
                              ? "bg-gradient-to-b from-white/20 via-transparent to-transparent"
                              : "bg-gradient-to-b from-white/20 via-transparent to-transparent"
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
         )}
      </>
   );
};

export default VoiceControl;
