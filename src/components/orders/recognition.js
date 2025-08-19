// Voice Recognition Utilities for Order Navigation

// Clean number mapping (only exact words from grammar)
const NUMBER_MAP = {
   zero: 0,
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
   thirty: 30,
   forty: 40,
   fifty: 50,
   sixty: 60,
   seventy: 70,
   eighty: 80,
   ninety: 90,
   hundred: 100,
};

/**
 * Parse spoken number from text (0-1000) - Grammar-specific
 * @param {string} text - The text to parse
 * @returns {number|null} - Parsed number or null if not found
 */
export const parseSpokenNumber = (text) => {
   if (!text) return null;

   const cleanText = text.toLowerCase().trim();

   // Direct digit extraction
   const digitMatch = cleanText.match(/\d+/);
   if (digitMatch) {
      const num = parseInt(digitMatch[0]);
      return num <= 1000 ? num : null;
   }

   // Handle "thousand"
   if (cleanText.includes("thousand")) return 1000;

   // Complex hundreds (e.g., "five hundred sixty seven")
   const complexHundred = cleanText.match(
      /(one|two|three|four|five|six|seven|eight|nine)\s*hundred\s*(and\s*)?(.+)/i
   );
   if (complexHundred) {
      const hundreds = (NUMBER_MAP[complexHundred[1].toLowerCase()] || 1) * 100;
      const remainder = parseSpokenNumber(complexHundred[3]) || 0;
      const result = hundreds + remainder;
      return result <= 1000 ? result : null;
   }

   // Simple hundreds (e.g., "two hundred")
   const simpleHundred = cleanText.match(
      /(one|two|three|four|five|six|seven|eight|nine)\s*hundred$/i
   );
   if (simpleHundred) {
      return (NUMBER_MAP[simpleHundred[1].toLowerCase()] || 1) * 100;
   }

   // Compound numbers (e.g., "thirty one")
   const compound = cleanText.match(
      /(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)\s+(one|two|three|four|five|six|seven|eight|nine)/i
   );
   if (compound) {
      return (
         (NUMBER_MAP[compound[1].toLowerCase()] || 0) +
         (NUMBER_MAP[compound[2].toLowerCase()] || 0)
      );
   }

   // Single word numbers
   const words = cleanText.split(/\s+/);
   for (const word of words) {
      const cleanWord = word.replace(/[^\w]/g, "");
      if (NUMBER_MAP[cleanWord] !== undefined) {
         return NUMBER_MAP[cleanWord];
      }
   }

   return null;
};

/**
 * Extract order number from text using various patterns
 * @param {string} text - The text to parse
 * @returns {number|null} - Extracted order number or null
 */
export const extractOrderNumber = (text) => {
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
};

/**
 * Convert number to words for grammar generation (0-1000)
 * @param {number} num - Number to convert
 * @returns {string} - Number as words
 */
export const numberToWords = (num) => {
   if (num === 0) return "zero";
   if (num === 1000) return "one thousand";

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

   if (num >= 100) {
      const hundreds = Math.floor(num / 100);
      const remainder = num % 100;
      let result = ones[hundreds] + " hundred";
      if (remainder > 0) {
         if (remainder < 10) result += " " + ones[remainder];
         else if (remainder < 20) result += " " + teens[remainder - 10];
         else {
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

/**
 * Generate grammar words for Vosk recognition
 * @returns {string[]} - Array of grammar words
 */
export const generateGrammarWords = () => {
   // Generate all numbers from 0 to 1000
   const numbers = [];
   for (let i = 0; i <= 1000; i++) {
      numbers.push(numberToWords(i));
   }

   return [
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
};

/**
 * Create voice action definitions for order navigation
 * @param {Function} onNextOrder - Next order callback
 * @param {Function} onPrevOrder - Previous order callback
 * @param {Function} onSelectOrder - Select order callback
 * @param {number} ordersLength - Total number of orders
 * @returns {Object} - Voice actions configuration
 */
export const createVoiceActions = (
   onNextOrder,
   onPrevOrder,
   onSelectOrder,
   ordersLength
) => ({
   firstOrder: {
      patterns: [
         /^first\s+order$/i,
         /^open\s+first$/i,
         /^go\s+to\s+first$/i,
         /^go\s+first$/i,
         /^show\s+first$/i,
         /^select\s+first$/i,
         /^first$/i,
      ],
      action: () => {
         if (ordersLength > 0) {
            onSelectOrder(0);
            return "Opening first order";
         } else {
            throw new Error("No orders available");
         }
      },
   },
   lastOrder: {
      patterns: [
         /^last\s+order$/i,
         /^open\s+last$/i,
         /^go\s+to\s+last$/i,
         /^go\s+last$/i,
         /^show\s+last$/i,
         /^select\s+last$/i,
         /^last$/i,
      ],
      action: () => {
         if (ordersLength > 0) {
            onSelectOrder(ordersLength - 1);
            return "Opening last order";
         } else {
            throw new Error("No orders available");
         }
      },
   },
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
         return "Moving to next order";
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
         return "Moving to previous order";
      },
   },
   openOrder: {
      patterns: [
         /(?:open|show|select|go\s+to|go|goto|order)\s+(?!first|last)(.+)/i,
      ],
      action: (matches) => {
         const orderNumber = extractOrderNumber(matches.input);

         if (orderNumber && orderNumber > 0) {
            const orderIndex = orderNumber - 1; // Convert to 0-based index

            if (orderIndex >= 0 && orderIndex < ordersLength) {
               onSelectOrder(orderIndex);
               return `Opening order ${orderNumber}`;
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
});

/**
 * Speak text using Web Speech API
 * @param {string} text - Text to speak
 * @param {Object} options - Speech options
 * @param {Function} onStart - Callback when speech starts
 * @param {Function} onEnd - Callback when speech ends
 */
export const speakText = (text, options = {}, onStart = null, onEnd = null) => {
   if ("speechSynthesis" in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Configure speech parameters
      utterance.rate = options.rate || 1.1; // Slightly faster for better UX
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 0.8; // Slightly quieter
      utterance.lang = "en-US"; // Always English as requested

      // Add event listeners
      utterance.onstart = () => {
         if (onStart) onStart();
      };

      utterance.onend = () => {
         if (onEnd) onEnd();
      };

      utterance.onerror = () => {
         if (onEnd) onEnd(); // Also call onEnd on error to resume listening
      };

      // Speak the text
      window.speechSynthesis.speak(utterance);

      return true;
   }
   return false;
};

/**
 * Process voice command transcript and execute actions
 * @param {string} transcript - The recognized transcript
 * @param {Object} voiceActions - Voice actions configuration
 * @param {boolean} enableSpeech - Whether to enable text-to-speech feedback
 * @param {Function} onSpeechStart - Callback when speech starts
 * @param {Function} onSpeechEnd - Callback when speech ends
 * @returns {Object} - Result with success status and message
 */
export const processVoiceCommand = (
   transcript,
   voiceActions,
   enableSpeech = true,
   onSpeechStart = null,
   onSpeechEnd = null
) => {
   // Try to match against all action patterns
   for (const [, actionDef] of Object.entries(voiceActions)) {
      for (const pattern of actionDef.patterns) {
         const matches = transcript.match(pattern);
         if (matches) {
            try {
               const result = actionDef.action(matches);

               // Speak the result if speech is enabled and command was successful
               if (enableSpeech && result) {
                  speakText(result, {}, onSpeechStart, onSpeechEnd);
               }

               return {
                  success: true,
                  message: result,
                  type: "success",
               };
            } catch (error) {
               return {
                  success: false,
                  message: error.message,
                  type: "error",
               };
            }
         }
      }
   }

   // If no action matched
   return {
      success: false,
      message: `"${transcript}" - not recognized`,
      type: "info",
   };
};
