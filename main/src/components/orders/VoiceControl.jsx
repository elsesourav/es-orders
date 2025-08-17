import { Mic, MicOff } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Enhanced Voice Control Component with Queue System
 * 
 * Features:
 * - Continuous voice recognition without stopping
 * - Command queue system (max 2 commands) for better processing
 * - Pattern-based action matching with multiple command variations
 * - Automatic queue cleanup (commands older than 10 seconds removed)
 * - Visual feedback for queue status and command results
 * - Support for both numeric and spoken number commands
 * 
 * Supported Commands:
 * - Navigation: "next", "previous", "back", "forward"
 * - Direct order access: "open 5", "show three", "order 10"
 * - Quick navigation: "first", "last", "start", "end"
 * - Help: "help", "commands"
 * 
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
   const [shouldStopVoice, setShouldStopVoice] = useState(false);
   const recognitionRef = useRef(null);
   const restartTimeoutRef = useRef(null);
   const isManualStopRef = useRef(false);
   const heartbeatRef = useRef(null);

   // Voice Command Queue - maximum length of 2
   const [voiceQueue, setVoiceQueue] = useState([]);
   const queueMaxLength = 2;

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
               /open\s+(\d+)/i,
               /open\s+order\s+(\d+)/i,
               /show\s+(\d+)/i,
               /select\s+(\d+)/i,
               /go\s+to\s+(\d+)/i,
               /order\s+(\d+)/i,
               /number\s+(\d+)/i,
            ],
            action: (matches) => {
               const orderNumber = parseInt(matches[1]);
               const orderIndex = orderNumber - 1; // Convert to 0-based index
               if (orderIndex >= 0 && orderIndex < ordersLength) {
                  onSelectOrder(orderIndex);
                  return `Opened order ${orderNumber}`;
               } else {
                  throw new Error(`Order ${orderNumber} not found (1-${ordersLength})`);
               }
            },
         },
         openOrderSpoken: {
            patterns: [
               /open\s+(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)/i,
               /show\s+(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)/i,
               /select\s+(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)/i,
               /order\s+(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)/i,
               /number\s+(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)/i,
            ],
            action: (matches) => {
               const spokenNumber = matches[1].toLowerCase();
               const numberMap = {
                  one: 1,
                  two: 2,
                  three: 3,
                  four: 4,
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
               const orderNumber = numberMap[spokenNumber];
               const orderIndex = orderNumber - 1;
               if (orderIndex >= 0 && orderIndex < ordersLength) {
                  onSelectOrder(orderIndex);
                  return `Opened order ${orderNumber}`;
               } else {
                  throw new Error(`Order ${orderNumber} not found (1-${ordersLength})`);
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
      [onNextOrder, onPrevOrder, onSelectOrder, ordersLength]
   );

   // Add voice command to queue
   const addToVoiceQueue = useCallback(
      (transcript) => {
         setVoiceQueue((prev) => {
            const newQueue = [
               ...prev,
               {
                  text: transcript,
                  timestamp: Date.now(),
               },
            ];
            // Keep only the last queueMaxLength items
            return newQueue.slice(-queueMaxLength);
         });
      },
      [queueMaxLength]
   );

   // Process voice commands from queue
   const processVoiceCommand = useCallback(
      (transcript) => {
         console.log("Processing voice command:", transcript);

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

   // Check queue for combined commands
   const checkQueueForActions = useCallback(() => {
      if (voiceQueue.length === 0) return;

      // Try to process the most recent command first
      const latestCommand = voiceQueue[voiceQueue.length - 1];
      const processed = processVoiceCommand(latestCommand.text);

      // If single command didn't work and we have 2 commands, try combining them
      if (!processed && voiceQueue.length === 2) {
         const combinedText = voiceQueue.map((item) => item.text).join(" ");
         processVoiceCommand(combinedText);
      }
   }, [voiceQueue, processVoiceCommand]);

   // Clear old commands from queue (older than 10 seconds)
   useEffect(() => {
      if (voiceQueue.length === 0) return;

      const timer = setTimeout(() => {
         const now = Date.now();
         setVoiceQueue((prev) =>
            prev.filter((item) => now - item.timestamp < 10000)
         ); // Keep commands from last 10 seconds
      }, 1000);

      return () => clearTimeout(timer);
   }, [voiceQueue]);

   // Voice Recognition Functions
   const initializeVoiceRecognition = useCallback(() => {
      if (
         !("webkitSpeechRecognition" in window) &&
         !("SpeechRecognition" in window)
      ) {
         setVoiceStatus("Voice recognition not supported in this browser");
         return;
      }

      const SpeechRecognition =
         window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "en-IN";

      recognition.onstart = () => {
         setIsVoiceListening(true);
         setShouldStopVoice(false);
         isManualStopRef.current = false;
         setVoiceStatus("Listening");
         setVoiceStatusType("info");
         setShowVoiceStatus(true);

         // Hide status after 2 seconds
         setTimeout(() => {
            setShowVoiceStatus(false);
         }, 2000);

         // Start heartbeat to restart recognition periodically (every 30 seconds)
         // This helps prevent browser timeouts
         heartbeatRef.current = setInterval(() => {
            if (
               !shouldStopVoice &&
               !isManualStopRef.current &&
               recognitionRef.current
            ) {
               try {
                  console.log("Heartbeat restart...");
                  recognitionRef.current.stop(); // This will trigger onend which will restart
               } catch (error) {
                  console.log("Heartbeat restart failed:", error);
               }
            }
         }, 30000); // 30 seconds
      };

      recognition.onend = () => {
         console.log(
            "Recognition ended. Manual stop:",
            isManualStopRef.current,
            "Should stop:",
            shouldStopVoice
         );

         // Clear any existing restart timeout
         if (restartTimeoutRef.current) {
            clearTimeout(restartTimeoutRef.current);
            restartTimeoutRef.current = null;
         }

         // Clear heartbeat when recognition ends
         if (heartbeatRef.current) {
            clearInterval(heartbeatRef.current);
            heartbeatRef.current = null;
         }

         // Only stop if manually stopped
         if (isManualStopRef.current || shouldStopVoice) {
            setIsVoiceListening(false);
            setVoiceStatus("Stopped");
            setVoiceStatusType("info");
            setShowVoiceStatus(true);
            setTimeout(() => setShowVoiceStatus(false), 1500);
         } else {
            // Auto-restart after a short delay to handle browser limitations
            restartTimeoutRef.current = setTimeout(() => {
               if (
                  !shouldStopVoice &&
                  !isManualStopRef.current &&
                  recognitionRef.current
               ) {
                  try {
                     console.log("Auto-restarting recognition...");
                     recognitionRef.current.start();
                  } catch (error) {
                     console.log("Auto-restart failed:", error);
                     // Try again with a longer delay
                     restartTimeoutRef.current = setTimeout(() => {
                        if (
                           !shouldStopVoice &&
                           !isManualStopRef.current &&
                           recognitionRef.current
                        ) {
                           try {
                              recognitionRef.current.start();
                           } catch (err) {
                              console.log(
                                 "Second restart attempt failed:",
                                 err
                              );
                              setIsVoiceListening(false);
                              setVoiceStatus("Auto-restart failed");
                              setVoiceStatusType("error");
                              setShowVoiceStatus(true);
                              setTimeout(() => setShowVoiceStatus(false), 2000);
                           }
                        }
                     }, 2000);
                  }
               }
            }, 1000);
         }
      };

      recognition.onerror = (event) => {
         console.error("Speech recognition error:", event.error);

         // Clear restart timeout on error
         if (restartTimeoutRef.current) {
            clearTimeout(restartTimeoutRef.current);
            restartTimeoutRef.current = null;
         }

         // Clear heartbeat on error
         if (heartbeatRef.current) {
            clearInterval(heartbeatRef.current);
            heartbeatRef.current = null;
         }

         if (event.error === "not-allowed") {
            setVoiceStatus("Access denied");
            setVoiceStatusType("error");
            setIsVoiceListening(false);
            setShouldStopVoice(true);
            isManualStopRef.current = true;
            setShowVoiceStatus(true);
            setTimeout(() => setShowVoiceStatus(false), 3000);
         } else if (event.error === "no-speech") {
            // Don't stop for no-speech, just show brief status
            setVoiceStatus("No speech detected");
            setVoiceStatusType("info");
            setShowVoiceStatus(true);
            setTimeout(() => setShowVoiceStatus(false), 1500);
         } else if (event.error === "aborted") {
            // Recognition was manually stopped
            if (isManualStopRef.current || shouldStopVoice) {
               setVoiceStatus("Stopped");
               setVoiceStatusType("info");
               setShowVoiceStatus(true);
               setTimeout(() => setShowVoiceStatus(false), 1500);
            }
         } else if (event.error === "network") {
            setVoiceStatus("Network error - retrying...");
            setVoiceStatusType("error");
            setShowVoiceStatus(true);
            setTimeout(() => setShowVoiceStatus(false), 2000);

            // Auto-retry for network errors
            if (!shouldStopVoice && !isManualStopRef.current) {
               restartTimeoutRef.current = setTimeout(() => {
                  if (
                     recognitionRef.current &&
                     !shouldStopVoice &&
                     !isManualStopRef.current
                  ) {
                     try {
                        recognitionRef.current.start();
                     } catch (err) {
                        console.log("Network error restart failed:", err);
                     }
                  }
               }, 3000);
            }
         } else {
            setVoiceStatus("Recognition error");
            setVoiceStatusType("error");
            setShowVoiceStatus(true);
            setTimeout(() => setShowVoiceStatus(false), 2000);
         }
      };

      recognition.onresult = (event) => {
         let finalTranscript = "";
         let interimTranscript = "";

         // Process both final and interim results
         for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
               finalTranscript += event.results[i][0].transcript;
            } else {
               interimTranscript += event.results[i][0].transcript;
            }
         }

         // Only process final results
         if (finalTranscript.trim()) {
            const transcript = finalTranscript.toLowerCase().trim();
            console.log("Voice command received:", transcript);

            // Add to queue
            addToVoiceQueue(transcript);

            // Show what was heard
            setVoiceStatus(`Heard: "${transcript}"`);
            setVoiceStatusType("info");
            setShowVoiceStatus(true);

            // Process the command after a short delay to allow for queue updates
            setTimeout(() => {
               checkQueueForActions();
            }, 100);
         }

         // Show interim results in status (optional)
         if (interimTranscript.trim()) {
            setVoiceStatus(`Listening: "${interimTranscript.trim()}"`);
            setVoiceStatusType("info");
            setShowVoiceStatus(true);
         }
      };

      recognitionRef.current = recognition;
      return recognition;
   }, [shouldStopVoice, addToVoiceQueue, checkQueueForActions]);

   const toggleVoiceRecognition = useCallback(() => {
      if (!recognitionRef.current) {
         const recognition = initializeVoiceRecognition();
         if (!recognition) return;
      }

      if (isVoiceListening) {
         // Stop voice recognition
         isManualStopRef.current = true;
         setShouldStopVoice(true);

         // Clear any pending restart
         if (restartTimeoutRef.current) {
            clearTimeout(restartTimeoutRef.current);
            restartTimeoutRef.current = null;
         }

         // Clear heartbeat
         if (heartbeatRef.current) {
            clearInterval(heartbeatRef.current);
            heartbeatRef.current = null;
         }

         recognitionRef.current.stop();
         setVoiceStatus("Voice recognition stopped");
      } else {
         // Start voice recognition
         isManualStopRef.current = false;
         setShouldStopVoice(false);
         try {
            recognitionRef.current.start();
         } catch (error) {
            console.error("Failed to start voice recognition:", error);
            setVoiceStatus("Failed to start voice recognition - Try again");
            setVoiceStatusType("error");
            setShowVoiceStatus(true);
            setTimeout(() => setShowVoiceStatus(false), 2000);
         }
      }
   }, [isVoiceListening, initializeVoiceRecognition]);

   // Initialize voice recognition on component mount (no auto-start)
   useEffect(() => {
      initializeVoiceRecognition();

      return () => {
         // Cleanup on unmount
         isManualStopRef.current = true;
         setShouldStopVoice(true);

         if (restartTimeoutRef.current) {
            clearTimeout(restartTimeoutRef.current);
            restartTimeoutRef.current = null;
         }

         if (heartbeatRef.current) {
            clearInterval(heartbeatRef.current);
            heartbeatRef.current = null;
         }

         if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
         }
      };
   }, [initializeVoiceRecognition]);

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

         {/* Voice Queue Indicator - Top Right, below the mic button */}
         {isVoiceListening && voiceQueue.length > 0 && (
            <div className="fixed top-28 right-4 z-40 max-w-xs">
               <div className="backdrop-blur-md text-xs px-2 py-1 rounded-lg shadow-lg border bg-blue-500/80 text-white border-blue-400/30">
                  <div className="flex items-center gap-1">
                     <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                     Queue: {voiceQueue.length}/{queueMaxLength}
                  </div>
                  {voiceQueue.length > 0 && (
                     <div className="text-[10px] opacity-75 mt-1">
                        Latest: "{voiceQueue[voiceQueue.length - 1]?.text.substring(0, 15)}..."
                     </div>
                  )}
               </div>
            </div>
         )}

         {/* Voice Commands Help - Top Right, below queue (only when listening and no queue) */}
         {isVoiceListening && voiceQueue.length === 0 && (
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
