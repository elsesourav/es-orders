import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import IndexPage from "./IndexPage.jsx";
import { AuthProvider } from "./lib/AuthContext.jsx";
import { LanguageProvider } from "./lib/LanguageContext.jsx";
import { ThemeProvider } from "./lib/ThemeContext.jsx";
import { VoiceSettingsProvider } from "./lib/VoiceSettingsContext.jsx";

const container = document.getElementById("index-root");
const root = createRoot(container);

root.render(
   <React.StrictMode>
      <LanguageProvider>
         <ThemeProvider>
            <VoiceSettingsProvider>
               <AuthProvider>
                  <IndexPage />
               </AuthProvider>
            </VoiceSettingsProvider>
         </ThemeProvider>
      </LanguageProvider>
   </React.StrictMode>
);
