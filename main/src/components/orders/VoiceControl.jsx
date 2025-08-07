import { Mic, MicOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

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
      recognition.lang = "en-US";

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
         const transcript = event.results[
            event.results.length - 1
         ][0].transcript
            .toLowerCase()
            .trim();
         console.log("Voice command:", transcript);
         setVoiceStatus(`Heard: "${transcript}"`);

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

         // Process voice commands
         if (
            transcript.includes("next order") ||
            transcript.includes("next orders")
         ) {
            onNextOrder();
            setVoiceStatus("Next");
            setVoiceStatusType("success");
            setShowVoiceStatus(true);
            setTimeout(() => setShowVoiceStatus(false), 1500);
         } else if (
            transcript.includes("previous order") ||
            transcript.includes("previous orders") ||
            transcript.includes("prev order")
         ) {
            onPrevOrder();
            setVoiceStatus("Previous");
            setVoiceStatusType("success");
            setShowVoiceStatus(true);
            setTimeout(() => setShowVoiceStatus(false), 1500);
         } else if (transcript.includes("open")) {
            let orderNumber = null;

            // First try to extract digit number
            const digitMatch = transcript.match(/open\s+(\d+)/);
            if (digitMatch) {
               orderNumber = parseInt(digitMatch[1]);
            } else {
               // Try to extract spoken number
               const spokenNumber = convertSpokenToNumber(transcript);
               if (spokenNumber !== null) {
                  orderNumber = spokenNumber;
               }
            }

            if (orderNumber !== null) {
               const orderIndex = orderNumber - 1; // Convert to 0-based index
               if (orderIndex >= 0 && orderIndex < ordersLength) {
                  onSelectOrder(orderIndex);
                  setVoiceStatus(`Order ${orderNumber}`);
                  setVoiceStatusType("success");
                  setShowVoiceStatus(true);
                  setTimeout(() => setShowVoiceStatus(false), 1500);
               } else {
                  setVoiceStatus(`#${orderNumber} not found`);
                  setVoiceStatusType("error");
                  setShowVoiceStatus(true);
                  setTimeout(() => setShowVoiceStatus(false), 2000);
               }
            } else {
               setVoiceStatus("Number unclear");
               setVoiceStatusType("error");
               setShowVoiceStatus(true);
               setTimeout(() => setShowVoiceStatus(false), 1500);
            }
         }
      };

      recognitionRef.current = recognition;
      return recognition;
   }, [onNextOrder, onPrevOrder, onSelectOrder, ordersLength, shouldStopVoice]);

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
