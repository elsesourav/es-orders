import { Mic, MicOff } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Vosk from "../../lib/vosk.js";

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

   // Enhanced number parsing function
   const parseSpokenNumber = useCallback((text) => {
      if (!text) return null;

      const cleanText = text.toLowerCase().trim();

      // First, try to extract direct digits
      const digitMatch = cleanText.match(/\d+/);
      if (digitMatch) {
         const num = parseInt(digitMatch[0]);
         return num;
      }

      // Extended number mapping with common misheard words
      const numberMap = {
         // Basic numbers with common misheard alternatives
         one: 1,
         won: 1,
         want: 1,
         two: 2,
         to: 2,
         too: 2,
         three: 3,
         tree: 3,
         free: 3,
         four: 4,
         for: 4,
         fore: 4,
         five: 5,
         file: 5,
         fife: 5,
         six: 6,
         sex: 6,
         sick: 6,
         seven: 7,
         eight: 8,
         ate: 8,
         nine: 9,
         ten: 10,

         // Teens
         eleven: 11,
         twelve: 12,
         thirteen: 13,
         fourteen: 14,
         fifteen: 15,
         sixteen: 16,
         seventeen: 17,
         eighteen: 18,
         nineteen: 19,

         // Tens
         twenty: 20,
         thirty: 30,
         forty: 40,
         fifty: 50,
         sixty: 60,
         seventy: 70,
         eighty: 80,
         ninety: 90,

         // Hundreds
         hundred: 100,
      };

      // Try compound numbers like "thirty one", "forty five", etc.
      const compoundMatch = cleanText.match(
         /(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)[^\w]*(one|two|three|four|five|six|seven|eight|nine|won|to|too|tree|free|for|fore|file|ate)/i
      );
      if (compoundMatch) {
         const tens = numberMap[compoundMatch[1].toLowerCase()] || 0;
         const ones = numberMap[compoundMatch[2].toLowerCase()] || 0;
         const result = tens + ones;
         return result;
      }

      // Try "one hundred X" patterns
      const hundredMatch = cleanText.match(
         /(one|two|three|four|five|six|seven|eight|nine|won|to|too|tree|free|for|fore|file)\s*hundred\s*(and\s*)?(.*)/i
      );
      if (hundredMatch) {
         const hundreds = (numberMap[hundredMatch[1].toLowerCase()] || 1) * 100;
         const remainder = hundredMatch[3]
            ? parseSpokenNumber(hundredMatch[3])
            : 0;
         const result = hundreds + remainder;
         return result;
      }

      // Try simple hundred
      if (cleanText.includes("hundred")) {
         return 100;
      }

      // Look for any single word numbers in the text
      const words = cleanText.split(/\s+/);
      for (const word of words) {
         // Remove punctuation and check
         const cleanWord = word.replace(/[^\w]/g, "");
         if (numberMap[cleanWord]) {
            const result = numberMap[cleanWord];
            return result;
         }
      }

      return null;
   }, []);

   // Enhanced function to extract order number from text
   const extractOrderNumber = useCallback(
      (text) => {
         // Try different patterns to find the number
         const patterns = [
            // Direct number patterns
            /(?:open|show|select|go\s+to|order|number)\s+(\d+)/i,
            /(\d+)/,

            // Word patterns - more flexible
            /(?:open|show|select|go\s+to|order|number)\s+(.+)/i,
            /(.+)/,
         ];

         for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
               const numberText = match[1];
               const parsedNumber = parseSpokenNumber(numberText);
               if (parsedNumber && parsedNumber > 0) {
                  return parsedNumber;
               }
            }
         }

         return null;
      },
      [parseSpokenNumber]
   );

   // Action definitions with patterns - memoized to prevent unnecessary re-renders
   const voiceActions = useMemo(
      () => ({
         nextOrder: {
            patterns: [
               /next\s+order/i,
               /next\s+orders/i,
               /go\s+next/i,
               /move\s+next/i,
               /forward/i,
               /next/i,
            ],
            action: () => {
               onNextOrder();
               return "Next order";
            },
         },
         previousOrder: {
            patterns: [
               /previous\s+order/i,
               /previous\s+orders/i,
               /prev\s+order/i,
               /go\s+back/i,
               /go\s+previous/i,
               /move\s+back/i,
               /back/i,
               /previous/i,
            ],
            action: () => {
               onPrevOrder();
               return "Previous order";
            },
         },
         openOrder: {
            patterns: [
               // More flexible patterns that catch various phrasings
               /(?:open|show|select|go\s+to|order|number)\s+(.+)/i,
               /(?:open|show|select)\s*(.+)/i,
               /(.+)\s+(?:order|orders)/i,
               // Common misheard patterns
               /(?:hope|over|upon|opening)\s+(.+)/i,
               /(?:file|five|fife)\s*(\d+)?/i,
               /(?:show|so|shall)\s+(.+)/i,
               // Just numbers or words that could be numbers
               /(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)\s*\w*/i,
               /(won|to|too|tree|free|for|fore|file|ate)\s*\w*/i,
               /(\d+)/i,
            ],
            action: (matches) => {
               // Extract number from the matched text
               const orderNumber = extractOrderNumber(matches.input);

               if (orderNumber && orderNumber > 0) {
                  const orderIndex = orderNumber - 1; // Convert to 0-based index

                  if (orderIndex >= 0 && orderIndex < ordersLength) {
                     onSelectOrder(orderIndex);
                     return `Opened order ${orderNumber}`;
                  } else {
                     throw new Error(
                        `Order ${orderNumber} not found (1-${ordersLength})`
                     );
                  }
               } else {
                  throw new Error(
                     `Could not understand number in: "${matches.input}"`
                  );
               }
            },
         },
         firstOrder: {
            patterns: [
               /first\s+order/i,
               /go\s+to\s+first/i,
               /start/i,
               /beginning/i,
               /first/i,
            ],
            action: () => {
               if (ordersLength > 0) {
                  onSelectOrder(0);
                  return "First order";
               } else {
                  throw new Error("No orders available");
               }
            },
         },
         lastOrder: {
            patterns: [
               /last\s+order/i,
               /go\s+to\s+last/i,
               /end/i,
               /final/i,
               /last/i,
            ],
            action: () => {
               if (ordersLength > 0) {
                  onSelectOrder(ordersLength - 1);
                  return "Last order";
               } else {
                  throw new Error("No orders available");
               }
            },
         },
         helpCommands: {
            patterns: [
               /help/i,
               /commands/i,
               /what\s+can\s+i\s+say/i,
               /voice\s+commands/i,
            ],
            action: () => {
               return "Say: next, previous, open [number], first, last, or help";
            },
         },
      }),
      [
         onNextOrder,
         onPrevOrder,
         onSelectOrder,
         ordersLength,
         extractOrderNumber,
      ]
   );

   // Process voice commands directly
   const processVoiceCommand = useCallback(
      (transcript) => {
         // Try to match against all action patterns
         for (const [, actionDef] of Object.entries(voiceActions)) {
            for (const pattern of actionDef.patterns) {
               const matches = transcript.match(pattern);
               if (matches) {
                  try {
                     const result = actionDef.action(matches);
                     setVoiceStatus(result);
                     setVoiceStatusType("success");
                     setShowVoiceStatus(true);
                     setTimeout(() => setShowVoiceStatus(false), 1500);
                     return true; // Command processed successfully
                  } catch (error) {
                     setVoiceStatus(error.message);
                     setVoiceStatusType("error");
                     setShowVoiceStatus(true);
                     setTimeout(() => setShowVoiceStatus(false), 2000);
                     return true; // Command was recognized but failed
                  }
               }
            }
         }

         // If no action matched, show "not recognized" briefly
         setVoiceStatus(`"${transcript}" - not recognized`);
         setVoiceStatusType("info");
         setShowVoiceStatus(true);
         setTimeout(() => setShowVoiceStatus(false), 1500);
         return false;
      },
      [voiceActions]
   );

   // Process transcript from either recognition system
   const handleTranscript = useCallback(
      (transcript, isFinal = true) => {
         if (!transcript.trim()) return;

         const cleanTranscript = transcript.toLowerCase().trim();

         if (isFinal) {
            // Process command directly
            processVoiceCommand(cleanTranscript);
            setVoiceStatus(`Heard: "${cleanTranscript}"`);
            setVoiceStatusType("info");
            setShowVoiceStatus(true);
         } else {
            // Show interim results
            setVoiceStatus(`Listening: "${cleanTranscript}"`);
            setVoiceStatusType("info");
            setShowVoiceStatus(true);
         }
      },
      [processVoiceCommand]
   );

   // Initialize Vosk speech recognition
   const initializeVosk = useCallback(async () => {
      try {
         setVoiceStatus("Loading Vosk model...");
         setVoiceStatusType("info");
         setShowVoiceStatus(true);


         const model = await Vosk.createModel(
            "./models/vosk-model-small-en-us-0.15.zip"
         );
         voskModelRef.current = model;

         const recognizer = new model.KaldiRecognizer(16000);
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

         setVoiceStatus("Vosk model loaded");
         setVoiceStatusType("success");
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
         setVoiceStatus("Listening with Vosk");
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
         setTimeout(() => setShowVoiceStatus(false), 1500);
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
         stopVoskListening();
      };
   }, [stopVoskListening]);

   return (
      <>
         {/* Fixed Voice Control Button - Top Right */}
         <button
            onClick={toggleVoiceRecognition}
            className={`fixed top-16 right-4 z-50 size-11 rounded-2xl shadow-lg border-2 transition-all duration-300 opacity-40 ${
               isVoiceListening
                  ? "bg-red-500 text-white border-red-600 animate-pulse active:bg-red-600"
                  : "bg-green-500 text-white border-green-600 active:bg-green-600"
            }`}
         >
            {isVoiceListening ? (
               <MicOff className="w-6 h-6 mx-auto" />
            ) : (
               <Mic className="w-6 h-6 mx-auto" />
            )}
         </button>

         {/* Recognition Type Indicator */}
         {isVoiceListening && (
            <div className="fixed top-16 right-16 z-40">
               <div className="backdrop-blur-md text-xs px-2 py-1 rounded-lg shadow-lg border bg-purple-500/80 text-white border-purple-400/30">
                  Vosk
               </div>
            </div>
         )}

         {/* Voice Commands Help - Top Right, below the mic button */}
         {isVoiceListening && (
            <div className="fixed top-28 right-4 z-40 max-w-xs">
               <div className="backdrop-blur-md text-xs px-2 py-1 rounded-lg shadow-lg border bg-green-500/80 text-white border-green-400/30">
                  <div className="flex items-center gap-1">
                     <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                     Say: next, prev, open [#], first, last
                  </div>
               </div>
            </div>
         )}

         {/* Fixed Voice Status - Bottom Right */}
         {showVoiceStatus && voiceStatus && (
            <div className="fixed bottom-4 right-4 z-40 max-w-xs animate-pulse">
               <div
                  className={`backdrop-blur-md text-sm px-4 py-2 rounded-xl shadow-2xl border ${
                     voiceStatusType === "success"
                        ? "bg-green-500/80 text-white border-green-400/30"
                        : voiceStatusType === "error"
                        ? "bg-red-500/80 text-white border-red-400/30"
                        : "bg-black/30 dark:bg-white/30 text-white dark:text-gray-800 border-white/20 dark:border-gray-600/20"
                  }`}
               >
                  {voiceStatus}
               </div>
            </div>
         )}
      </>
   );
};

export default VoiceControl;
