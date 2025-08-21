import { useEffect, useState } from "react";
import { FontSizeContext } from "./fontSizeContext";

export const FontSizeProvider = ({ children }) => {
   const [fontSize, setFontSize] = useState("medium"); // small, medium, large

   // Load font size from localStorage on mount
   useEffect(() => {
      const savedFontSize = localStorage.getItem("es_orders_font_size");
      if (
         savedFontSize &&
         ["small", "medium", "large"].includes(savedFontSize)
      ) {
         setFontSize(savedFontSize);
         applyFontSize(savedFontSize);
      } else {
         // Set default to medium
         applyFontSize("medium");
      }
   }, []);

   // Apply font size to document root
   const applyFontSize = (size) => {
      const root = document.documentElement;

      // Remove existing font size classes
      root.classList.remove(
         "font-size-small",
         "font-size-medium",
         "font-size-large"
      );

      // Add new font size class
      root.classList.add(`font-size-${size}`);
   };

   // Change font size
   const changeFontSize = (newSize) => {
      if (["small", "medium", "large"].includes(newSize)) {
         setFontSize(newSize);
         localStorage.setItem("es_orders_font_size", newSize);
         applyFontSize(newSize);
      }
   };

   const value = {
      fontSize,
      changeFontSize,
   };

   return (
      <FontSizeContext.Provider value={value}>
         {children}
      </FontSizeContext.Provider>
   );
};
