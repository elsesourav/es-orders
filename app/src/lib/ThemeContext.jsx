import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { Appearance, Platform } from "react-native";

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
      return Appearance.getColorScheme() === "dark";
   });

   useEffect(() => {
      // Load saved theme preference
      const loadTheme = async () => {
         try {
            const saved = await AsyncStorage.getItem("theme");
            if (saved) {
               setIsDark(saved === "dark");
            }
         } catch (error) {
            console.error("Error loading theme:", error);
         }
      };

      loadTheme();
   }, []);

   useEffect(() => {
      // Save theme preference when it changes
      const saveTheme = async () => {
         try {
            await AsyncStorage.setItem("theme", isDark ? "dark" : "light");

            // For web, also update the document class for NativeWind
            if (Platform.OS === "web") {
               if (isDark) {
                  document.documentElement.classList.add("dark");
               } else {
                  document.documentElement.classList.remove("dark");
               }
            }
         } catch (error) {
            console.error("Error saving theme:", error);
         }
      };

      saveTheme();
   }, [isDark]);

   const toggleTheme = () => {
      setIsDark(!isDark);
   };

   const theme = {
      isDark,
      colors: {
         primary: isDark ? "#3B82F6" : "#2563EB",
         background: isDark ? "#1F2937" : "#FFFFFF",
         surface: isDark ? "#374151" : "#F9FAFB",
         text: isDark ? "#F9FAFB" : "#1F2937",
         textSecondary: isDark ? "#D1D5DB" : "#6B7280",
         border: isDark ? "#4B5563" : "#E5E7EB",
         card: isDark ? "#374151" : "#FFFFFF",
      },
   };

   return (
      <ThemeContext.Provider value={{ isDark, toggleTheme, theme }}>
         {children}
      </ThemeContext.Provider>
   );
};
