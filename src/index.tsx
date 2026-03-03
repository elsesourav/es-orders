import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import IndexPage from "./IndexPage";
import { AuthProvider } from "./lib/AuthContext";
import { FontSizeProvider } from "./lib/FontSizeContext";
import { LanguageProvider } from "./lib/LanguageContext";
import { ThemeProvider } from "./lib/ThemeContext";

const container = document.getElementById("index-root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <LanguageProvider>
      <ThemeProvider>
        <FontSizeProvider>
          <AuthProvider>
            <IndexPage />
          </AuthProvider>
        </FontSizeProvider>
      </ThemeProvider>
    </LanguageProvider>
  </React.StrictMode>,
);
