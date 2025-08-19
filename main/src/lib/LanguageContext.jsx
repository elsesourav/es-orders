import { createContext, useEffect, useState } from "react";
import translations from "./translations.json";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
   const [currentLanguage, setCurrentLanguage] = useState("en");

   // Initialize language from localStorage on mount
   useEffect(() => {
      const savedLanguage = localStorage.getItem("es_orders_language");
      if (savedLanguage && (savedLanguage === "en" || savedLanguage === "bn")) {
         setCurrentLanguage(savedLanguage);
      }
   }, []);

   // Save language to localStorage when it changes
   const changeLanguage = (language) => {
      if (language === "en" || language === "bn") {
         setCurrentLanguage(language);
         localStorage.setItem("es_orders_language", language);
      }
   };

   // Translation function
   const t = (key) => {
      const keys = key.split(".");
      let value = translations[currentLanguage];

      for (const k of keys) {
         if (value && typeof value === "object" && k in value) {
            value = value[k];
         } else {
            // Fallback to English if translation not found
            value = translations.en;
            for (const fallbackKey of keys) {
               if (value && typeof value === "object" && fallbackKey in value) {
                  value = value[fallbackKey];
               } else {
                  return key; // Return the key itself if no translation found
               }
            }
            break;
         }
      }

      return typeof value === "string" ? value : key;
   };

   const value = {
      currentLanguage,
      changeLanguage,
      t,
      isEnglish: currentLanguage === "en",
      isBengali: currentLanguage === "bn",
   };

   return (
      <LanguageContext.Provider value={value}>
         {children}
      </LanguageContext.Provider>
   );
};

export default LanguageContext;
