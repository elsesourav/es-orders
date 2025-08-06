import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import IndexPage from "./IndexPage.jsx";
import { AuthProvider } from "./lib/AuthContext.jsx";
import { ThemeProvider } from "./lib/ThemeContext.jsx";

const container = document.getElementById("index-root");
const root = createRoot(container);

root.render(
   <React.StrictMode>
      <ThemeProvider>
         <AuthProvider>
            <IndexPage />
         </AuthProvider>
      </ThemeProvider>
   </React.StrictMode>
);
