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

   useEffect(() => {
      console.log(voiceStatusType);
   }, [voiceStatusType]);

   // References for Vosk recognition system
   const voskRecognizerRef = useRef(null);
   const audioContextRef = useRef(null);
   const mediaStreamRef = useRef(null);
   const sourceNodeRef = useRef(null);
   const processorNodeRef = useRef(null);

   const isManualStopRef = useRef(false);
   const voskModelRef = useRef(null);

   // Enhanced number parsing function for 0-1000
   const parseSpokenNumber = useCallback((text) => {
      if (!text) return null;

      const cleanText = text.toLowerCase().trim();

      // First, try to extract direct digits
      const digitMatch = cleanText.match(/\d+/);
      if (digitMatch) {
         const num = parseInt(digitMatch[0]);
         return num <= 1000 ? num : null;
      }

      // Check for "one thousand"
      if (cleanText.includes("thousand")) {
         return 1000;
      }

      // Extended number mapping
      const numberMap = {
         // Basic numbers
         zero: 0,
         one: 1,
         two: 2,
         three: 3,
         free: 3,
         four: 4,
         five: 5,
         six: 6,
         seven: 7,
         eight: 8,
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

      // Try complex hundreds patterns first (e.g., "five hundred sixty seven")
      const complexHundredMatch = cleanText.match(
         /(one|two|three|four|five|six|seven|eight|nine|won|to|too|tree|free|for|fore|file)\s*hundred\s*(and\s*)?(.+)/i
      );
      if (complexHundredMatch) {
         const hundreds =
            (numberMap[complexHundredMatch[1].toLowerCase()] || 1) * 100;
         const remainderText = complexHundredMatch[3];

         // Parse the remainder recursively
         const remainder = parseSpokenNumber(remainderText) || 0;
         const result = hundreds + remainder;
         return result <= 1000 ? result : null;
      }

      // Try simple hundred patterns (e.g., "two hundred")
      const simpleHundredMatch = cleanText.match(
         /(one|two|three|four|five|six|seven|eight|nine|won|to|too|tree|free|for|fore|file)\s*hundred$/i
      );
      if (simpleHundredMatch) {
         const hundreds =
            (numberMap[simpleHundredMatch[1].toLowerCase()] || 1) * 100;
         return hundreds;
      }

      // Try compound numbers like "thirty one", "forty five", etc.
      const compoundMatch = cleanText.match(
         /(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)\s+(one|two|three|four|five|six|seven|eight|nine|won|to|too|tree|free|for|fore|file|ate)/i
      );
      if (compoundMatch) {
         const tens = numberMap[compoundMatch[1].toLowerCase()] || 0;
         const ones = numberMap[compoundMatch[2].toLowerCase()] || 0;
         return tens + ones;
      }

      // Try just "hundred" alone
      if (cleanText.includes("hundred") && !cleanText.match(/\d/)) {
         return 100;
      }

      // Look for any single word numbers in the text
      const words = cleanText.split(/\s+/);
      for (const word of words) {
         const cleanWord = word.replace(/[^\w]/g, "");
         if (numberMap[cleanWord] !== undefined) {
            return numberMap[cleanWord];
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
               /go\s+to\s+next/i,
               /open\s+to\s+next/i,
               /open\s+next/i,
               /move\s+next/i,
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
               /go\s+back/i,
               /go\s+to\s+previous/i,
               /open\s+to\s+previous/i,
               /open\s+previous/i,
               /open\s+back/i,
               /open\s+to\s+back/i,
               /go\s+previous/i,
               /move\s+back/i,
            ],
            action: () => {
               onPrevOrder();
               return "Previous order";
            },
         },
         openOrder: {
            patterns: [/(?:open|show|select|go\s+to|go|goto|order)\s+(.+)/i],
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
               /open\s+first/i,
               /go\s+to\s+first/i,
               /go\s+first/i,
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
               /open\s+last/i,
               /go\s+to\s+last/i,
               /go\s+last/i,
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
                     setVoiceStatus(`ACTION: ${result}`);

                     setVoiceStatusType("success");
                     setShowVoiceStatus(true);
                     setTimeout(() => {
                        setShowVoiceStatus(false);
                        // Clean up memory after successful action
                        if (typeof window !== "undefined" && window.gc) {
                           window.gc();
                        }
                     }, 1500);
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
            const commandProcessed = processVoiceCommand(cleanTranscript);

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
      [processVoiceCommand]
   );

   // Initialize Vosk speech recognition
   const initializeVosk = useCallback(async () => {
      try {
         setVoiceStatus("Loading...");
         setVoiceStatusType("info");
         setShowVoiceStatus(true);

         // Function to convert numbers to words (0-1000)
         const numberToWords = (num) => {
            if (num === 0) return "zero";

            const ones = [
               "",
               "one",
               "two",
               "three",
               "four",
               "five",
               "six",
               "seven",
               "eight",
               "nine",
            ];
            const teens = [
               "ten",
               "eleven",
               "twelve",
               "thirteen",
               "fourteen",
               "fifteen",
               "sixteen",
               "seventeen",
               "eighteen",
               "nineteen",
            ];
            const tens = [
               "",
               "",
               "twenty",
               "thirty",
               "forty",
               "fifty",
               "sixty",
               "seventy",
               "eighty",
               "ninety",
            ];

            if (num === 1000) return "one thousand";
            if (num >= 100) {
               const hundreds = Math.floor(num / 100);
               const remainder = num % 100;
               let result = ones[hundreds] + " hundred";
               if (remainder > 0) {
                  if (remainder < 10) {
                     result += " " + ones[remainder];
                  } else if (remainder < 20) {
                     result += " " + teens[remainder - 10];
                  } else {
                     const tensPlace = Math.floor(remainder / 10);
                     const onesPlace = remainder % 10;
                     result += " " + tens[tensPlace];
                     if (onesPlace > 0) result += " " + ones[onesPlace];
                  }
               }
               return result;
            } else if (num >= 20) {
               const tensPlace = Math.floor(num / 10);
               const onesPlace = num % 10;
               let result = tens[tensPlace];
               if (onesPlace > 0) result += " " + ones[onesPlace];
               return result;
            } else if (num >= 10) {
               return teens[num - 10];
            } else {
               return ones[num];
            }
         };

         // Generate all numbers from 0 to 1000
         const numbers = [];
         for (let i = 0; i <= 1000; i++) {
            numbers.push(numberToWords(i));
         }

         // Define grammar for voice commands and numbers in Vosk format
         const grammarWords = [
            // All numbers from 0 to 1000
            ...numbers,

            // Navigation commands
            "next",
            "previous",
            "prev",
            "forward",
            "backward",
            "back",
            "go to",
            "goto",
            "select",
            "open",
            "show",

            // Order-specific commands
            "order",
            "orders",
            "first",
            "last",
            "page",
            "item",
         ];

         // Convert to Vosk grammar format (JSON string)
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
         <div className="fixed bottom-4 right-4 h-10 z-50 flex items-center gap-2">
            {/* Voice Status - Left side */}
            <div
               className={`max-w-xs h-full transition-opacity duration-300 ${
                  showVoiceStatus && voiceStatus ? "opacity-100" : "opacity-0"
               }`}
            >
               <div
                  className={`relative backdrop-blur-md h-full text-sm px-4 py-2 rounded-xl shadow-2xl border transition-colors duration-300 ${
                     voiceStatusType === "success"
                        ? "bg-green-500/80 text-white border-green-400"
                        : voiceStatusType === "error"
                        ? "bg-red-500/80 text-white border-red-400"
                        : "bg-blue-500/50 text-white border-blue-400"
                  }`}
               >
                  {voiceStatus}
               </div>
            </div>

            {/* Voice Control Button - Right side */}
            <button
               onClick={toggleVoiceRecognition}
               className={`relative h-full aspect-square rounded-2xl opacity-60 shadow-lg border-2 transition-all duration-300 ${
                  isVoiceListening
                     ? "bg-red-500 text-white border-red-600 animate-pulse active:bg-red-600"
                     : "bg-green-500 text-white border-green-600 active:bg-green-600"
               }`}
            >
               {isVoiceListening ? (
                  <MicOff className="size-5 mx-auto" />
               ) : (
                  <Mic className="size-5 mx-auto" />
               )}
            </button>
         </div>
      </>
   );
};

export default VoiceControl;
