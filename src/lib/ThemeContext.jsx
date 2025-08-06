import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

// Custom hook to use theme
export const useTheme = () => {
   const context = useContext(ThemeContext);
   if (!context) {
      throw new Error("useTheme must be used within a ThemeProvider");
   }
   return context;
};

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
   const [isDark, setIsDark] = useState(() => {
      // Check localStorage first, then system preference
      const saved = localStorage.getItem("theme");
      if (saved) {
         return saved === "dark";
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
   });

   useEffect(() => {
      // Update localStorage when theme changes
      localStorage.setItem("theme", isDark ? "dark" : "light");

      // Update document class
      if (isDark) {
         document.documentElement.classList.add("dark");
      } else {
         document.documentElement.classList.remove("dark");
      }
   }, [isDark]);

   const toggleTheme = () => {
      setIsDark(!isDark);
   };

   return (
      <ThemeContext.Provider value={{ isDark, toggleTheme }}>
         {children}
      </ThemeContext.Provider>
   );
};
